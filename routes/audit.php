<?php

use App\Http\Controllers\Audit\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'feature:audit_logs'])->group(function () {
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
    Route::get('/audit-logs/export/download', [AuditLogController::class, 'download'])->name('audit-logs.export.download');
});
