<?php

declare(strict_types=1);

namespace App\Http\Requests\Settings;

use App\Enums\BrandAsset;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreBrandAssetRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $asset = $this->brandAsset();
        $dimensions = $asset->maxDimensions();

        return [
            'file' => [
                'bail',
                'required',
                File::image()->dimensions(
                    Rule::dimensions()->maxWidth($dimensions['width'])->maxHeight($dimensions['height']),
                ),
                File::types($asset->mimeTypes())->max($asset->maxKilobytes()),
                'extensions:'.implode(',', $asset->extensions()),
            ],
        ];
    }

    private function brandAsset(): BrandAsset
    {
        $asset = $this->route('asset');

        return $asset instanceof BrandAsset ? $asset : BrandAsset::from((string) $asset);
    }
}
