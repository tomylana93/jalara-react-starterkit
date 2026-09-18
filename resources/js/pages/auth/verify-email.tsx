import { useTrans } from '@/hooks/use-trans';
// Components
import { useForm, Head } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { store } from '@/actions/Laravel/Fortify/Http/Controllers/EmailVerificationNotificationController';
import type { EmptyForm } from '@/types';

export default function VerifyEmail({ status }: { status?: string }) {
    const { trans } = useTrans();

    const form = useForm<EmptyForm>({});

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(store());
    };

    return (
        <>
            <Head title={trans('authentication.heading.verify_email')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {' '}
                    {trans('authentication.message.verification_sent')}{' '}
                </div>
            )}

            <form
                noValidate
                onSubmit={submit}
                className="flex flex-col gap-6 text-center"
            >
                <Button disabled={form.processing} variant="secondary">
                    {form.processing && <Spinner />}{' '}
                    {trans('authentication.button.resend_verification')}{' '}
                </Button>

                <TextLink href={logout()} className="mx-auto block text-sm">
                    {' '}
                    {trans('navigation.button.logout')}{' '}
                </TextLink>
            </form>
        </>
    );
}

VerifyEmail.layout = {
    titleKey: 'authentication.heading.verify_email',
    descriptionKey: 'authentication.description.verify_email',
};
