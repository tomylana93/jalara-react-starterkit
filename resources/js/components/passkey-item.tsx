import { useTrans } from '@/hooks/use-trans';
import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Passkey } from '@/types/auth';

type Props = {
    passkey: Passkey;
    onDelete: (id: number, onError: () => void) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const { trans } = useTrans();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, () => setIsDeleting(false));
    };

    return (
        <div className="flex items-center justify-between border-b p-4 last:border-b-0">
            <div className="flex items-center gap-4">
                <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <KeyRound className="text-muted-foreground h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <p className="font-medium tracking-tight">
                            {passkey.name}
                        </p>
                        {passkey.authenticator && (
                            <span className="bg-muted text-muted-foreground ring-border inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ring-1 ring-inset">
                                {passkey.authenticator}
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {' '}
                        {trans('security.label.added')}{' '}
                        {passkey.created_at_diff}
                        {passkey.last_used_at_diff && (
                            <>
                                <span className="text-muted-foreground/50 mx-1">
                                    /
                                </span>{' '}
                                {trans('security.label.last_used')}{' '}
                                {passkey.last_used_at_diff}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                            {' '}
                            {trans('common.button.remove')}{' '}
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>
                        {' '}
                        {trans('security.heading.remove_passkey')}{' '}
                    </DialogTitle>
                    <DialogDescription>
                        {trans('security.description.remove_passkey', {
                            name: passkey.name,
                        })}
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">
                                {' '}
                                {trans('common.button.cancel')}{' '}
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting
                                ? trans('security.label.removing')
                                : trans('security.heading.remove_passkey')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
