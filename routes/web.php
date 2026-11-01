<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing / Welcome
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// Dashboard Utama
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');

// Domain Route Modules
require __DIR__ . '/auth.php';
require __DIR__ . '/profile.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/users.php';
require __DIR__ . '/audit.php';
require __DIR__ . '/dataport.php';
