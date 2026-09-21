<?php

use App\Models\User;

test('profile page is displayed', function (): void {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function (): void {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User')
        ->and($user->email)->toBe('test@example.com')
        ->and($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function (): void {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function (): void {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function (): void {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});

test('profile precognition validates without updating profile information', function (): void {
    $user = User::factory()->create();
    $originalAttributes = $user->refresh()->getAttributes();

    $response = $this->actingAs($user)
        ->withPrecognition()
        ->patchJson(route('profile.update'), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);

    $response->assertSuccessfulPrecognition();
    expect($user->refresh()->getAttributes())->toBe($originalAttributes);
    $this->assertAuthenticatedAs($user);
});

test('profile precognition returns 422 for invalid fields', function (): void {
    $user = User::factory()->create();
    $originalAttributes = $user->refresh()->getAttributes();

    $response = $this->actingAs($user)
        ->withPrecognition()
        ->patchJson(route('profile.update'), [
            'name' => '',
            'email' => 'invalid-email',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email']);
    expect($user->refresh()->getAttributes())->toBe($originalAttributes);
});

test('profile precognition rejects an email belonging to another user with 422', function (): void {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $response = $this->actingAs($user)
        ->withPrecognition()
        ->withHeader('Precognition-Validate-Only', 'email')
        ->patchJson(route('profile.update'), [
            'email' => $otherUser->email,
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    expect($user->refresh()->email)->not->toBe($otherUser->email);
});

test('profile precognition accepts the current email when validating only that field', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withPrecognition()
        ->withHeader('Precognition-Validate-Only', 'email')
        ->patchJson(route('profile.update'), [
            'email' => $user->email,
        ]);

    $response->assertSuccessfulPrecognition();
});

test('delete profile precognition validates without deleting the account or ending the session', function (): void {
    $user = User::factory()->create();
    $this->withSession(['profile-session' => 'preserved']);
    $sessionToken = session()->token();

    $response = $this->actingAs($user)
        ->withPrecognition()
        ->deleteJson(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response->assertSuccessfulPrecognition()
        ->assertSessionHas('profile-session', 'preserved');
    $this->assertModelExists($user);
    $this->assertAuthenticatedAs($user);
    expect(session()->token())->toBe($sessionToken);
});

test('delete profile precognition returns 422 for an incorrect password', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withPrecognition()
        ->deleteJson(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('password');
    $this->assertModelExists($user);
    $this->assertAuthenticatedAs($user);
});

test('profile precognition requires authentication', function (string $method, string $routeName): void {
    $response = $this->withPrecognition()->{$method}(route($routeName));

    $response->assertUnauthorized();
})->with([
    'update profile' => ['patchJson', 'profile.update'],
    'delete profile' => ['deleteJson', 'profile.destroy'],
]);
