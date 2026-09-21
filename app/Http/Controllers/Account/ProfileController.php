<?php

namespace App\Http\Controllers\Account;

use App\Actions\Profile\DeleteProfile;
use App\Actions\Profile\UpdateProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Account\ProfileDeleteRequest;
use App\Http\Requests\Account\ProfileUpdateRequest;
use App\Http\Resources\UploadedFileResource;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $avatar = $request->user()->getFirstMedia('avatar');

        return Inertia::render('account/profile', [
            'avatarMedia' => $avatar ? new UploadedFileResource($avatar)->resolve($request) : null,
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request, UpdateProfile $updateProfile): RedirectResponse
    {
        $updateProfile->handle($request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('profile.message.updated')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request, DeleteProfile $deleteProfile): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $deleteProfile->handle($user);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home');
    }
}
