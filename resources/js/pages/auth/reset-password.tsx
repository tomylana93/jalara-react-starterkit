import { useTrans } from '@/hooks/use-trans';
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Spinner } from '@/components/ui/spinner';
import { store } from '@/actions/Laravel/Fortify/Http/Controllers/NewPasswordController';
import type { ResetPasswordForm } from '@/types';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    const { trans } = useTrans();

    const form = useForm<ResetPasswordForm>({
        token,
        email,
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
            <Head title={trans('authentication.heading.reset_password')} />

            <form noValidate onSubmit={submit}>
                <FieldGroup>
                    <div className="flex flex-col gap-6">
                        <Field
                            data-invalid={Boolean(form.errors.email)}
                            className="grid gap-2"
                        >
                            <FieldLabel htmlFor="email">
                                {' '}
                                {trans('authentication.label.email')}{' '}
                            </FieldLabel>
                            <Input
                                aria-invalid={Boolean(form.errors.email)}
                                aria-describedby={
                                    form.errors.email
                                        ? 'reset-password-email-error'
                                        : undefined
                                }
                                id="email"
                                type="text"
                                inputMode="email"
                                name="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                autoComplete="email"
                                className="mt-1 block w-full"
                                readOnly
                            />
                            <InputError
                                id="reset-password-email-error"
                                message={form.errors.email}
                                className="mt-2"
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
                                        ? 'reset-password-password-error'
                                        : undefined
                                }
                                id="password"
                                name="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                autoFocus
                                placeholder={trans(
                                    'authentication.label.password',
                                )}
                                passwordrules={passwordRules}
                            />
                            <InputError
                                id="reset-password-password-error"
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
                                        ? 'reset-password-password-confirmation-error'
                                        : undefined
                                }
                                id="password_confirmation"
                                name="password_confirmation"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                placeholder={trans(
                                    'authentication.label.confirm_password',
                                )}
                                passwordrules={passwordRules}
                            />
                            <InputError
                                id="reset-password-password-confirmation-error"
                                message={form.errors.password_confirmation}
                                className="mt-2"
                            />
                        </Field>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={form.processing}
                            data-test="reset-password-button"
                        >
                            {form.processing && <Spinner />}{' '}
                            {trans(
                                'authentication.heading.reset_password',
                            )}{' '}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </>
    );
}

ResetPassword.layout = {
    titleKey: 'authentication.heading.reset_password',
    descriptionKey: 'authentication.description.reset_password',
};
