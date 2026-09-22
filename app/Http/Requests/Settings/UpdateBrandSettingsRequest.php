<?php

declare(strict_types=1);

namespace App\Http\Requests\Settings;

use App\Enums\BrandColorPreset;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateBrandSettingsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return ['color_preset' => ['required', new Enum(BrandColorPreset::class)]];
    }

    /** @return array{color_preset: string} */
    public function validatedData(): array
    {
        return ['color_preset' => $this->string('color_preset')->toString()];
    }
}
