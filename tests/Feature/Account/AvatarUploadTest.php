<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\MediaLibrary\Conversions\FileManipulator;

use function Pest\Laravel\mock;

test('avatar upload requires authentication with 401', function (): void {
    $this->postJson(route('profile.avatar.store'))->assertUnauthorized();
});

test('avatar removal requires authentication with 401', function (): void {
    $this->deleteJson(route('profile.avatar.destroy'))->assertUnauthorized();
});

test('an image upload stores an avatar with size metadata and a server thumbnail', function (string $extension, string $mimeType): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $file = UploadedFile::fake()->image('avatar.'.$extension, 400, 300);
    $size = $file->getSize();

    $response = $this->actingAs($user)->postJson(route('profile.avatar.store'), [
        'file' => $file,
        'user_id' => $otherUser->id,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'avatar.'.$extension)
        ->assertJsonPath('data.mimeType', $mimeType)
        ->assertJsonPath('data.sizeBytes', $size)
        ->assertJsonStructure(['data' => ['id', 'name', 'mimeType', 'sizeBytes', 'url', 'thumbnailUrl']]);
    $avatar = $user->refresh()->getFirstMedia('avatar');
    $this->assertModelExists($avatar);
    expect($avatar->model_id)->toBe($user->id)
        ->and($otherUser->hasMedia('avatar'))->toBeFalse()
        ->and($avatar->hasGeneratedConversion('thumbnail'))->toBeTrue();
    $response->assertJsonPath('data.thumbnailUrl', $avatar->getUrl('thumbnail'));
    Storage::disk('public')->assertExists([$avatar->getPathRelativeToRoot(), $avatar->getPathRelativeToRoot('thumbnail')]);
    $dimensions = getimagesize($avatar->getPath('thumbnail'));
    expect(array_slice($dimensions, 0, 2))->toBe([256, 256]);
})->with([
    'JPEG' => ['jpg', 'image/jpeg'],
    'PNG' => ['png', 'image/png'],
    'WebP' => ['webp', 'image/webp'],
]);

test('a new avatar replaces the previous original and thumbnail', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $previous = $user->addMedia(UploadedFile::fake()->image('old.png'))->toMediaCollection('avatar');
    $previousPaths = [$previous->getPathRelativeToRoot(), $previous->getPathRelativeToRoot('thumbnail')];

    $response = $this->actingAs($user)->postJson(route('profile.avatar.store'), [
        'file' => UploadedFile::fake()->image('new.png'),
    ]);

    $response->assertCreated()->assertJsonPath('data.name', 'new.png');
    $this->assertModelMissing($previous);
    expect($user->refresh()->getMedia('avatar'))->toHaveCount(1);
    Storage::disk('public')->assertMissing($previousPaths);
});

test('a thumbnail failure returns 500 and cleans up the new file while preserving the old avatar', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $previous = $user->addMedia(UploadedFile::fake()->image('old.png'))->toMediaCollection('avatar');
    $previousPaths = [$previous->getPathRelativeToRoot(), $previous->getPathRelativeToRoot('thumbnail')];
    Exceptions::fake();
    mock(FileManipulator::class)->shouldReceive('createDerivedFiles')->once()->andThrow(new RuntimeException('Thumbnail failed'));

    $this->actingAs($user)->postJson(route('profile.avatar.store'), [
        'file' => UploadedFile::fake()->image('new.png'),
    ])->assertInternalServerError();

    $this->assertModelExists($previous);
    expect($user->refresh()->getMedia('avatar'))->toHaveCount(1);
    Storage::disk('public')->assertExists($previousPaths);
    expect(Storage::disk('public')->allFiles())->toHaveCount(2);
    Exceptions::assertReported(fn (RuntimeException $exception): bool => $exception->getMessage() === 'Thumbnail failed');
});

test('invalid avatar uploads return 422 and preserve the existing avatar', function (Closure $payload): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $previous = $user->addMedia(UploadedFile::fake()->image('old.png'))->toMediaCollection('avatar');

    $response = $this->actingAs($user)->postJson(route('profile.avatar.store'), $payload());

    $response->assertUnprocessable()->assertJsonValidationErrors('file');
    $this->assertModelExists($previous);
    expect($user->refresh()->getMedia('avatar'))->toHaveCount(1);
    Storage::disk('public')->assertExists($previous->getPathRelativeToRoot());
})->with([
    'missing file' => [fn (): array => []],
    'document' => [fn (): array => ['file' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf')]],
    'fake image content' => [fn (): array => ['file' => UploadedFile::fake()->createWithContent('avatar.png', 'not an image')]],
    'SVG' => [fn (): array => ['file' => UploadedFile::fake()->createWithContent('avatar.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>')]],
    'unsupported GIF' => [fn (): array => ['file' => UploadedFile::fake()->image('avatar.gif')]],
    'over 2 MB' => [fn (): array => ['file' => UploadedFile::fake()->image('avatar.png')->size(2049)]],
    'over dimension limit' => [fn (): array => ['file' => UploadedFile::fake()->image('avatar.png', 4097, 1)]],
]);

test('profile reload exposes the saved avatar and shared avatar URL', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $avatar = $user->addMedia(UploadedFile::fake()->image('saved.png'))->toMediaCollection('avatar');

    $response = $this->actingAs($user)->get(route('profile.edit'));

    $response->assertInertia(fn (Assert $page): Assert => $page
        ->component('account/profile')
        ->where('avatarMedia.name', 'saved')
        ->where('avatarMedia.thumbnailUrl', $avatar->getUrl('thumbnail'))
        ->where('avatarMedia.sizeBytes', $avatar->size)
        ->where('auth.user.avatar', $avatar->getUrl('thumbnail'))
        ->missing('auth.user.media'));
    Storage::disk('public')->assertExists($avatar->getPathRelativeToRoot('thumbnail'));
});

test('removing an avatar deletes its original and thumbnail without affecting other users', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $avatar = $user->addMedia(UploadedFile::fake()->image('avatar.png'))->toMediaCollection('avatar');
    $otherAvatar = $otherUser->addMedia(UploadedFile::fake()->image('other.png'))->toMediaCollection('avatar');
    $paths = [$avatar->getPathRelativeToRoot(), $avatar->getPathRelativeToRoot('thumbnail')];

    $this->actingAs($user)->deleteJson(route('profile.avatar.destroy'), ['user_id' => $otherUser->id])
        ->assertOk()->assertExactJson(['data' => null]);

    $this->assertModelMissing($avatar);
    $this->assertModelExists($otherAvatar);
    expect($user->refresh()->hasMedia('avatar'))->toBeFalse();
    Storage::disk('public')->assertMissing($paths)->assertExists($otherAvatar->getPathRelativeToRoot());
});

test('removing an empty avatar is idempotent', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->deleteJson(route('profile.avatar.destroy'))
        ->assertOk()->assertExactJson(['data' => null]);

    expect($user->refresh()->hasMedia('avatar'))->toBeFalse();
});

test('deleting a profile also removes its avatar files', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $avatar = $user->addMedia(UploadedFile::fake()->image('avatar.png'))->toMediaCollection('avatar');
    $paths = [$avatar->getPathRelativeToRoot(), $avatar->getPathRelativeToRoot('thumbnail')];

    $this->actingAs($user)->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertRedirect(route('home'));

    $this->assertModelMissing($user);
    $this->assertModelMissing($avatar);
    Storage::disk('public')->assertMissing($paths);
});
