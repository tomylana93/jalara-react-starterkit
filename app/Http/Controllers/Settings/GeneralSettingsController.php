<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateGeneralSettingsRequest;
use App\Settings\GeneralSettings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GeneralSettingsController extends Controller
{
    public function edit(GeneralSettings $settings): Response
    {
        return Inertia::render('settings/general', [
            'settings' => [
                'application_name' => $settings->application_name,
                'application_description' => $settings->application_description ?? '',
                'contact_email' => $settings->contact_email ?? '',
                'default_locale' => $settings->default_locale,
                'timezone' => $settings->timezone,
            ],
            'locales' => config()->array('localization.locales'),
            'timezones' => timezone_identifiers_list(),
        ]);
    }

    public function update(UpdateGeneralSettingsRequest $request, GeneralSettings $settings): RedirectResponse
    {
        $validated = $request->validated();

        $settings->application_name = $validated['application_name'];
        $settings->application_description = $validated['application_description'];
        $settings->contact_email = $validated['contact_email'];
        $settings->default_locale = $validated['default_locale'];
        $settings->timezone = $validated['timezone'];
        $settings->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('general_settings.message.updated')]);

        return to_route('settings.general.edit');
    }
}
