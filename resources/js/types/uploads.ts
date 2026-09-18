export type UploadedFile = {
    id: string;
    name: string;
    mimeType: string | null;
    sizeBytes: number;
    url: string;
    thumbnailUrl: string | null;
};

export type UploadProgress = { percentage: number };

export type UploadFile = (
    file: File,
    onProgress: (progress: UploadProgress) => void,
) => Promise<UploadedFile>;
