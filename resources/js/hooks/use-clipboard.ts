import { useTrans } from '@/hooks/use-trans';
// Credit: https://usehooks-ts.com/
import { useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

export function useClipboard(): UseClipboardReturn {
    const { trans } = useTrans();

    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = async (text) => {
        if (!navigator?.clipboard) {
            console.warn(trans('common.message.clipboard_unsupported'));

            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);

            return true;
        } catch (error) {
            console.warn(trans('common.message.copy_failed'), error);
            setCopiedText(null);

            return false;
        }
    };

    return [copiedText, copy];
}
