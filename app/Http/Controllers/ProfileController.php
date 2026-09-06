<?php

namespace App\Http\Controllers;

use App\Actions\Profile\UpdateUserProfileTextAction;
use App\DataTransferObjects\UpdateProfileData;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Profile/Edit', [
            'user' => auth()->user()->only([
                'id', 'name', 'email', 'bio', 'avatar_path', 'avatar_url',
            ]),
        ]);
    }

    public function update(UpdateProfileRequest $request, UpdateUserProfileTextAction $action)
    {
        Gate::authorize('update', $request->user());

        $action->execute(
            $request->user(),
            UpdateProfileData::fromArray($request->validated())
        );

        return back()->with('status', 'Profil berhasil diperbarui.');
    }
}
