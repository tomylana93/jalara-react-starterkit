import { useTrans } from '@/hooks/use-trans';
import { useForm, Head, setLayoutProps } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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

            <div className="flex flex-col gap-6">
                <form
                    noValidate
                    onSubmit={submit}
                    className="flex flex-col gap-4"
                >
                    <FieldGroup>
                        {showRecoveryInput ? (
                            <Field
                                data-invalid={Boolean(
                                    recoveryForm.errors.recovery_code,
                                )}
                            >
                                <FieldLabel
                                    htmlFor="recovery-code"
                                    className="sr-only"
                                >
                                    {trans(
                                        'authentication.placeholder.recovery_code',
                                    )}
                                </FieldLabel>
                                <Input
                                    aria-invalid={Boolean(
                                        recoveryForm.errors.recovery_code,
                                    )}
                                    aria-describedby={
                                        recoveryForm.errors.recovery_code
                                            ? 'two-factor-challenge-recovery-code-error'
                                            : undefined
                                    }
                                    id="recovery-code"
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
                                />
                                <InputError
                                    id="two-factor-challenge-recovery-code-error"
                                    message={recoveryForm.errors.recovery_code}
                                />
                            </Field>
                        ) : (
                            <Field
                                data-invalid={Boolean(codeForm.errors.code)}
                                className="flex flex-col items-center justify-center gap-3 text-center"
                            >
                                <div className="flex w-full items-center justify-center">
                                    <InputOTP
                                        inputMode="numeric"
                                        aria-label={trans(
                                            'authentication.heading.authentication_code',
                                        )}
                                        aria-invalid={Boolean(
                                            codeForm.errors.code,
                                        )}
                                        aria-describedby={
                                            codeForm.errors.code
                                                ? 'two-factor-challenge-code-error'
                                                : undefined
                                        }
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={codeForm.data.code}
                                        onChange={(value) =>
                                            codeForm.setData('code', value)
                                        }
                                        disabled={processing}
                                        autoFocus
                                    >
                                        <InputOTPGroup>
                                            {Array.from(
                                                { length: OTP_MAX_LENGTH },
                                                (_, index) => (
                                                    <InputOTPSlot
                                                        aria-invalid={Boolean(
                                                            codeForm.errors
                                                                .code,
                                                        )}
                                                        key={index}
                                                        index={index}
                                                    />
                                                ),
                                            )}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <InputError
                                    id="two-factor-challenge-code-error"
                                    message={codeForm.errors.code}
                                />
                            </Field>
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
                    </FieldGroup>
                </form>
            </div>
        </>
    );
}

TwoFactorChallenge.layout = {
    titleKey: 'authentication.heading.authentication_code',
    descriptionKey: 'authentication.description.authentication_code',
};
