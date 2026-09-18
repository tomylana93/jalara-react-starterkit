import { useTrans } from '@/hooks/use-trans';
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            {' '}
                            {trans('authentication.label.email')}{' '}
                        </Label>
                        <Input
                            id="email"
                            type="email"
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
                            message={form.errors.email}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {' '}
                            {trans('authentication.label.password')}{' '}
                        </Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            autoComplete="new-password"
                            className="mt-1 block w-full"
                            autoFocus
                            placeholder={trans('authentication.label.password')}
                            passwordrules={passwordRules}
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            {' '}
                            {trans(
                                'authentication.label.confirm_password',
                            )}{' '}
                        </Label>
                        <PasswordInput
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
                            message={form.errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={form.processing}
                        data-test="reset-password-button"
                    >
                        {form.processing && <Spinner />}{' '}
                        {trans('authentication.heading.reset_password')}{' '}
                    </Button>
                </div>
            </form>
        </>
    );
}

ResetPassword.layout = {
    titleKey: 'authentication.heading.reset_password',
    descriptionKey: 'authentication.description.reset_password',
};
