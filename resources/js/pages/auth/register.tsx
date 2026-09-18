import { useTrans } from '@/hooks/use-trans';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { trans } = useTrans();

    return (
        <>
            <Head title={trans('authentication.button.register')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
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
                                    placeholder={trans(
                                        'authentication.placeholder.full_name',
                                    )}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {' '}
                                    {trans(
                                        'authentication.label.email_address',
                                    )}{' '}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {' '}
                                    {trans(
                                        'authentication.label.password',
                                    )}{' '}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={trans(
                                        'authentication.label.password',
                                    )}
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
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
                                    placeholder={trans(
                                        'authentication.label.confirm_password',
                                    )}
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}{' '}
                                {trans(
                                    'authentication.button.create_account',
                                )}{' '}
                            </Button>
                        </div>

                        <div className="text-muted-foreground text-center text-sm">
                            {' '}
                            {trans(
                                'authentication.description.has_account',
                            )}{' '}
                            <TextLink href={login()} tabIndex={6}>
                                {' '}
                                {trans('authentication.button.login')}{' '}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    titleKey: 'authentication.heading.register',
    descriptionKey: 'authentication.description.register',
};
