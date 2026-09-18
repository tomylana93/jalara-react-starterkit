import { useTrans } from '@/hooks/use-trans';
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/actions/Laravel/Fortify/Http/Controllers/RegisteredUserController';
import type { RegisterForm } from '@/types';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { trans } = useTrans();

    const form = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(store(), {
            onSuccess: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title={trans('authentication.button.register')} />
            <form
                noValidate
                onSubmit={submit}
                className="flex flex-col gap-6"
                inert={form.processing}
            >
                <FieldGroup>
                    <div className="flex flex-col gap-6">
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
                                        ? 'register-name-error'
                                        : undefined
                                }
                                id="name"
                                type="text"
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder={trans(
                                    'authentication.placeholder.full_name',
                                )}
                            />
                            <InputError
                                id="register-name-error"
                                message={form.errors.name}
                                className="mt-2"
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
                                        ? 'register-email-error'
                                        : undefined
                                }
                                id="email"
                                type="text"
                                inputMode="email"

                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                placeholder="email@example.com"
                            />
                            <InputError
                                id="register-email-error"
                                message={form.errors.email}
                            />
                        </Field>

                        <Field
                            data-invalid={Boolean(form.errors.password)}
                            className="grid gap-2"
                        >
                            <FieldLabel htmlFor="password">
                                {' '}
                                {trans('authentication.label.password')}{' '}
                            </FieldLabel>
                            <PasswordInput
                                aria-invalid={Boolean(form.errors.password)}
                                aria-describedby={
                                    form.errors.password
                                        ? 'register-password-error'
                                        : undefined
                                }
                                id="password"

                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                placeholder={trans(
                                    'authentication.label.password',
                                )}
                                passwordrules={passwordRules}
                            />
                            <InputError
                                id="register-password-error"
                                message={form.errors.password}
                            />
                        </Field>

                        <Field
                            data-invalid={Boolean(
                                form.errors.password_confirmation,
                            )}
                            className="grid gap-2"
                        >
                            <FieldLabel htmlFor="password_confirmation">
                                {' '}
                                {trans(
                                    'authentication.label.confirm_password',
                                )}{' '}
                            </FieldLabel>
                            <PasswordInput
                                aria-invalid={Boolean(
                                    form.errors.password_confirmation,
                                )}
                                aria-describedby={
                                    form.errors.password_confirmation
                                        ? 'register-password-confirmation-error'
                                        : undefined
                                }
                                id="password_confirmation"

                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                placeholder={trans(
                                    'authentication.label.confirm_password',
                                )}
                                passwordrules={passwordRules}
                            />
                            <InputError
                                id="register-password-confirmation-error"
                                message={form.errors.password_confirmation}
                            />
                        </Field>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            tabIndex={5}
                            disabled={form.processing}
                            data-test="register-user-button"
                        >
                            {form.processing && <Spinner />}{' '}
                            {trans('authentication.button.create_account')}{' '}
                        </Button>
                    </div>

                    <div className="text-muted-foreground text-center text-sm">
                        {' '}
                        {trans('authentication.description.has_account')}{' '}
                        <TextLink href={login()} tabIndex={6}>
                            {' '}
                            {trans('authentication.button.login')}{' '}
                        </TextLink>
                    </div>
                </FieldGroup>
            </form>
        </>
    );
}

Register.layout = {
    titleKey: 'authentication.heading.register',
    descriptionKey: 'authentication.description.register',
};
