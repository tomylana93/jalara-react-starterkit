import { Head, useForm } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { update } from '@/actions/App/Http/Controllers/Settings/GeneralSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useTrans } from '@/hooks/use-trans';
import { edit } from '@/routes/settings/general';
import type { GeneralSettingsForm } from '@/types';

type GeneralSettingsProps = {
    settings: GeneralSettingsForm;
    locales: string[];
    timezones: string[];
};

export default function GeneralSettings({
    settings,
    locales,
    timezones,
}: GeneralSettingsProps) {
    const { trans } = useTrans();
    const form =
        useForm<GeneralSettingsForm>(settings).withPrecognition(update());

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(update(), {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <Head title={trans('general_settings.heading.general')} />

            <Heading
                variant="small"
                title={trans('general_settings.heading.general')}
                description={trans('general_settings.description.general')}
            />

            <form noValidate onSubmit={submit}>
                <FieldGroup>
                    <Field data-invalid={Boolean(form.errors.application_name)}>
                        <FieldLabel htmlFor="application_name">
                            {trans('general_settings.label.application_name')}
                        </FieldLabel>
                        <Input
                            id="application_name"
                            name="application_name"
                            autoComplete="organization"
                            value={form.data.application_name}
                            aria-invalid={Boolean(form.errors.application_name)}
                            onBlur={() => form.validate('application_name')}
                            onChange={(event) =>
                                form.setData(
                                    'application_name',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.application_name} />
                    </Field>

                    <Field
                        data-invalid={Boolean(
                            form.errors.application_description,
                        )}
                    >
                        <FieldLabel htmlFor="application_description">
                            {trans(
                                'general_settings.label.application_description',
                            )}
                        </FieldLabel>
                        <Textarea
                            id="application_description"
                            name="application_description"
                            value={form.data.application_description}
                            aria-invalid={Boolean(
                                form.errors.application_description,
                            )}
                            onBlur={() =>
                                form.validate('application_description')
                            }
                            onChange={(event) =>
                                form.setData(
                                    'application_description',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError
                            message={form.errors.application_description}
                        />
                    </Field>

                    <Field data-invalid={Boolean(form.errors.contact_email)}>
                        <FieldLabel htmlFor="contact_email">
                            {trans('general_settings.label.contact_email')}
                        </FieldLabel>
                        <Input
                            id="contact_email"
                            name="contact_email"
                            type="email"
                            autoComplete="email"
                            value={form.data.contact_email}
                            aria-invalid={Boolean(form.errors.contact_email)}
                            onBlur={() => form.validate('contact_email')}
                            onChange={(event) =>
                                form.setData(
                                    'contact_email',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.contact_email} />
                    </Field>

                    <Field data-invalid={Boolean(form.errors.default_locale)}>
                        <FieldLabel htmlFor="default_locale">
                            {trans('general_settings.label.default_locale')}
                        </FieldLabel>
                        <NativeSelect
                            id="default_locale"
                            name="default_locale"
                            value={form.data.default_locale}
                            aria-invalid={Boolean(form.errors.default_locale)}
                            onBlur={() => form.validate('default_locale')}
                            onChange={(event) =>
                                form.setData(
                                    'default_locale',
                                    event.target.value,
                                )
                            }
                        >
                            {locales.map((locale) => (
                                <NativeSelectOption key={locale} value={locale}>
                                    {locale.toUpperCase()}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        <InputError message={form.errors.default_locale} />
                    </Field>

                    <Field data-invalid={Boolean(form.errors.timezone)}>
                        <FieldLabel htmlFor="timezone">
                            {trans('general_settings.label.timezone')}
                        </FieldLabel>
                        <NativeSelect
                            id="timezone"
                            name="timezone"
                            value={form.data.timezone}
                            aria-invalid={Boolean(form.errors.timezone)}
                            onBlur={() => form.validate('timezone')}
                            onChange={(event) =>
                                form.setData('timezone', event.target.value)
                            }
                        >
                            {timezones.map((timezone) => (
                                <NativeSelectOption
                                    key={timezone}
                                    value={timezone}
                                >
                                    {timezone}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        <InputError message={form.errors.timezone} />
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

GeneralSettings.layout = {
    breadcrumbKeys: [
        {
            titleKey: 'general_settings.heading.settings',
            href: edit(),
        },
    ],
};
