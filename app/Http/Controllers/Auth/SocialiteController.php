<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\HandleSocialiteCallbackAction;
use App\DataTransferObjects\SocialiteData;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect(string $provider)
    {
        $this->ensureProviderAllowed($provider);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider, HandleSocialiteCallbackAction $action)
    {
        $this->ensureProviderAllowed($provider);

        $socialUser = Socialite::driver($provider)->user();

        $user = $action->execute(new SocialiteData(
            provider: $provider,
            providerId: $socialUser->getId(),
            name: $socialUser->getName() ?: $socialUser->getNickname() ?: 'User',
            email: $socialUser->getEmail(),
            token: $socialUser->token ?? null,
            avatar: $socialUser->getAvatar() ?? null,
        ));

        Auth::login($user, true);

        return redirect()->intended(route('dashboard'));
    }

    protected function ensureProviderAllowed(string $provider): void
    {
        abort_unless(in_array($provider, ['google', 'github']), 404);
    }
}
