<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfilePrivacyController extends Controller
{
    /**
     * Unduh seluruh salinan data akun pengguna dalam format JSON (GDPR Data Portability).
     */
    public function export(Request $request)
    {
        $user = $request->user()->load('roles.permissions');

        $auditLogs = AuditLog::where('user_id', $user->id)
            ->latest('id')
            ->limit(100)
            ->get(['id', 'action', 'description', 'ip_address', 'created_at']);

        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->get(['id', 'ip_address', 'user_agent', 'last_activity']);

        $exportData = [
            'export_metadata' => [
                'system' => 'BlockAuth',
                'exported_at' => now()->toIso8601String(),
                'legal_reference' => 'Right to Data Portability (Article 20 GDPR & UU PDP)',
            ],
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'avatar_url' => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'security' => [
                'two_factor_enabled' => $user->hasTwoFactorEnabled(),
                'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
                'active_sessions_count' => $sessions->count(),
            ],
            'roles_and_permissions' => [
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'recent_activity_logs' => $auditLogs,
        ];

        AuditLog::record('profile:data_export', 'Mengunduh salinan arsip data akun lengkap (GDPR Export)');

        $fileName = 'blockauth-data-export-' . $user->id . '-' . date('YmdHis') . '.json';
        $json = json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return response($json, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    /**
     * Hapus akun pengguna secara permanen atas permintaan mandiri (Right to be Forgotten).
     */
    public function destroy(Request $request)
    {
        $user = $request->user();

        // Pencegahan agar sistem tidak terkunci tanpa SuperAdmin
        if ($user->isSuperAdmin() && User::role('SuperAdmin')->count() <= 1) {
            throw ValidationException::withMessages([
                'password' => ['Akun Anda adalah satu-satunya SuperAdmin di sistem. Tetapkan role SuperAdmin ke pengguna lain terlebih dahulu sebelum menghapus akun ini.'],
            ]);
        }

        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ]);

        AuditLog::record(
            'profile:account_deleted',
            "Pengguna {$user->name} ({$user->email}) menghapus akunnya sendiri secara mandiri",
            ['user_id' => $user->id, 'email' => $user->email]
        );

        // Hapus foto profil fisik jika tersimpan
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Hapus sesi pengguna di database
        DB::table('sessions')->where('user_id', $user->id)->delete();

        // Logout dan bersihkan session
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Hapus record user
        $user->delete();

        return redirect()->route('login')->with('info', 'Akun Anda telah berhasil dihapus secara permanen.');
    }
}
