<?php

namespace App\Http\Middleware;

use App\Enums\BrandAsset;
use App\Settings\BrandSettings;
use App\Support\BrandPalette;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Override;

class HandleInertiaRequests extends Middleware
{
    public function __construct(private readonly BrandSettings $brandSettings) {}

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    #[Override]
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $avatar = $user?->getFirstMedia('avatar');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'brand' => [
                'logoFull' => $this->brandSettings->assetUrl(BrandAsset::LogoFull),
                'logoSquare' => $this->brandSettings->assetUrl(BrandAsset::LogoSquare),
                'favicon' => $this->brandSettings->assetUrl(BrandAsset::Favicon),
                'ogImage' => $this->brandSettings->assetUrl(BrandAsset::OgImage),
                'colorPreset' => $this->brandSettings->color_preset->value,
                'themeTokens' => BrandPalette::tokens($this->brandSettings->color_preset),
            ],
            'localization' => [
                'locale' => app()->getLocale(),
                'fallbackLocale' => config('app.fallback_locale'),
            ],
            'auth' => [
                'user' => $user ? [...$user->toArray(), 'avatar' => $avatar?->getAvailableUrl(['thumbnail'])] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
