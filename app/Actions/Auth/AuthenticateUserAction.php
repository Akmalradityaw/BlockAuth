<?php

namespace App\Actions\Auth;

use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticateUserAction
{
    public function execute(string $login, string $password, bool $remember = false): void
    {
        $fieldType = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $credentials = [$fieldType => $login, 'password' => $password];

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'login' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
            ]);
        }
    }
}
