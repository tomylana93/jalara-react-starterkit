import { router, useHttp } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    destroy,
    store,
} from '@/actions/App/Http/Controllers/Settings/BrandAssetController';
import FileUploader from '@/components/file-uploader';
import { useTrans } from '@/hooks/use-trans';
import type { BrandAssetOption } from '@/types';
import type { UploadedFile, UploadFile } from '@/types/uploads';

type BrandAssetUploaderProps = {
    asset: BrandAssetOption;
};

export default function BrandAssetUploader({ asset }: BrandAssetUploaderProps) {
    const { trans } = useTrans();
    const [current, setCurrent] = useState(asset.file);
    const uploadHttp = useHttp<{ file: File | null }, { data: UploadedFile }>({
        file: null,
    });
    const removeHttp = useHttp<Record<string, never>, { data: null }>({});

    useEffect(() => setCurrent(asset.file), [asset.file]);
    useEffect(
        () => () => {
            uploadHttp.cancel();
            removeHttp.cancel();
        },
        [],
    );

    const upload: UploadFile = async (file, onProgress) => {
        uploadHttp.setData('file', file);

        try {
            const response = await uploadHttp.post(store.url(asset.value), {
                onProgress: (progress) => {
                    if (progress.percentage !== undefined) {
                        onProgress({ percentage: progress.percentage });
                    }
                },
            });

            return response.data;
        } catch {
            throw new Error(
                String(uploadHttp.errors.file ?? trans('uploads.error.upload')),
            );
        } finally {
            uploadHttp.reset('file');
        }
    };

    async function remove() {
        try {
            await removeHttp.delete(destroy.url(asset.value));
        } catch {
            throw new Error(trans('uploads.error.remove'));
        }
    }

    function change(file: UploadedFile | null) {
        setCurrent(file);
        router.reload();
    }

    return (
        <div className="rounded-lg border p-4">
            <FileUploader
                label={asset.label}
                value={current}
                accept={asset.accept}
                maxSizeBytes={asset.maxSizeBytes}
                upload={upload}
                remove={remove}
                onChange={change}
            />
        </div>
    );
}
