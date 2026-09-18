export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function acceptsFile(
    file: { name: string; type: string },
    accept: string,
): boolean {
    return (
        !accept ||
        accept.split(',').some((entry) => {
            const type = entry.trim().toLowerCase();
            if (type.startsWith('.')) {
                return file.name.toLowerCase().endsWith(type);
            }
            if (type.endsWith('/*')) {
                return file.type.toLowerCase().startsWith(type.slice(0, -1));
            }
            return file.type.toLowerCase() === type;
        })
    );
}
