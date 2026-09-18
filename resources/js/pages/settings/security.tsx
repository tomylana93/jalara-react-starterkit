import { useTrans } from '@/hooks/use-trans';
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { useRef } from 'react';
import { update } from '@/actions/App/Http/Controllers/Settings/SecurityController';
import type { UpdatePasswordForm } from '@/types';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';

// oxfmt-ignore
type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const { trans } = useTrans();

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const form = useForm<UpdatePasswordForm>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(update(), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: (errors) => {
                form.reset();
                if (errors.password) {
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <>
            <Head title={trans('security.heading.settings')} />

            <h1 className="sr-only"> {trans('security.heading.settings')} </h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={trans('security.heading.update_password')}
                    description={trans('security.description.update_password')}
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">
                            {' '}
                            {trans('security.label.current_password')}{' '}
                        </Label>

                        <PasswordInput
                            id="current_password"
                            ref={currentPasswordInput}
                            name="current_password"
                            value={form.data.current_password}
                            onChange={(event) =>
                                form.setData(
                                    'current_password',
                                    event.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            placeholder={trans(
                                'security.label.current_password',
                            )}
                        />

                        <InputError message={form.errors.current_password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {' '}
                            {trans('security.label.new_password')}{' '}
                        </Label>

                        <PasswordInput
                            id="password"
                            ref={passwordInput}
                            name="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder={trans('security.label.new_password')}
                            passwordrules={props.passwordRules}
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
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder={trans(
                                'authentication.label.confirm_password',
                            )}
                            passwordrules={props.passwordRules}
                        />

                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            disabled={form.processing}
                            data-test="update-password-button"
                        >
                            {' '}
                            {trans('common.button.save')}{' '}
                        </Button>
                    </div>
                </form>
            </div>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
}

Security.layout = {
    breadcrumbKeys: [
        {
            titleKey: 'security.heading.settings',
            href: edit(),
        },
    ],
};
