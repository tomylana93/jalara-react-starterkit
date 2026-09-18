import { FileIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { useTrans } from '@/hooks/use-trans';
import { acceptsFile, formatFileSize } from '@/lib/uploads';
import { cn } from '@/lib/utils';
import type { UploadedFile, UploadFile } from '@/types/uploads';

type FileUploaderProps = {
    label: string;
    value: UploadedFile | null;
    onChange: (file: UploadedFile | null) => void;
    accept?: string;
    maxSizeBytes?: number;
    upload: UploadFile;
    remove?: () => Promise<void>;
    disabled?: boolean;
    renderPreview?: (preview: {
        url: string | null;
        name?: string;
    }) => ReactNode;
};

export default function FileUploader({
    label,
    value,
    onChange,
    accept = '',
    maxSizeBytes,
    upload,
    remove,
    disabled = false,
    renderPreview,
}: FileUploaderProps) {
    const { trans } = useTrans();
    const id = useId();
    const fileInput = useRef<HTMLInputElement>(null);
    const previewRef = useRef<string | null>(null);
    const requestActive = useRef(false);
    const [selected, setSelected] = useState<{
        file: File;
        preview: string | null;
    } | null>(null);
    const [dragDepth, setDragDepth] = useState(0);
    const [operation, setOperation] = useState<'upload' | 'remove' | null>(
        null,
    );
    const [percentage, setPercentage] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const busy = operation !== null;
    const locked = disabled || busy;
    const previewUrl = selected
        ? selected.preview
        : (value?.thumbnailUrl ?? null);
    const fileName = selected?.file.name ?? value?.name;
    const fileSize = selected?.file.size ?? value?.sizeBytes;

    useEffect(
        () => () => {
            if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        },
        [],
    );

    function clearSelection() {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
        setSelected(null);
        if (fileInput.current) fileInput.current.value = '';
    }

    function selectFile(file?: File) {
        if (!file || disabled || requestActive.current) return;
        clearSelection();
        setError('');
        setStatus('');
        if (!acceptsFile(file, accept)) {
            setError(trans('uploads.error.type'));
            return;
        }
        if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
            setError(
                trans('uploads.error.size', {
                    size: formatFileSize(maxSizeBytes),
                }),
            );
            return;
        }
        const preview =
            file.type.startsWith('image/') && file.type !== 'image/svg+xml'
                ? URL.createObjectURL(file)
                : null;
        previewRef.current = preview;
        setSelected({ file, preview });
    }

    function dropFile(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragDepth(0);
        if (disabled || requestActive.current) return;
        const files = event.dataTransfer.files;
        if (files.length > 1) {
            setError(trans('uploads.error.single'));
            return;
        }
        selectFile(files[0]);
    }

    async function uploadSelected() {
        if (!selected || disabled || requestActive.current) return;
        requestActive.current = true;
        setOperation('upload');
        setError('');
        setStatus('');
        setPercentage(null);
        try {
            const file = await upload(selected.file, (progress) => {
                setPercentage(Math.min(100, Math.max(0, progress.percentage)));
            });
            onChange(file);
            clearSelection();
            setStatus(trans('uploads.status.uploaded'));
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : trans('uploads.error.upload'),
            );
        } finally {
            requestActive.current = false;
            setOperation(null);
            setPercentage(null);
        }
    }

    async function removeStored() {
        if (!value || !remove || disabled || requestActive.current) return;
        requestActive.current = true;
        setOperation('remove');
        setError('');
        setStatus('');
        try {
            await remove();
            onChange(null);
            clearSelection();
            setStatus(trans('uploads.status.removed'));
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : trans('uploads.error.remove'),
            );
        } finally {
            requestActive.current = false;
            setOperation(null);
        }
    }

    return (
        <FieldGroup>
            <Field
                data-invalid={Boolean(error)}
                data-disabled={locked}
                aria-busy={busy}
            >
                <FieldLabel htmlFor={id}>{label}</FieldLabel>
                <div
                    data-slot="upload-dropzone"
                    data-dragging={dragDepth > 0 && !locked}
                    className={cn(
                        'border-input bg-background flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 transition-colors',
                        dragDepth > 0 && !locked && 'border-primary bg-accent',
                        locked && 'opacity-50',
                    )}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        if (
                            !locked &&
                            event.dataTransfer.types.includes('Files')
                        )
                            setDragDepth((depth) => depth + 1);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        setDragDepth((depth) => Math.max(0, depth - 1));
                    }}
                    onDrop={dropFile}
                >
                    {renderPreview ? (
                        renderPreview({ url: previewUrl, name: fileName })
                    ) : previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={fileName ?? label}
                            className="size-20 rounded-md object-cover"
                        />
                    ) : (
                        <FileIcon
                            className="text-muted-foreground size-10 shrink-0"
                            aria-hidden="true"
                        />
                    )}
                    {fileName ? (
                        <div className="flex max-w-full min-w-0 flex-col items-center gap-1">
                            <p
                                className="max-w-full truncate text-sm"
                                title={fileName}
                            >
                                {fileName}
                            </p>
                            {fileSize !== undefined && (
                                <p className="text-muted-foreground text-sm">
                                    {formatFileSize(fileSize)}
                                </p>
                            )}
                            {selected && (
                                <p className="text-muted-foreground text-xs">
                                    {trans('uploads.status.selected')}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center text-sm">
                            {trans('uploads.description.drop')}
                        </p>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        disabled={locked}
                        aria-controls={id}
                        onClick={() => fileInput.current?.click()}
                    >
                        {trans('uploads.button.choose')}
                    </Button>
                </div>
                <input
                    id={id}
                    ref={fileInput}
                    className="sr-only"
                    type="file"
                    accept={accept || undefined}
                    disabled={locked}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(event) => selectFile(event.target.files?.[0])}
                />
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        disabled={!selected || locked}
                        onClick={uploadSelected}
                    >
                        {operation === 'upload' ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <UploadIcon data-icon="inline-start" />
                        )}
                        {trans('uploads.button.upload')}
                    </Button>
                    {selected && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={locked}
                            onClick={clearSelection}
                        >
                            {trans('uploads.button.discard')}
                        </Button>
                    )}
                    {value && remove && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={locked}
                            onClick={removeStored}
                        >
                            {operation === 'remove' ? (
                                <Spinner data-icon="inline-start" />
                            ) : (
                                <Trash2Icon data-icon="inline-start" />
                            )}
                            {trans('uploads.button.remove')}
                        </Button>
                    )}
                </div>
                {operation === 'upload' && (
                    <div
                        className="flex flex-col gap-2"
                        role="status"
                        aria-live="polite"
                    >
                        <Progress
                            value={percentage}
                            aria-label={trans('uploads.status.uploading')}
                        />
                        <p className="text-muted-foreground text-sm">
                            {percentage === 100
                                ? trans('uploads.status.processing')
                                : trans('uploads.status.uploading')}
                            {percentage !== null && percentage < 100 && (
                                <> {percentage}%</>
                            )}
                        </p>
                    </div>
                )}
                <InputError id={`${id}-error`} message={error} role="alert" />
                {status && (
                    <p
                        className="text-muted-foreground text-sm"
                        role="status"
                        aria-live="polite"
                    >
                        {status}
                    </p>
                )}
            </Field>
        </FieldGroup>
    );
}
