import { useTrans } from '@/hooks/use-trans';
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

import { Spinner } from '@/components/ui/spinner';
import { store } from '@/actions/Laravel/Fortify/Http/Controllers/ConfirmablePasswordController';
import type { ConfirmPasswordForm } from '@/types';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import PasskeyVerify from '@/components/passkey-verify';

export default function ConfirmPassword() {
    const { trans } = useTrans();

    const form = useForm<ConfirmPasswordForm>({ password: '' });

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(store(), {
            onSuccess: () => form.reset('password'),
        });
    };

    return (
        <>
            <Head title={trans('authentication.label.confirm_password')} />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label={trans('authentication.button.confirm_passkey')}
                loadingLabel={trans('authentication.label.confirming')}
                separator={trans(
                    'authentication.description.confirm_alternative',
                )}
            />

            <form noValidate onSubmit={submit}>
                <FieldGroup>
                    <div className="flex flex-col gap-6">
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
                                        ? 'confirm-password-password-error'
                                        : undefined
                                }
                                id="password"
                                name="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                placeholder={trans(
                                    'authentication.label.password',
                                )}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError
                                id="confirm-password-password-error"
                                message={form.errors.password}
                            />
                        </Field>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={form.processing}
                                data-test="confirm-password-button"
                            >
                                {form.processing && <Spinner />}{' '}
                                {trans(
                                    'authentication.label.confirm_password',
                                )}{' '}
                            </Button>
                        </div>
                    </div>
                </FieldGroup>
            </form>
        </>
    );
}

ConfirmPassword.layout = {
    titleKey: 'authentication.label.confirm_password',
    descriptionKey: 'authentication.description.confirm_password',
};
