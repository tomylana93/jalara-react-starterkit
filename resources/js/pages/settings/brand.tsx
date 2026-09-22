import { Head, useForm } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { update } from '@/actions/App/Http/Controllers/Settings/BrandSettingsController';
import BrandAssetUploader from '@/components/brand-asset-uploader';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useTrans } from '@/hooks/use-trans';
import { edit } from '@/routes/settings/brand';
import type {
    BrandAssetOption,
    BrandColorOption,
    BrandSettingsForm,
    BrandThemeTokens,
} from '@/types';

type BrandSettingsProps = {
    settings: BrandSettingsForm;
    colorPresets: BrandColorOption[];
    themeTokens: BrandThemeTokens;
    assets: BrandAssetOption[];
};

function themeRule(selector: string, tokens: Record<string, string>): string {
    const declarations = Object.entries(tokens)
        .map(([token, value]) => `${token}: ${value};`)
        .join('');

    return `${selector}{${declarations}}`;
}

export default function BrandSettings({
    settings,
    colorPresets,
    themeTokens,
    assets,
}: BrandSettingsProps) {
    const { trans } = useTrans();
    const form =
        useForm<BrandSettingsForm>(settings).withPrecognition(update());

    function applyThemeTokens() {
        let style = document.getElementById('brand-theme');

        if (!(style instanceof HTMLStyleElement)) {
            style = document.createElement('style');
            style.id = 'brand-theme';
            document.head.append(style);
        }

        style.textContent = [
            themeRule(':root', themeTokens.light),
            themeRule('.dark', themeTokens.dark),
        ].join('');
    }

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(update(), {
            preserveScroll: true,
            onSuccess: () => {
                applyThemeTokens();
                form.setDefaults();
            },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <Head title={trans('brand_settings.heading.brand')} />

            <Heading
                variant="small"
                title={trans('brand_settings.heading.brand')}
                description={trans('brand_settings.description.brand')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
                {assets.map((asset) => (
                    <BrandAssetUploader key={asset.value} asset={asset} />
                ))}
            </div>

            <form noValidate onSubmit={submit}>
                <FieldGroup>
                    <Field data-invalid={Boolean(form.errors.color_preset)}>
                        <FieldLabel>
                            {trans('brand_settings.label.color_preset')}
                        </FieldLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {colorPresets.map((preset) => (
                                <label
                                    key={preset.value}
                                    className="has-checked:border-primary has-checked:ring-primary/20 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-shadow has-checked:ring-2"
                                >
                                    <input
                                        className="sr-only"
                                        type="radio"
                                        name="color_preset"
                                        value={preset.value}
                                        checked={
                                            form.data.color_preset ===
                                            preset.value
                                        }
                                        onBlur={() =>
                                            form.validate('color_preset')
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'color_preset',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <span
                                        className="size-6 rounded-full border shadow-sm"
                                        style={{
                                            backgroundColor: preset.preview,
                                        }}
                                    />
                                    <span className="text-sm font-medium">
                                        {preset.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <InputError message={form.errors.color_preset} />
                    </Field>

                    <div className="flex items-center gap-4">
                        <Button disabled={form.processing || !form.isDirty}>
                            {trans('common.button.save')}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </div>
    );
}

BrandSettings.layout = {
    breadcrumbKeys: [
        {
            titleKey: 'general_settings.heading.settings',
            href: edit(),
        },
    ],
};
