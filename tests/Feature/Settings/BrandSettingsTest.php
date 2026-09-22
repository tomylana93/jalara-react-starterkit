<?php

declare(strict_types=1);

use App\Enums\BrandAsset;
use App\Enums\BrandColorPreset;
use App\Models\User;
use App\Settings\BrandSettings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('brand settings require authentication', function (): void {
    $this->get(route('settings.brand.edit'))->assertRedirect(route('login'));
    $this->patch(route('settings.brand.update'))->assertRedirect(route('login'));
    $this->postJson(route('settings.brand.assets.store', BrandAsset::LogoFull))->assertUnauthorized();
    $this->deleteJson(route('settings.brand.assets.destroy', BrandAsset::LogoFull))->assertUnauthorized();
});

test('brand settings page displays persisted settings and upload constraints', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $settings = resolve(BrandSettings::class);
    $settings->color_preset = BrandColorPreset::Blue;
    $settings->save();

    $this->actingAs($user)->get(route('settings.brand.edit'))
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('settings/brand')
            ->where('settings.color_preset', 'blue')
            ->has('colorPresets', 12)
            ->has('assets', 4)
            ->where('assets.0.value', 'logo_full')
            ->where('assets.0.file', null)
            ->has('themeTokens.light')
            ->has('themeTokens.dark'));
});

test('authenticated user can update the brand color preset', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('settings.brand.update'), [
        'color_preset' => 'violet',
    ])->assertSessionHasNoErrors()->assertRedirect(route('settings.brand.edit'));

    expect(resolve(BrandSettings::class)->refresh()->color_preset)->toBe(BrandColorPreset::Violet);
});

test('invalid brand color preset is rejected', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->from(route('settings.brand.edit'))
        ->patch(route('settings.brand.update'), ['color_preset' => 'invalid'])
        ->assertSessionHasErrors('color_preset')
        ->assertRedirect(route('settings.brand.edit'));

    expect(resolve(BrandSettings::class)->refresh()->color_preset)->toBe(BrandColorPreset::Neutral);
});

test('uploading a brand asset replaces the previous file', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $settings = resolve(BrandSettings::class);
    $previousPath = UploadedFile::fake()->image('old.png')->store('brand', 'public');
    $settings->logo_full_path = $previousPath;
    $settings->save();
    $file = UploadedFile::fake()->image('logo.png', 800, 300);

    $response = $this->actingAs($user)->postJson(
        route('settings.brand.assets.store', BrandAsset::LogoFull),
        ['file' => $file],
    );

    $response->assertCreated()
        ->assertJsonPath('data.mimeType', 'image/png')
        ->assertJsonStructure(['data' => ['id', 'name', 'mimeType', 'sizeBytes', 'url', 'thumbnailUrl']]);
    $path = resolve(BrandSettings::class)->refresh()->logo_full_path;
    expect($path)->not->toBe($previousPath);
    Storage::disk('public')->assertExists($path)->assertMissing($previousPath);
});

test('invalid brand asset is rejected without replacing the saved file', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $settings = resolve(BrandSettings::class);
    $previousPath = UploadedFile::fake()->image('old.png')->store('brand', 'public');
    $settings->logo_square_path = $previousPath;
    $settings->save();

    $this->actingAs($user)->postJson(
        route('settings.brand.assets.store', BrandAsset::LogoSquare),
        ['file' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf')],
    )->assertUnprocessable()->assertJsonValidationErrors('file');

    expect(resolve(BrandSettings::class)->refresh()->logo_square_path)->toBe($previousPath);
    Storage::disk('public')->assertExists($previousPath);
});

test('removing a brand asset deletes the file and is idempotent', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $settings = resolve(BrandSettings::class);
    $path = UploadedFile::fake()->image('logo.png')->store('brand', 'public');
    $settings->logo_square_path = $path;
    $settings->save();

    $this->actingAs($user)
        ->deleteJson(route('settings.brand.assets.destroy', BrandAsset::LogoSquare))
        ->assertOk()->assertExactJson(['data' => null]);
    $this->actingAs($user)
        ->deleteJson(route('settings.brand.assets.destroy', BrandAsset::LogoSquare))
        ->assertOk()->assertExactJson(['data' => null]);

    expect(resolve(BrandSettings::class)->refresh()->logo_square_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});
