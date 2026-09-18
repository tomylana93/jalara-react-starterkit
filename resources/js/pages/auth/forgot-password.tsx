import { useTrans } from '@/hooks/use-trans';
// Components
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { login } from '@/routes';
import { store } from '@/actions/Laravel/Fortify/Http/Controllers/PasswordResetLinkController';
import type { ForgotPasswordForm } from '@/types';

export default function ForgotPassword({ status }: { status?: string }) {
    const { trans } = useTrans();

    const form = useForm<ForgotPasswordForm>({ email: '' });

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(store());
    };

    return (
        <>
            <Head title={trans('authentication.heading.forgot_password')} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="flex flex-col gap-6">
                <form noValidate onSubmit={submit}>
                    <FieldGroup>
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
                                        ? 'forgot-password-email-error'
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
                                autoComplete="off"
                                autoFocus
                                placeholder="email@example.com"
                            />

                            <InputError
                                id="forgot-password-email-error"
                                message={form.errors.email}
                            />
                        </Field>

                        <div className="my-6 flex items-center justify-start">
                            <Button
                                className="w-full"
                                disabled={form.processing}
                                data-test="email-password-reset-link-button"
                            >
                                {form.processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}{' '}
                                {trans(
                                    'authentication.button.email_reset_link',
                                )}{' '}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span> {trans('authentication.link.return_login')} </span>
                    <TextLink href={login()}>
                        {' '}
                        {trans('authentication.button.login')}{' '}
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    titleKey: 'authentication.heading.forgot_password',
    descriptionKey: 'authentication.description.forgot_password',
};
