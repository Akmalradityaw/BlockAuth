<?php

namespace App\Http\Controllers;

use App\Actions\Profile\UploadUserAvatarAction;
use App\Http\Requests\AvatarUploadRequest;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Gate;

class AvatarController extends Controller
{
    public function update(AvatarUploadRequest $request, UploadUserAvatarAction $action)
    {
        Gate::authorize('update', $request->user());

        $action->execute($request->user(), $request->file('avatar'));

        AuditLog::record('profile:avatar_update', 'Mengunggah dan memperbarui foto profil');

        return back()->with('success', 'Avatar berhasil diperbarui.');
    }
}