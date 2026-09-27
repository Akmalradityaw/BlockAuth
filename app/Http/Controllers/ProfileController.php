<?php

namespace App\Http\Controllers;

use App\Actions\Profile\UpdateUserProfileTextAction;
use App\DataTransferObjects\UpdateProfileData;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\AuditLog;
use App\Support\AgentParser;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
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

        $user = auth()->user();

        $tokens = $user->tokens()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'abilities' => $token->abilities,
                    'last_used_at' => $token->last_used_at ? Carbon::parse($token->last_used_at)->diffForHumans() : 'Belum pernah',
                    'created_at' => Carbon::parse($token->created_at)->translatedFormat('d M Y, H:i'),
                ];
            });

        $passkeys = $user->passkeys()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pk) {
                return [
                    'id' => $pk->id,
                    'name' => $pk->name,
                    'last_used_at' => $pk->last_used_at ? Carbon::parse($pk->last_used_at)->diffForHumans() : 'Belum pernah',
                    'created_at' => Carbon::parse($pk->created_at)->translatedFormat('d M Y, H:i'),
                ];
            });

        return Inertia::render('Profile/Edit', [
            'user' => $user->only([
                'id', 'name', 'email', 'bio', 'avatar_path', 'avatar_url',
            ]),
            'sessions' => $sessions,
            'tokens' => $tokens,
            'passkeys' => $passkeys,
            'newToken' => session('new_token'),
        ]);
    }

    public function update(UpdateProfileRequest $request, UpdateUserProfileTextAction $action)
    {
        Gate::authorize('update', $request->user());

        $action->execute(
            $request->user(),
            UpdateProfileData::fromArray($request->validated())
        );

        if (class_exists(AuditLog::class)) {
            AuditLog::record('profile:update', 'Memperbarui data profil akun');
        }

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}