import { useTrans } from '@/hooks/use-trans';
// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { trans } = useTrans();

    return (
        <>
            <Head title={trans('authentication.heading.verify_email')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {' '}
                    {trans('authentication.message.verification_sent')}{' '}
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}{' '}
                            {trans(
                                'authentication.button.resend_verification',
                            )}{' '}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            {' '}
                            {trans('navigation.button.logout')}{' '}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    titleKey: 'authentication.heading.verify_email',
    descriptionKey: 'authentication.description.verify_email',
};
