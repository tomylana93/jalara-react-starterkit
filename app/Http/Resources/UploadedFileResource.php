<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/** @mixin Media */
class UploadedFileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'mimeType' => $this->mime_type,
            'sizeBytes' => $this->size,
            'url' => $this->getUrl(),
            'thumbnailUrl' => str_starts_with($this->mime_type ?? '', 'image/')
                ? $this->getAvailableUrl(['thumbnail'])
                : null,
        ];
    }
}
