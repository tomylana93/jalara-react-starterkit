<?php

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', fn (Request $request): RedirectResponse => $request->user()
    ? redirect()->intended(route('dashboard'))
    : to_route('login'))->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
