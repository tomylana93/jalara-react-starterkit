import { useTrans } from '@/hooks/use-trans';
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                onSubmit={submit}
                className="flex flex-col gap-6"
                inert={form.processing}
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            {' '}
                            {trans('authentication.label.name')}{' '}
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
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
                            message={form.errors.name}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            {' '}
                            {trans('authentication.label.email_address')}{' '}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            name="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            placeholder="email@example.com"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {' '}
                            {trans('authentication.label.password')}{' '}
                        </Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            name="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
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
                            required
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
                            message={form.errors.password_confirmation}
                        />
                    </div>

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
            </form>
        </>
    );
}

Register.layout = {
    titleKey: 'authentication.heading.register',
    descriptionKey: 'authentication.description.register',
};
