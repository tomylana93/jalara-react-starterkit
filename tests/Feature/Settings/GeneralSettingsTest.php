<?php

declare(strict_types=1);

use App\Models\User;
use App\Settings\GeneralSettings;
use Inertia\Testing\AssertableInertia as Assert;

test('general settings page requires authentication', function (): void {
    $this->get(route('settings.general.edit'))->assertRedirect(route('login'));
});

test('general settings page displays the persisted settings', function (): void {
    $user = User::factory()->create();
    $settings = resolve(GeneralSettings::class);
    $settings->application_name = 'Jalara Workspace';
    $settings->application_description = 'Operations in one place.';
    $settings->contact_email = 'support@example.com';
    $settings->default_locale = 'id';
    $settings->timezone = 'Asia/Jakarta';
    $settings->save();

    $response = $this->actingAs($user)->get(route('settings.general.edit'));

    $response->assertInertia(fn (Assert $page): Assert => $page
        ->component('settings/general')
        ->where('settings.application_name', 'Jalara Workspace')
        ->where('settings.application_description', 'Operations in one place.')
        ->where('settings.contact_email', 'support@example.com')
        ->where('settings.default_locale', 'id')
        ->where('settings.timezone', 'Asia/Jakarta')
        ->where('locales', ['en', 'id'])
        ->has('timezones')
    );
});

test('authenticated user can update general settings', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('settings.general.update'), [
        'application_name' => 'Updated Jalara',
        'application_description' => 'Updated application description.',
        'contact_email' => 'hello@example.com',
        'default_locale' => 'id',
        'timezone' => 'Asia/Jakarta',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('settings.general.edit'));

    $settings = resolve(GeneralSettings::class)->refresh();

    expect($settings->application_name)->toBe('Updated Jalara')
        ->and($settings->application_description)->toBe('Updated application description.')
        ->and($settings->contact_email)->toBe('hello@example.com')
        ->and($settings->default_locale)->toBe('id')
        ->and($settings->timezone)->toBe('Asia/Jakarta');
});

test('updating the default locale immediately localizes the application', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('settings.general.update'), [
        'application_name' => 'Jalara',
        'application_description' => null,
        'contact_email' => null,
        'default_locale' => 'id',
        'timezone' => 'Asia/Jakarta',
    ]);

    $response
        ->assertRedirect(route('settings.general.edit'))
        ->assertInertiaFlash('toast.message', 'Pengaturan umum berhasil diperbarui.');

    $this->get(route('settings.general.edit'))->assertInertia(fn (Assert $page): Assert => $page
        ->component('settings/general')
        ->where('localization.locale', 'id')
    );
});

test('invalid general settings are rejected without changing persisted values', function (): void {
    $user = User::factory()->create();
    $settings = resolve(GeneralSettings::class);
    $settings->application_name = 'Original Name';
    $settings->save();

    $response = $this->actingAs($user)->from(route('settings.general.edit'))
        ->patch(route('settings.general.update'), [
            'application_name' => '',
            'application_description' => null,
            'contact_email' => 'not-an-email',
            'default_locale' => 'fr',
            'timezone' => 'Invalid/Timezone',
        ]);

    $response
        ->assertSessionHasErrors(['application_name', 'contact_email', 'default_locale', 'timezone'])
        ->assertRedirect(route('settings.general.edit'));

    expect($settings->refresh()->application_name)->toBe('Original Name');
});

test('general settings precognition validates without persisting changes', function (): void {
    $user = User::factory()->create();
    $settings = resolve(GeneralSettings::class);
    $settings->application_name = 'Original Name';
    $settings->save();

    $response = $this->actingAs($user)->withPrecognition()
        ->patchJson(route('settings.general.update'), [
            'application_name' => 'Preview Name',
            'application_description' => null,
            'contact_email' => null,
            'default_locale' => 'en',
            'timezone' => 'UTC',
        ]);

    $response->assertSuccessfulPrecognition();
    expect($settings->refresh()->application_name)->toBe('Original Name');
});

test('general settings precognition requires authentication', function (): void {
    $this->withPrecognition()->patchJson(route('settings.general.update'))->assertUnauthorized();
});
