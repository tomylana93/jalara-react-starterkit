<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\DeleteBrandAsset;
use App\Actions\Settings\StoreBrandAsset;
use App\Enums\BrandAsset;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreBrandAssetRequest;
use App\Settings\BrandSettings;
use Illuminate\Http\JsonResponse;

class BrandAssetController extends Controller
{
    public function store(
        StoreBrandAssetRequest $request,
        BrandAsset $asset,
        BrandSettings $settings,
        StoreBrandAsset $storeBrandAsset,
    ): JsonResponse {
        $storeBrandAsset->handle($settings, $request->file('file'), $asset);
        $settings->refresh();

        return response()->json(['data' => $settings->assetData($asset)], 201);
    }

    public function destroy(
        BrandAsset $asset,
        BrandSettings $settings,
        DeleteBrandAsset $deleteBrandAsset,
    ): JsonResponse {
        $deleteBrandAsset->handle($settings, $asset);

        return response()->json(['data' => null]);
    }
}
