<?php

declare(strict_types=1);

use App\Http\Controllers\Settings\AvatarController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function (): void {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('settings/profile/avatar', [AvatarController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('profile.avatar.store');
    Route::delete('settings/profile/avatar', [AvatarController::class, 'destroy'])
        ->middleware('throttle:6,1')
        ->name('profile.avatar.destroy');
    Route::patch('settings/profile', [ProfileController::class, 'update'])
        ->middleware('precognitive')
        ->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])
        ->middleware('precognitive')
        ->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

});

Route::get('.well-known/passkey-endpoints', fn () => response()->json([
    'enroll' => route('security.edit'),
    'manage' => route('security.edit'),
]))->name('well-known.passkeys');
