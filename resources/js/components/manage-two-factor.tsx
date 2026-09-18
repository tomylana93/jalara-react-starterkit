import { useTrans } from '@/hooks/use-trans';
import { useForm } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import {
    store as enable,
    destroy as disable,
} from '@/actions/Laravel/Fortify/Http/Controllers/TwoFactorAuthenticationController';
import type { EmptyForm } from '@/types';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const { trans } = useTrans();

    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const enableForm = useForm<EmptyForm>({});
    const disableForm = useForm<EmptyForm>({});

    const enableTwoFactor: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        enableForm.submit(enable(), {
            onSuccess: () => setShowSetupModal(true),
        });
    };

    const disableTwoFactor: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        disableForm.submit(disable());
    };

    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={trans('security.heading.two_factor')}
                description={trans('security.description.two_factor')}
            />
            {twoFactorEnabled ? (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-muted-foreground text-sm">
                        {' '}
                        {trans('security.description.two_factor_enabled')}{' '}
                    </p>

                    <div className="relative inline">
                        <form onSubmit={disableTwoFactor}>
                            <Button
                                variant="destructive"
                                type="submit"
                                disabled={disableForm.processing}
                            >
                                {' '}
                                {trans(
                                    'security.button.disable_two_factor',
                                )}{' '}
                            </Button>
                        </form>
                    </div>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-muted-foreground text-sm">
                        {' '}
                        {trans('security.description.two_factor_disabled')}{' '}
                    </p>

                    <div>
                        {hasSetupData ? (
                            <Button onClick={() => setShowSetupModal(true)}>
                                <ShieldCheck />{' '}
                                {trans('security.button.continue_setup')}{' '}
                            </Button>
                        ) : (
                            <form onSubmit={enableTwoFactor}>
                                <Button
                                    type="submit"
                                    disabled={enableForm.processing}
                                >
                                    {' '}
                                    {trans(
                                        'security.button.enable_two_factor',
                                    )}{' '}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
