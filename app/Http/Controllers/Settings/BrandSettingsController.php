<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UpdateBrandSettings;
use App\Enums\BrandAsset;
use App\Enums\BrandColorPreset;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandSettingsRequest;
use App\Settings\BrandSettings;
use App\Support\BrandPalette;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BrandSettingsController extends Controller
{
    public function edit(BrandSettings $settings): Response
    {
        return Inertia::render('settings/brand', [
            'settings' => ['color_preset' => $settings->color_preset->value],
            'colorPresets' => array_map(
                fn (BrandColorPreset $preset): array => [
                    'value' => $preset->value,
                    'label' => $preset->label(),
                    'preview' => BrandPalette::previewColor($preset),
                ],
                BrandColorPreset::cases(),
            ),
            'themeTokens' => BrandPalette::tokens($settings->color_preset),
            'assets' => array_map(
                fn (BrandAsset $asset): array => [
                    'value' => $asset->value,
                    'label' => $asset->label(),
                    'accept' => implode(',', $asset->mimeTypes()),
                    'maxSizeBytes' => $asset->maxKilobytes() * 1024,
                    'file' => $settings->assetData($asset),
                ],
                BrandAsset::cases(),
            ),
        ]);
    }

    public function update(
        UpdateBrandSettingsRequest $request,
        BrandSettings $settings,
        UpdateBrandSettings $updateBrandSettings,
    ): RedirectResponse {
        $updateBrandSettings->handle($settings, $request->validatedData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('brand_settings.message.updated')]);

        return to_route('settings.brand.edit');
    }
}
