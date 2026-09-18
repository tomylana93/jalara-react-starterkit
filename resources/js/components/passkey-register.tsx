import { useTrans } from '@/hooks/use-trans';
import { usePasskeyRegister } from '@laravel/passkeys/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type Props = {
    onSuccess: () => void;
};

export default function PasskeyRegistration({ onSuccess }: Props) {
    const { trans } = useTrans();

    const [name, setName] = useState(() => {
        const ua = navigator.userAgent;

        const browser = [
            { pattern: /Edg|Edge/, name: 'Edge' },
            { pattern: /OPR|Opera|OPiOS/, name: 'Opera' },
            { pattern: /Firefox|FxiOS/, name: 'Firefox' },
            { pattern: /Chrome|CriOS/, name: 'Chrome' },
            { pattern: /Safari/, name: 'Safari' },
        ].find(({ pattern }) => pattern.test(ua))?.name;

        const os = [
            { pattern: /iPhone/, name: 'iPhone' },
            { pattern: /iPad|Macintosh(?=.*Mobile)/, name: 'iPad' },
            { pattern: /Android/, name: 'Android' },
            { pattern: /Mac/, name: 'Mac' },
            { pattern: /Windows/, name: 'Windows' },
        ].find(({ pattern }) => pattern.test(ua))?.name;

        return [browser, os].filter(Boolean).join(' on ') || '';
    });

    const [showForm, setShowForm] = useState(false);
    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setName('');
            setShowForm(false);
            onSuccess();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        await register(name);
    };

    const handleCancel = () => {
        setShowForm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <div className="text-muted-foreground text-sm">
                {' '}
                {trans('security.message.passkeys_unsupported')}{' '}
            </div>
        );
    }

    if (!showForm) {
        return (
            <Button variant="outline" onClick={() => setShowForm(true)}>
                {' '}
                {trans('security.button.add_passkey')}{' '}
            </Button>
        );
    }

    return (
        <form
            noValidate
            onSubmit={handleSubmit}
            className="border-border bg-muted/50 flex flex-col gap-4 rounded-lg border p-4"
        >
            <FieldGroup>
                <Field className="grid gap-2">
                    <FieldLabel htmlFor="passkey-name">
                        {' '}
                        {trans('security.label.passkey_name')}{' '}
                    </FieldLabel>
                    <Input
                        id="passkey-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={trans('security.placeholder.passkey_name')}
                        className="border-foreground/20 mt-1 block w-full"
                        autoFocus
                    />
                    <p className="text-muted-foreground text-xs">
                        {' '}
                        {trans('security.description.passkey_name')}{' '}
                    </p>
                </Field>

                {error && <InputError message={error} />}

                <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading || !name.trim()}>
                        {isLoading
                            ? trans('security.label.registering')
                            : trans('security.button.register_passkey')}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                    >
                        {' '}
                        {trans('common.button.cancel')}{' '}
                    </Button>
                </div>
            </FieldGroup>
        </form>
    );
}
