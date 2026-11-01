<?php

namespace App\Http\Controllers\Profile;

use App\Actions\Profile\UpdateUserProfileTextAction;
use App\DataTransferObjects\Profile\UpdateProfileData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Models\AuditLog;
use App\Support\AgentParser;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Tampilkan halaman edit profil beserta daftar sesi perangkat aktif.
     */
    public function edit(): Response
    {
        $currentSessionId = request()->session()->getId();

        $sessions = DB::table('sessions')
            ->where('user_id', auth()->id())
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) use ($currentSessionId) {
                $agent = AgentParser::parse($session->user_agent);

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address ?? '127.0.0.1',
                    'is_current_device' => $session->id === $currentSessionId,
                    'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'browser' => $agent['browser'],
                    'platform' => $agent['platform'],
                    'device_type' => $agent['device_type'],
                ];
            });

        return Inertia::render('Profile/Edit', [
            'user' => array_merge(
                auth()->user()->only(['id', 'name', 'email', 'bio', 'avatar_path', 'avatar_url']),
                ['two_factor_enabled' => auth()->user()->hasTwoFactorEnabled()]
            ),
            'sessions' => $sessions,
        ]);
    }

    /**
     * Perbarui data teks profil (nama, email, bio).
     */
    public function update(UpdateProfileRequest $request, UpdateUserProfileTextAction $action)
    {
        Gate::authorize('update', $request->user());

        $action->execute(
            $request->user(),
            UpdateProfileData::fromArray($request->validated())
        );

        AuditLog::record('profile:update', 'Memperbarui data teks profil akun');

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Hapus akun pengguna sendiri dengan konfirmasi kata sandi.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'Kata sandi wajib diisi untuk mengonfirmasi penghapusan akun.',
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Kata sandi yang Anda masukkan tidak sesuai.'],
            ]);
        }

        $user = $request->user();

        AuditLog::record('account:delete', 'Menghapus akun mandiri secara permanen', [
            'user_id' => $user->id,
            'email' => $user->email,
        ], $user);

        auth()->guard('web')->logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Akun Anda berhasil dihapus.');
    }
}

