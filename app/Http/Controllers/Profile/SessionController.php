<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    /**
     * Cabut satu sesi perangkat tertentu milik user.
     */
    public function destroy(Request $request, string $id)
    {
        $currentSessionId = $request->session()->getId();

        if ($id === $currentSessionId) {
            return back()->with('error', 'Tidak dapat mencabut sesi perangkat yang sedang aktif saat ini.');
        }

        $deleted = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        if ($deleted) {
            AuditLog::record('session:destroy', 'Mencabut satu sesi perangkat aktif', ['session_id' => $id]);

            return back()->with('success', 'Sesi perangkat berhasil dicabut.');
        }

        return back()->with('error', 'Sesi tidak ditemukan atau sudah kadaluarsa.');
    }

    /**
     * Cabut seluruh sesi perangkat lain setelah konfirmasi password.
     */
    public function destroyOther(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'Kata sandi wajib diisi untuk konfirmasi.',
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Kata sandi yang Anda masukkan tidak sesuai.'],
            ]);
        }

        $currentSessionId = $request->session()->getId();

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        AuditLog::record('session:revoke_others', 'Mencabut seluruh sesi perangkat lain');

        return back()->with('success', 'Seluruh sesi perangkat lain berhasil dicabut.');
    }
}

