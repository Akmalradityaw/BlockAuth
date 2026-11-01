<?php

use App\Http\Controllers\User\ImpersonationController;
use App\Http\Controllers\User\RolePermissionController;
use App\Http\Controllers\User\UserBulkController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\UserImportExportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::middleware('feature:users')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/impersonate', [ImpersonationController::class, 'store'])->name('users.impersonate');

        // Ekspor, Impor, dan Unduh Template (9 Format)
        Route::get('/users/export', [UserImportExportController::class, 'export'])->name('users.export');
        Route::get('/users/export/download', [UserImportExportController::class, 'download'])->name('users.export.download');
        Route::get('/users/import/template', [UserImportExportController::class, 'template'])->name('users.import.template');
        Route::post('/users/import', [UserImportExportController::class, 'import'])->name('users.import');

        // Operasi Massal (Bulk Actions)
        Route::post('/users/bulk-delete', [UserBulkController::class, 'destroy'])->name('users.bulk.destroy');
        Route::post('/users/bulk-role', [UserBulkController::class, 'role'])->name('users.bulk.role');
        Route::post('/users/bulk-verify', [UserBulkController::class, 'verify'])->name('users.bulk.verify');
    });

    Route::post('/impersonation/stop', [ImpersonationController::class, 'destroy'])->name('impersonation.stop');

    Route::middleware('feature:roles')->group(function () {
        Route::get('/roles/permissions', [RolePermissionController::class, 'index'])->name('roles.permissions');
        Route::put('/roles/permissions', [RolePermissionController::class, 'update'])->name('roles.permissions.update');
    });
});
