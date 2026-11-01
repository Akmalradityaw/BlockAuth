<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\HandleSocialiteCallbackAction;
use App\DataTransferObjects\SocialiteData;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\OAuthProviderRepository;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect(string $provider)
    {
        $driver = OAuthProviderRepository::configureSocialite($provider);

        return Socialite::driver($driver)->redirect();
    }

    public function callback(string $provider, HandleSocialiteCallbackAction $action)
    {
        $driver = OAuthProviderRepository::configureSocialite($provider);

        try {
            $socialUser = Socialite::driver($driver)->user();
        } catch (\Throwable $e) {
            report($e);

            return redirect()
                ->route('login')
                ->with('error', 'Autentikasi OAuth gagal atau dibatalkan. Pastikan kredensial provider valid.');
        }

        $user = $action->execute(new SocialiteData(
            provider: $provider,
            providerId: $socialUser->getId(),
            name: $socialUser->getName() ?: $socialUser->getNickname() ?: 'User',
            email: $socialUser->getEmail(),
            token: $socialUser->token ?? null,
            avatar: $socialUser->getAvatar() ?? null,
        ));

        Auth::login($user, true);

        AuditLog::record('auth:login', 'Berhasil masuk ke sistem via ' . ucfirst($provider), [
            'provider' => $provider,
            'driver' => $driver,
            'email' => $user->email,
        ], $user);

        return redirect()
            ->intended(route('dashboard'))
            ->with('success', 'Berhasil masuk dengan ' . ucfirst($provider) . '.');
    }
}
