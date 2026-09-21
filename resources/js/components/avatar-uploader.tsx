import { router, useHttp } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    store,
    destroy,
} from '@/actions/App/Http/Controllers/Account/AvatarController';
import FileUploader from '@/components/file-uploader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useTrans } from '@/hooks/use-trans';
import type { UploadedFile, UploadFile } from '@/types/uploads';

export default function AvatarUploader({
    initialFile,
    name,
}: {
    initialFile: UploadedFile | null;
    name: string;
}) {
    const { trans } = useTrans();
    const getInitials = useInitials();
    const uploadHttp = useHttp<{ file: File | null }, { data: UploadedFile }>({
        file: null,
    });
    const removeHttp = useHttp<Record<string, never>, { data: null }>({});
    const { cancel: cancelUpload } = uploadHttp;
    const { cancel: cancelRemove } = removeHttp;

    useEffect(
        () => () => {
            cancelUpload();
            cancelRemove();
        },
        [cancelUpload, cancelRemove],
    );

    const upload: UploadFile = async (file, onProgress) => {
        let message = trans('uploads.error.upload');
        uploadHttp.transform(() => ({ file }));
        try {
            const response = await uploadHttp.post(store.url(), {
                onProgress: (progress) => {
                    if (progress.percentage !== undefined)
                        onProgress({ percentage: progress.percentage });
                },
                onError: (errors) => {
                    message = errors.file ?? message;
                },
            });
            return response.data;
        } catch {
            throw new Error(message);
        } finally {
            uploadHttp.transform(() => ({ file: null }));
        }
    };

    async function remove() {
        try {
            await removeHttp.delete(destroy.url());
        } catch {
            throw new Error(trans('uploads.error.remove'));
        }
    }

    function updateAvatar(file: UploadedFile | null) {
        router.replaceProp('auth.user.avatar', file?.thumbnailUrl ?? null);
        router.replaceProp('avatarMedia', file);
    }

    return (
        <FileUploader
            value={initialFile}
            onChange={updateAvatar}
            label={trans('profile.label.avatar')}
            accept="image/jpeg,image/png,image/webp"
            maxSizeBytes={2 * 1024 * 1024}
            upload={upload}
            remove={remove}
            renderPreview={({ url }) =>
                url ? (
                    <img
                        src={url}
                        alt={name}
                        className="size-20 shrink-0 rounded-full object-cover"
                    />
                ) : (
                    <Avatar className="size-20 shrink-0">
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                )
            }
        />
    );
}
