<?php

namespace App\Actions\Profile;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class UploadUserAvatarAction
{
    public function execute(User $user, UploadedFile $file): User
    {
        $image = Image::read($file->getRealPath());
        $image->cover(300, 300);

        $filename = 'avatars/' . $user->id . '_' . time() . '.jpg';

        $encoded = $image->toJpeg(85);

        Storage::disk('public')->put($filename, (string) $encoded);

        $this->deleteOldAvatar($user);

        $user->update(['avatar_path' => $filename]);

        return $user->refresh();
    }

    protected function deleteOldAvatar(User $user): void
    {
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }
    }
}
