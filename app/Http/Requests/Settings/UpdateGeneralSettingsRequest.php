<?php

declare(strict_types=1);

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGeneralSettingsRequest extends FormRequest
{
    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'application_name' => ['required', 'string', 'max:100'],
            'application_description' => ['present', 'nullable', 'string', 'max:500'],
            'contact_email' => ['present', 'nullable', 'email', 'max:254'],
            'default_locale' => ['required', 'string', Rule::in(config()->array('localization.locales'))],
            'timezone' => ['required', 'string', Rule::in(timezone_identifiers_list())],
        ];
    }
}
