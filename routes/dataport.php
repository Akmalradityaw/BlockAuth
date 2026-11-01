<?php

use App\Http\Controllers\DataPort\DataPortController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/export-import', [DataPortController::class, 'index'])->name('data-port.index');
    Route::get('/data-port', fn () => redirect()->route('data-port.index'));
});

