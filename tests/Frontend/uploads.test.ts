import assert from 'node:assert/strict';
import { test } from 'node:test';
import { acceptsFile, formatFileSize } from '../../resources/js/lib/uploads.ts';

void test('file sizes show bytes, KB and MB rather than image dimensions', () => {
    assert.equal(formatFileSize(0), '0 B');
    assert.equal(formatFileSize(512), '512 B');
    assert.equal(formatFileSize(1536), '1.5 KB');
    assert.equal(formatFileSize(2 * 1024 * 1024), '2.0 MB');
});

void test('file selection supports MIME types, wildcards, and extensions for general files', () => {
    assert.ok(
        acceptsFile(
            { name: 'photo.png', type: 'image/png' },
            'image/jpeg, image/png',
        ),
    );
    assert.ok(
        acceptsFile({ name: 'photo.webp', type: 'image/webp' }, 'image/*'),
    );
    assert.ok(acceptsFile({ name: 'REPORT.PDF', type: '' }, '.pdf'));
    assert.ok(acceptsFile({ name: 'notes.txt', type: 'text/plain' }, ''));
    assert.ok(
        !acceptsFile({ name: 'photo.png', type: 'text/plain' }, 'image/png'),
    );
    assert.ok(
        !acceptsFile({ name: 'notes.txt', type: 'text/plain' }, 'image/*'),
    );
});
