<?php

namespace App\Http\Controllers\Account;

use App\Actions\Profile\UploadAvatar;
use App\Http\Controllers\Controller;
use App\Http\Requests\Account\AvatarUploadRequest;
use App\Http\Resources\UploadedFileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvatarController extends Controller
{
    public function store(AvatarUploadRequest $request, UploadAvatar $uploadAvatar): UploadedFileResource
    {
        $media = $uploadAvatar->handle($request->user(), $request->file('file'));

        return new UploadedFileResource($media);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->clearMediaCollection('avatar');

        return response()->json(['data' => null]);
    }
}
