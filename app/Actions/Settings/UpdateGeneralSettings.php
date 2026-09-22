<?php

declare(strict_types=1);

namespace App\Actions\Settings;

use App\Settings\GeneralSettings;
use Illuminate\Support\Facades\App;

class UpdateGeneralSettings
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(GeneralSettings $settings, array $data): void
    {
        $settings->application_name = $data['application_name'];
        $settings->application_description = $data['application_description'];
        $settings->contact_email = $data['contact_email'];
        $settings->default_locale = $data['default_locale'];
        $settings->timezone = $data['timezone'];
        $settings->save();

        App::setLocale($settings->default_locale);
    }
}
