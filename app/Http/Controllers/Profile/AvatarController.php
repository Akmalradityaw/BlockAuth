<?php

namespace App\Http\Controllers\Profile;

use App\Actions\Profile\UploadUserAvatarAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\AvatarUploadRequest;
use Illuminate\Support\Facades\Gate;

class AvatarController extends Controller
{
    public function update(AvatarUploadRequest $request, UploadUserAvatarAction $action)
    {
        Gate::authorize('update', $request->user());

        $action->execute($request->user(), $request->file('avatar'));

        return back()->with('success', 'Avatar berhasil diperbarui.');
    }
}

