<?php

namespace App\Http\Controllers;

use App\Actions\Profile\UploadUserAvatarAction;
use App\Http\Requests\AvatarUploadRequest;
use Illuminate\Support\Facades\Gate;

class AvatarController extends Controller
{
    public function update(AvatarUploadRequest $request, UploadUserAvatarAction $action)
    {
        Gate::authorize('update', $request->user());

        $action->execute($request->user(), $request->file('avatar'));

        return back()->with('status', 'Avatar berhasil diperbarui.');
    }
}
