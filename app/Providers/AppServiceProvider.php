<?php

namespace App\Providers;

use App\Models\Setting;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        \App\Support\MailConfigurator::configure();

        Password::defaults(function () {
            $policy = Setting::get('security.password_policy', []);
            $rule = Password::min((int) ($policy['min_length'] ?? 8));

            if (! empty($policy['require_uppercase'])) {
                $rule->letters()->mixedCase();
            }

            if (! empty($policy['require_numeric'])) {
                $rule->numbers();
            }

            if (! empty($policy['require_special_char'])) {
                $rule->symbols();
            }

            if (! empty($policy['check_pwned_passwords'])) {
                $rule->uncompromised();
            }

            return $rule;
        });
    }
}
