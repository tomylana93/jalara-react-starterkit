<?php

declare(strict_types=1);

use App\Http\Controllers\Settings\BrandAssetController;
use App\Http\Controllers\Settings\BrandSettingsController;
use App\Http\Controllers\Settings\GeneralSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('settings')->name('settings.')->group(function (): void {
    Route::redirect('/', '/settings/general');

    Route::get('general', [GeneralSettingsController::class, 'edit'])->name('general.edit');
    Route::patch('general', [GeneralSettingsController::class, 'update'])
        ->middleware('precognitive')
        ->name('general.update');

    Route::get('brand', [BrandSettingsController::class, 'edit'])->name('brand.edit');
    Route::patch('brand', [BrandSettingsController::class, 'update'])
        ->middleware('precognitive')
        ->name('brand.update');
    Route::post('brand/assets/{asset}', [BrandAssetController::class, 'store'])->name('brand.assets.store');
    Route::delete('brand/assets/{asset}', [BrandAssetController::class, 'destroy'])->name('brand.assets.destroy');
});
