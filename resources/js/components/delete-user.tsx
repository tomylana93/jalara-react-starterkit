import { useTrans } from '@/hooks/use-trans';
import { useForm } from '@inertiajs/react';
import type { SubmitEventHandler } from 'react';
import { useRef } from 'react';
import { destroy } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import type { DeleteUserForm } from '@/types';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function DeleteUser() {
    const { trans } = useTrans();

    const passwordInput = useRef<HTMLInputElement>(null);

    const form = useForm<DeleteUserForm>({ password: '' });

    const submit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.submit(destroy(), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: () => passwordInput.current?.focus(),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <Heading
                variant="small"
                title={trans('profile.heading.delete_account')}
                description={trans('profile.description.delete_account')}
            />
            <div className="flex flex-col gap-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">
                        {' '}
                        {trans('profile.label.warning')}{' '}
                    </p>
                    <p className="text-sm">
                        {' '}
                        {trans('profile.description.warning')}{' '}
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            {' '}
                            {trans('profile.heading.delete_account')}{' '}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            {' '}
                            {trans('profile.heading.delete_confirmation')}{' '}
                        </DialogTitle>
                        <DialogDescription>
                            {' '}
                            {trans(
                                'profile.description.delete_confirmation',
                            )}{' '}
                        </DialogDescription>

                        <form
                            noValidate
                            onSubmit={submit}
                            className="flex flex-col gap-6"
                        >
                            <FieldGroup>
                                <Field
                                    data-invalid={Boolean(form.errors.password)}
                                    className="grid gap-2"
                                >
                                    <FieldLabel
                                        htmlFor="password"
                                        className="sr-only"
                                    >
                                        {' '}
                                        {trans(
                                            'authentication.label.password',
                                        )}{' '}
                                    </FieldLabel>

                                    <PasswordInput
                                        aria-invalid={Boolean(
                                            form.errors.password,
                                        )}
                                        aria-describedby={
                                            form.errors.password
                                                ? 'delete-user-password-error'
                                                : undefined
                                        }
                                        id="password"
                                        name="password"
                                        value={form.data.password}
                                        onChange={(event) =>
                                            form.setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        ref={passwordInput}
                                        placeholder={trans(
                                            'authentication.label.password',
                                        )}
                                        autoComplete="current-password"
                                    />

                                    <InputError
                                        id="delete-user-password-error"
                                        message={form.errors.password}
                                    />
                                </Field>

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                form.resetAndClearErrors()
                                            }
                                        >
                                            {' '}
                                            {trans('common.button.cancel')}{' '}
                                        </Button>
                                    </DialogClose>

                                    <Button
                                        variant="destructive"
                                        disabled={form.processing}
                                        asChild
                                    >
                                        <button
                                            type="submit"
                                            data-test="confirm-delete-user-button"
                                        >
                                            {' '}
                                            {trans(
                                                'profile.heading.delete_account',
                                            )}{' '}
                                        </button>
                                    </Button>
                                </DialogFooter>
                            </FieldGroup>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
