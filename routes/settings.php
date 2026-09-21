<?php

declare(strict_types=1);

use App\Http\Controllers\Settings\GeneralSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('settings')->name('settings.')->group(function (): void {
    Route::redirect('/', '/settings/general');

    Route::get('general', [GeneralSettingsController::class, 'edit'])->name('general.edit');
    Route::patch('general', [GeneralSettingsController::class, 'update'])
        ->middleware('precognitive')
        ->name('general.update');
});
