<?php

use App\Models\User;
use App\Settings\GeneralSettings;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Inertia\Testing\AssertableInertia as Assert;

// Locale remains an application setting; browser headers do not select it.
test('configured locale is shared with the frontend and rendered into HTML', function (string $locale): void {
    $settings = resolve(GeneralSettings::class);
    $settings->default_locale = $locale;
    $settings->save();
    config(['app.fallback_locale' => 'en']);

    $this->withHeader('Accept-Language', $locale === 'en' ? 'id' : 'en')->get(route('login'))->assertSeeHtml('lang="'.$locale.'"')
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('auth/login')
            ->where('localization', ['locale' => $locale, 'fallbackLocale' => 'en']));
})->with(['en', 'id']);

test('login validation is translated by the server', function (string $locale, string $message): void {
    $settings = resolve(GeneralSettings::class);
    $settings->default_locale = $locale;
    $settings->save();

    $this->post(route('login'), [])
        ->assertSessionHasErrors(['email' => $message]);
})->with([
    'english' => ['en', 'The email field is required.'],
    'indonesian' => ['id', 'Kolom email wajib diisi.'],
]);

test('invalid credentials use the configured language', function (string $locale, string $message): void {
    $settings = resolve(GeneralSettings::class);
    $settings->default_locale = $locale;
    $settings->save();

    $this->post(route('login'), ['email' => 'missing@example.test', 'password' => 'invalid-password'])
        ->assertSessionHasErrors(['email' => $message]);
})->with([
    'english' => ['en', 'These credentials do not match our records.'],
    'indonesian' => ['id', 'Kredensial tersebut tidak cocok dengan akun mana pun.'],
]);

test('profile success toast is translated once by the server', function (): void {
    $settings = resolve(GeneralSettings::class);
    $settings->default_locale = 'id';
    $settings->save();
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('profile.update'), [
        'name' => 'Updated name',
        'email' => $user->email,
    ])->assertInertiaFlash('toast.message', 'Profil Anda telah diperbarui.');
});

test('authentication notifications use the configured language', function (string $locale, string $resetSubject, string $verificationSubject): void {
    app()->setLocale($locale);
    $user = User::factory()->create();

    $reset = new ResetPassword('test-token')->toMail($user);
    $verification = (new VerifyEmail)->toMail($user);

    expect($reset->subject)->toBe($resetSubject)
        ->and($verification->subject)->toBe($verificationSubject);
})->with([
    'english' => ['en', 'Reset your password', 'Verify your email address'],
    'indonesian' => ['id', 'Atur ulang kata sandi Anda', 'Verifikasikan alamat email Anda'],
]);
