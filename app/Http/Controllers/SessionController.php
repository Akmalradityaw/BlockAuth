<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\AgentParser;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SessionController extends Controller
{
    public function globalIndex(Request $request)
    {
        Gate::authorize('settings:read');

        $search = $request->input('search');

        $sessionsQuery = DB::table('sessions')
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->select([
                'sessions.id',
                'sessions.user_id',
                'sessions.ip_address',
                'sessions.user_agent',
                'sessions.last_activity',
                'users.name as user_name',
                'users.email as user_email',
                'users.avatar_path',
            ]);

        if ($search) {
            $sessionsQuery->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                  ->orWhere('users.email', 'like', "%{$search}%")
                  ->orWhere('sessions.ip_address', 'like', "%{$search}%");
            });
        }

        $rawSessions = $sessionsQuery->orderBy('sessions.last_activity', 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        $currentSessionId = $request->session()->getId();

        $userIds = $rawSessions->getCollection()->pluck('user_id')->unique();
        $usersWithRoles = User::with('roles')->whereIn('id', $userIds)->get()->keyBy('id');

        $rawSessions->getCollection()->transform(function ($sess) use ($currentSessionId, $usersWithRoles) {
            $agent = AgentParser::parse($sess->user_agent);
            $user = $usersWithRoles->get($sess->user_id);
            $roles = $user ? $user->roles->pluck('name')->all() : [];

            return [
                'id' => $sess->id,
                'user_id' => $sess->user_id,
                'user_name' => $sess->user_name,
                'user_email' => $sess->user_email,
                'user_roles' => $roles,
                'avatar_url' => $user ? $user->avatar_url : null,
                'ip_address' => $sess->ip_address,
                'platform' => $agent['platform'],
                'browser' => $agent['browser'],
                'is_mobile' => in_array($agent['device_type'], ['mobile', 'tablet']),
                'is_current' => $sess->id === $currentSessionId,
                'last_activity_human' => Carbon::createFromTimestamp($sess->last_activity)->diffForHumans(),
                'last_active_at' => Carbon::createFromTimestamp($sess->last_activity)->format('d M Y, H:i'),
            ];
        });

        $totalSessions = DB::table('sessions')->count();
        $uniqueUsers = DB::table('sessions')->distinct('user_id')->count('user_id');

        $allAgents = DB::table('sessions')->pluck('user_agent');
        $mobileCount = 0;
        foreach ($allAgents as $ua) {
            $parsed = AgentParser::parse($ua);
            if (in_array($parsed['device_type'], ['mobile', 'tablet'])) {
                $mobileCount++;
            }
        }
        $desktopCount = $totalSessions - $mobileCount;

        $stats = [
            'total' => $totalSessions,
            'unique_users' => $uniqueUsers,
            'desktop' => $desktopCount,
            'mobile' => $mobileCount,
        ];

        return Inertia::render('Security/Sessions', [
            'sessions' => $rawSessions,
            'filters' => $request->only(['search']),
            'stats' => $stats,
        ]);
    }

    public function adminDestroy(Request $request, string $id)
    {
        Gate::authorize('settings:manage');

        $currentSessionId = $request->session()->getId();
        if ($id === $currentSessionId) {
            return back()->with('error', 'Tidak dapat memutuskan sesi Anda sendiri melalui modul ini.');
        }

        $session = DB::table('sessions')->where('id', $id)->first();
        if ($session) {
            DB::table('sessions')->where('id', $id)->delete();

            if (class_exists(AuditLog::class)) {
                AuditLog::record('session:admin_terminate', "Administrator memutuskan sesi ID: {$id}", ['ip' => $session->ip_address, 'user_id' => $session->user_id]);
            }

            return back()->with('success', 'Sesi pengguna berhasil diputuskan dari sistem.');
        }

        return back()->with('error', 'Sesi tidak ditemukan atau sudah kadaluarsa.');
    }
    public function destroy(Request $request, string $id)
    {
        $currentSessionId = $request->session()->getId();

        if ($id === $currentSessionId) {
            return back()->with('error', 'Tidak dapat mencabut sesi perangkat yang sedang aktif saat ini. Silakan gunakan tombol keluar.');
        }

        $deleted = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        if ($deleted) {
            if (class_exists(AuditLog::class)) {
                AuditLog::record('session:revoke', 'Mencabut sesi perangkat login lain');
            }

            return back()->with('success', 'Sesi perangkat berhasil dicabut.');
        }

        return back()->with('error', 'Sesi tidak ditemukan atau sudah berakhir.');
    }

    public function destroyOther(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Kata sandi yang dimasukkan salah.'],
            ]);
        }

        $currentSessionId = $request->session()->getId();

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        if (class_exists(AuditLog::class)) {
            AuditLog::record('session:revoke_others', 'Mencabut seluruh sesi perangkat lain yang aktif');
        }

        return back()->with('success', 'Seluruh sesi perangkat lain berhasil dicabut.');
    }
}
