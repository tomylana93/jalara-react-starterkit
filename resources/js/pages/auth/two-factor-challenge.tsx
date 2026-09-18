import { useTrans } from '@/hooks/use-trans';
import { useForm, Head, setLayoutProps } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/actions/Laravel/Fortify/Http/Controllers/TwoFactorAuthenticatedSessionController';
import type { TwoFactorChallengeForm, TwoFactorRecoveryForm } from '@/types';

export default function TwoFactorChallenge() {
    const { trans } = useTrans();

    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const codeForm = useForm<TwoFactorChallengeForm>({ code: '' });
    const recoveryForm = useForm<TwoFactorRecoveryForm>({ recovery_code: '' });
    const processing = codeForm.processing || recoveryForm.processing;

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        if (showRecoveryInput) {
            recoveryForm.submit(store(), {
                onError: () => recoveryForm.reset(),
            });
            return;
        }
        codeForm.submit(store(), {
            onError: () => codeForm.reset(),
            onSuccess: () => codeForm.reset(),
        });
    };

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: trans('authentication.heading.recovery_code'),
                description: trans('authentication.description.recovery_code'),
                toggleText: trans(
                    'authentication.link.use_authentication_code',
                ),
            };
        }

        return {
            title: trans('authentication.heading.authentication_code'),
            description: trans(
                'authentication.description.authentication_code',
            ),
            toggleText: trans('authentication.link.use_recovery_code'),
        };
    }, [showRecoveryInput, trans]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (): void => {
        setShowRecoveryInput(!showRecoveryInput);
        codeForm.resetAndClearErrors();
        recoveryForm.resetAndClearErrors();
    };

    return (
        <>
            <Head title={trans('security.heading.two_factor')} />

            <div className="space-y-6">
                <form onSubmit={submit} className="space-y-4">
                    {showRecoveryInput ? (
                        <>
                            <Input
                                name="recovery_code"
                                value={recoveryForm.data.recovery_code}
                                onChange={(event) =>
                                    recoveryForm.setData(
                                        'recovery_code',
                                        event.target.value,
                                    )
                                }
                                type="text"
                                placeholder={trans(
                                    'authentication.placeholder.recovery_code',
                                )}
                                autoFocus={showRecoveryInput}
                                required
                            />
                            <InputError
                                message={recoveryForm.errors.recovery_code}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">
                            <div className="flex w-full items-center justify-center">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={codeForm.data.code}
                                    onChange={(value) =>
                                        codeForm.setData('code', value)
                                    }
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <InputError message={codeForm.errors.code} />
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        {' '}
                        {trans('common.button.continue')}{' '}
                    </Button>

                    <div className="text-muted-foreground text-center text-sm">
                        <span>
                            {' '}
                            {trans(
                                'authentication.description.alternative',
                            )}{' '}
                        </span>
                        <button
                            type="button"
                            className="text-foreground cursor-pointer underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                            onClick={toggleRecoveryMode}
                        >
                            {authConfigContent.toggleText}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

TwoFactorChallenge.layout = {
    titleKey: 'authentication.heading.authentication_code',
    descriptionKey: 'authentication.description.authentication_code',
};
