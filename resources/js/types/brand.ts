import type { UploadedFile } from '@/types/uploads';

export type BrandThemeTokens = {
    light: Record<string, string>;
    dark: Record<string, string>;
};

export type BrandColorOption = {
    value: string;
    label: string;
    preview: string;
};

export type BrandAssetOption = {
    value: string;
    label: string;
    accept: string;
    maxSizeBytes: number;
    file: UploadedFile | null;
};

export type Brand = {
    logoFull: string | null;
    logoSquare: string | null;
    favicon: string | null;
    ogImage: string | null;
    colorPreset: string;
    themeTokens: BrandThemeTokens;
};
