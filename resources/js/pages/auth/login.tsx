import { useTrans } from '@/hooks/use-trans';
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController';
import type { LoginForm } from '@/types';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { trans } = useTrans();

    const form = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(store(), {
            onSuccess: () => form.reset('password'),
        });
    };

    return (
        <>
            <Head title={trans('authentication.button.login')} />

            <PasskeyVerify />

            <form noValidate onSubmit={submit} className="flex flex-col gap-6">
                <FieldGroup>
                    <div className="flex flex-col gap-6">
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
                                        ? 'login-email-error'
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
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="email@example.com"
                            />
                            <InputError
                                id="login-email-error"
                                message={form.errors.email}
                            />
                        </Field>

                        <Field
                            data-invalid={Boolean(form.errors.password)}
                            className="grid gap-2"
                        >
                            <div className="flex items-center">
                                <FieldLabel htmlFor="password">
                                    {' '}
                                    {trans(
                                        'authentication.label.password',
                                    )}{' '}
                                </FieldLabel>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="ml-auto text-sm"
                                        tabIndex={5}
                                    >
                                        {' '}
                                        {trans(
                                            'authentication.link.forgot_password',
                                        )}{' '}
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                aria-invalid={Boolean(form.errors.password)}
                                aria-describedby={
                                    form.errors.password
                                        ? 'login-password-error'
                                        : undefined
                                }
                                id="password"
                                name="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }

                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder={trans(
                                    'authentication.label.password',
                                )}
                            />
                            <InputError
                                id="login-password-error"
                                message={form.errors.password}
                            />
                        </Field>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={form.data.remember}
                                onCheckedChange={(checked) =>
                                    form.setData('remember', checked === true)
                                }
                                tabIndex={3}
                            />
                            <FieldLabel htmlFor="remember">
                                {' '}
                                {trans('authentication.label.remember')}{' '}
                            </FieldLabel>
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            tabIndex={4}
                            disabled={form.processing}
                            data-test="login-button"
                        >
                            {form.processing && <Spinner />}{' '}
                            {trans('authentication.button.login')}{' '}
                        </Button>
                    </div>

                    <div className="text-muted-foreground text-center text-sm">
                        {' '}
                        {trans('authentication.description.no_account')}{' '}
                        <TextLink href={register()} tabIndex={5}>
                            {' '}
                            {trans('authentication.link.signup')}{' '}
                        </TextLink>
                    </div>
                </FieldGroup>
            </form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    titleKey: 'authentication.heading.login',
    descriptionKey: 'authentication.description.login',
};
