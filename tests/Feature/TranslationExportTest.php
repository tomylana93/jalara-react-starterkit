<?php

use App\Support\TranslationExporter;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

beforeEach(function (): void {
    config(['localization.domains' => ['common']]);
});

/** @param Closure(string, string): void $test */
function withTranslationFixture(Closure $test): void
{
    $source = storage_path('framework/testing/i18n-'.Str::uuid());
    $output = $source.'/generated';

    try {
        foreach (['en', 'id'] as $locale) {
            File::ensureDirectoryExists($source.'/'.$locale);
            File::put($source.'/'.$locale.'/common.php', "<?php return ['button' => ['save' => 'Save'], 'message' => ['greeting' => 'Hello, :name']];");
        }

        $test($source, $output);
    } finally {
        File::deleteDirectory($source);
    }
}

test('export includes only frontend domains and generates required parameter types', function (): void {
    withTranslationFixture(function (string $source, string $output): void {
        File::put($source.'/en/auth.php', "<?php return ['failed' => 'Server only'];");
        File::put($source.'/id/common.php', "<?php return ['button' => ['save' => 'Simpan'], 'message' => ['greeting' => 'Halo, :name']];");

        $this->artisan('lang:export', ['--source' => $source, '--output' => $output])->assertSuccessful();

        expect(json_decode(File::get($output.'/id.json'), true, flags: JSON_THROW_ON_ERROR))->toBe([
            'common' => ['button' => ['save' => 'Simpan'], 'message' => ['greeting' => 'Halo, {name}']],
        ])->and(File::get($output.'/messages.ts'))
            ->toContain('"common.button.save": Record<string, never>')
            ->toContain('"common.message.greeting": { \'name\': string | number }');
    });
});

test('invalid source fails before replacing an existing export', function (string $lines, string $reason): void {
    withTranslationFixture(function (string $source, string $output) use ($lines, $reason): void {
        $exporter = resolve(TranslationExporter::class);
        $exporter->export($source, $output, 'en');
        $previous = File::get($output.'/id.json');
        File::put($source.'/id/common.php', '<?php return '.$lines.';');

        expect(fn (): array => $exporter->export($source, $output, 'en'))
            ->toThrow(InvalidArgumentException::class, $reason)
            ->and(File::get($output.'/id.json'))->toBe($previous);
    });
})->with([
    'missing key' => ["['button' => ['save' => 'Simpan']]", 'Translation keys'],
    'extra key' => ["['button' => ['save' => 'Simpan', 'extra' => 'Extra'], 'message' => ['greeting' => 'Halo, :name']]", 'Translation keys'],
    'different parameter' => ["['button' => ['save' => 'Simpan'], 'message' => ['greeting' => 'Halo, :user']]", 'Translation placeholders'],
    'numeric array' => ["['button' => ['save' => ['Simpan']], 'message' => ['greeting' => 'Halo, :name']]", 'associative array'],
    'non-string value' => ["['button' => ['save' => 1], 'message' => ['greeting' => 'Halo, :name']]", 'string or an associative array'],
    'uppercase placeholder' => ["['button' => ['save' => 'Simpan'], 'message' => ['greeting' => 'Halo, :Name']]", 'lowercase placeholders'],
    'plural choices' => ["['button' => ['save' => 'Simpan'], 'message' => ['greeting' => 'One | Many']]", 'pluralization'],
    'plural interval' => ["['button' => ['save' => 'Simpan'], 'message' => ['greeting' => '{0} None']]", 'pluralization'],
]);

test('missing domain makes the export command fail', function (): void {
    withTranslationFixture(function (string $source, string $output): void {
        File::delete($source.'/id/common.php');

        $this->artisan('lang:export', ['--source' => $source, '--output' => $output])->assertFailed();

        expect(File::exists($output))->toBeFalse();
    });
});

test('repeated export preserves canonical bytes and removes stale locale files', function (): void {
    withTranslationFixture(function (string $source, string $output): void {
        $exporter = resolve(TranslationExporter::class);
        $exporter->export($source, $output, 'en');
        $previous = File::get($output.'/messages.ts');
        File::put($output.'/unused.json', '{}');

        $exporter->export($source, $output, 'en');

        expect(File::get($output.'/messages.ts'))->toBe($previous)
            ->and(File::exists($output.'/unused.json'))->toBeFalse();
    });
});

test('framework translations generate Laravel JSON without entering the frontend bundle', function (): void {
    withTranslationFixture(function (string $source, string $output): void {
        File::put($source.'/id/framework.php', "<?php return ['Reset your password' => 'Atur ulang kata sandi Anda', 'Expires in :count minutes' => 'Kedaluwarsa dalam :count menit'];");
        $this->artisan('lang:export', ['--source' => $source, '--output' => $output])->assertSuccessful();
        expect(json_decode(File::get($source.'/id.json'), true, flags: JSON_THROW_ON_ERROR))->toBe([
            'Expires in :count minutes' => 'Kedaluwarsa dalam :count menit',
            'Reset your password' => 'Atur ulang kata sandi Anda',
        ])->and(File::get($output.'/id.json'))->not->toContain('Reset your password');
    });
});
