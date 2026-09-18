import { useTrans } from '@/hooks/use-trans';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import PasskeyVerify from '@/components/passkey-verify';

export default function ConfirmPassword() {
    const { trans } = useTrans();

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

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {' '}
                                {trans('authentication.label.password')}{' '}
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={trans(
                                    'authentication.label.password',
                                )}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}{' '}
                                {trans(
                                    'authentication.label.confirm_password',
                                )}{' '}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    titleKey: 'authentication.label.confirm_password',
    descriptionKey: 'authentication.description.confirm_password',
};
