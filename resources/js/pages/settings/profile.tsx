import { useTrans } from '@/hooks/use-trans';
import { useForm, Head, usePage } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { Link } from '@inertiajs/react';
import { update } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import type { ProfileForm } from '@/types';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { trans } = useTrans();

    const { auth } = usePage<PageProps>().props;

    const form = useForm<ProfileForm>({
        name: auth.user.name,
        email: auth.user.email,
    }).withPrecognition(update());

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(update(), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={trans('profile.heading.settings')} />

            <h1 className="sr-only"> {trans('profile.heading.settings')} </h1>

            <div className="flex flex-col gap-6">
                <Heading
                    variant="small"
                    title={trans('navigation.label.profile')}
                    description={trans('profile.description.settings')}
                />

                <form
                    noValidate
                    onSubmit={submit}
                    className="flex flex-col gap-6"
                >
                    <FieldGroup>
                        <Field
                            data-invalid={Boolean(form.errors.name)}
                            className="grid gap-2"
                        >
                            <FieldLabel htmlFor="name">
                                {' '}
                                {trans('authentication.label.name')}{' '}
                            </FieldLabel>

                            <Input
                                aria-invalid={Boolean(form.errors.name)}
                                aria-describedby={
                                    form.errors.name
                                        ? 'profile-name-error'
                                        : undefined
                                }
                                id="name"
                                className="mt-1 block w-full"
                                name="name"
                                value={form.data.name}
                                onBlur={() => form.validate('name')}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }

                                autoComplete="name"
                                placeholder={trans(
                                    'authentication.placeholder.full_name',
                                )}
                            />

                            <InputError
                                id="profile-name-error"
                                className="mt-2"
                                message={form.errors.name}
                            />
                        </Field>

                        <Field
                            data-invalid={Boolean(form.errors.email)}
                            className="grid gap-2"
                        >
                            <FieldLabel htmlFor="email">
                                {' '}
                                {trans(
                                    'authentication.label.email_address',
                                )}{' '}
                            </FieldLabel>

                            <Input
                                aria-invalid={Boolean(form.errors.email)}
                                aria-describedby={
                                    form.errors.email
                                        ? 'profile-email-error'
                                        : undefined
                                }
                                id="email"
                                type="text"
                                inputMode="email"
                                className="mt-1 block w-full"
                                name="email"
                                value={form.data.email}
                                onBlur={() => form.validate('email')}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }

                                autoComplete="username"
                                placeholder={trans(
                                    'authentication.label.email_address',
                                )}
                            />

                            <InputError
                                id="profile-email-error"
                                className="mt-2"
                                message={form.errors.email}
                            />
                        </Field>

                        {mustVerifyEmail &&
                            auth.user.email_verified_at === null && (
                                <div>
                                    <p className="text-muted-foreground -mt-4 text-sm">
                                        {' '}
                                        {trans(
                                            'profile.message.email_unverified',
                                        )}{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            {' '}
                                            {trans(
                                                'profile.link.resend_verification',
                                            )}{' '}
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            {' '}
                                            {trans(
                                                'profile.message.verification_sent',
                                            )}{' '}
                                        </div>
                                    )}
                                </div>
                            )}

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={form.processing}
                                data-test="update-profile-button"
                            >
                                {' '}
                                {trans('common.button.save')}{' '}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbKeys: [
        {
            titleKey: 'profile.heading.settings',
            href: edit(),
        },
    ],
};
