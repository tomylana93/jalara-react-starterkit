<?php

namespace App\Support;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use InvalidArgumentException;

class TranslationExporter
{
    public function __construct(private readonly Filesystem $files) {}

    /**
     * @return array{locales: list<string>, messages: int}
     */
    public function export(string $sourcePath, string $outputPath, string $fallbackLocale): array
    {
        $locales = $this->locales($sourcePath);

        throw_if($locales === [], InvalidArgumentException::class, "No translations were found in [{$sourcePath}].");

        throw_unless(in_array($fallbackLocale, $locales, true), InvalidArgumentException::class, "Fallback locale [{$fallbackLocale}] was not found in [{$sourcePath}].");

        $messages = [];
        $parameters = [];

        foreach ($locales as $locale) {
            $messages[$locale] = $this->messagesForLocale($sourcePath, $locale);
            $parameters[$locale] = $this->parameterMap($messages[$locale]);
        }

        $this->assertMatchingKeys($messages, $fallbackLocale);
        $this->assertMatchingParameters($parameters, $fallbackLocale);
        $this->exportFrameworkTranslations($sourcePath, $locales);
        $this->files->ensureDirectoryExists($outputPath);
        $this->deleteStaleLocaleFiles($outputPath, $locales);

        foreach ($messages as $locale => $localeMessages) {
            $this->writeJson("{$outputPath}/{$locale}.json", $localeMessages);
        }

        $typescript = $this->typescript($locales, $messages[$fallbackLocale], $parameters[$fallbackLocale], $fallbackLocale);
        $this->writeIfChanged("{$outputPath}/messages.ts", $typescript.PHP_EOL);

        return [
            'locales' => $locales,
            'messages' => count(Arr::dot($messages[$fallbackLocale])),
        ];
    }

    /** @param list<string> $locales */
    private function exportFrameworkTranslations(string $sourcePath, array $locales): void
    {
        foreach ($locales as $locale) {
            $path = "{$sourcePath}/{$locale}/framework.php";
            if (! $this->files->exists($path)) {
                continue;
            }
            $translations = require $path;
            throw_unless(is_array($translations) && ! array_is_list($translations), InvalidArgumentException::class, "Framework translation file [{$path}] must return an associative array.");
            foreach ($translations as $key => $value) {
                throw_unless(is_string($key) && is_string($value), InvalidArgumentException::class, "Framework translation file [{$path}] must contain string keys and values.");
            }
            ksort($translations);
            $this->writeJson("{$sourcePath}/{$locale}.json", $translations);
        }
    }

    /** @return list<string> */
    private function locales(string $sourcePath): array
    {
        if (! $this->files->isDirectory($sourcePath)) {
            return [];
        }

        $locales = [];
        foreach (config()->array('localization.locales') as $locale) {
            throw_unless(is_string($locale) && $locale !== '', InvalidArgumentException::class, 'Configured locales must be non-empty strings.');
            $locales[] = $locale;
        }
        sort($locales);

        return array_values(array_unique($locales));
    }

    /** @return array<string, mixed> */
    private function messagesForLocale(string $sourcePath, string $locale): array
    {
        $messages = [];

        foreach (config()->array('localization.domains') as $domain) {
            $path = "{$sourcePath}/{$locale}/{$domain}.php";
            throw_unless($this->files->exists($path), InvalidArgumentException::class, "Frontend translation domain [{$domain}] is missing for [{$locale}].");
            $translations = require $path;
            throw_unless(is_array($translations) && $translations !== [] && ! array_is_list($translations), InvalidArgumentException::class, "Translation file [{$path}] must return a non-empty associative array.");
            $messages[$domain] = $this->normalize($translations, "{$locale}.{$domain}");
        }

        ksort($messages);

        return $messages;
    }

    private function normalize(mixed $value, string $key): mixed
    {
        if (is_string($value)) {
            throw_if(str_contains($value, '|') || preg_match('/(?:\{\d+\}|\[\d+,)/u', $value), InvalidArgumentException::class, "Frontend translation [{$key}] cannot use pluralization.");
            throw_if(preg_match('/(?<!:):[A-Z][A-Za-z0-9_]*/u', $value), InvalidArgumentException::class, "Frontend translation [{$key}] must use lowercase placeholders.");

            return preg_replace('/(?<!:):([A-Za-z_][A-Za-z0-9_]*)/u', '{$1}', $value);
        }

        throw_if(! is_array($value) || (array_is_list($value)), InvalidArgumentException::class, "Translation [{$key}] must be a string or an associative array.");

        $normalized = [];

        foreach ($value as $childKey => $childValue) {
            $normalizedChild = $this->normalize($childValue, "{$key}.{$childKey}");

            if ($normalizedChild !== []) {
                $normalized[$childKey] = $normalizedChild;
            }
        }

        ksort($normalized);

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $messages
     * @return array<string, list<string>>
     */
    private function parameterMap(array $messages): array
    {
        return collect(Arr::dot($messages))
            ->mapWithKeys(function (mixed $message, string $key): array {
                preg_match_all('/\{([A-Za-z_][A-Za-z0-9_]*)\}/u', (string) $message, $matches);

                $parameters = collect($matches[1])->unique()->sort()->values()->all();

                return [$key => array_values($parameters)];
            })
            ->sortKeys()
            ->all();
    }

    /** @param list<string> $locales */
    private function deleteStaleLocaleFiles(string $outputPath, array $locales): void
    {
        foreach ($this->files->glob("{$outputPath}/*.json") as $path) {
            if (! in_array(pathinfo($path, PATHINFO_FILENAME), $locales, true)) {
                $this->files->delete($path);
            }
        }
    }

    /** @param array<string, array<string, mixed>> $messages */
    private function assertMatchingKeys(array $messages, string $fallbackLocale): void
    {
        $fallbackKeys = array_keys(Arr::dot($messages[$fallbackLocale]));
        sort($fallbackKeys);

        foreach ($messages as $locale => $localeMessages) {
            $keys = array_keys(Arr::dot($localeMessages));
            sort($keys);

            if ($keys === $fallbackKeys) {
                continue;
            }

            $missing = array_values(array_diff($fallbackKeys, $keys));
            $extra = array_values(array_diff($keys, $fallbackKeys));

            throw new InvalidArgumentException($this->mismatchMessage($locale, $missing, $extra));
        }
    }

    /** @param array<string, array<string, list<string>>> $parameters */
    private function assertMatchingParameters(array $parameters, string $fallbackLocale): void
    {
        foreach ($parameters as $locale => $localeParameters) {
            foreach ($parameters[$fallbackLocale] as $key => $expected) {
                $actual = $localeParameters[$key];

                if ($actual !== $expected) {
                    throw new InvalidArgumentException(
                        "Translation placeholders for [{$key}] in locale [{$locale}] must match [{$fallbackLocale}]. Expected [".
                        implode(', ', $expected).'], found ['.implode(', ', $actual).'].'
                    );
                }
            }
        }
    }

    /**
     * @param  list<string>  $missing
     * @param  list<string>  $extra
     */
    private function mismatchMessage(string $locale, array $missing, array $extra): string
    {
        $details = [];

        if ($missing !== []) {
            $details[] = 'missing ['.implode(', ', $missing).']';
        }

        if ($extra !== []) {
            $details[] = 'extra ['.implode(', ', $extra).']';
        }

        return "Translation keys for locale [{$locale}] do not match the fallback locale: ".implode('; ', $details).'.';
    }

    /** @param array<string, mixed> $messages */
    private function writeJson(string $path, array $messages): void
    {
        $json = json_encode(
            $messages,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR,
        );

        $this->writeIfChanged($path, $json.PHP_EOL);
    }

    /**
     * @param  list<string>  $locales
     * @param  array<string, mixed>  $fallbackMessages
     * @param  array<string, list<string>>  $parameters
     */
    private function typescript(array $locales, array $fallbackMessages, array $parameters, string $fallbackLocale): string
    {
        $imports = collect($locales)
            ->map(fn (string $locale): string => "import {$this->localeIdentifier($locale)} from './{$locale}.json' with { type: 'json' };")
            ->implode(PHP_EOL);
        $messageEntries = collect($locales)
            ->map(fn (string $locale): string => '    '.$this->typescriptString($locale).": {$this->localeIdentifier($locale)},")
            ->implode(PHP_EOL);
        $parameterEntries = collect($parameters)
            ->map(function (array $names, string $key): string {
                $type = $names === []
                    ? 'Record<string, never>'
                    : '{ '.collect($names)->map(fn (string $name): string => "'{$name}': string | number")->implode('; ').' }';

                return '    '.$this->typescriptString($key).": {$type};";
            })
            ->implode(PHP_EOL);
        $fallbackIdentifier = $this->localeIdentifier($fallbackLocale);
        $messageCount = count(Arr::dot($fallbackMessages));
        $fallbackLocaleLiteral = $this->typescriptString($fallbackLocale);

        return <<<TYPESCRIPT
        // Generated by lang:export. Do not edit.
        {$imports}

        export const messages = {
        {$messageEntries}
        } as const;

        export type AppLocale = keyof typeof messages;
        export type MessageSchema = typeof {$fallbackIdentifier};
        export type MessageKey = keyof MessageParameters;

        export type MessageParameters = {
        {$parameterEntries}
        };

        export const translationMetadata = {
            fallbackLocale: {$fallbackLocaleLiteral},
            messageCount: {$messageCount},
        } as const;
        TYPESCRIPT;
    }

    private function writeIfChanged(string $path, string $contents): void
    {
        if (! $this->files->exists($path) || $this->files->get($path) !== $contents) {
            $this->files->replace($path, $contents);
        }
    }

    private function localeIdentifier(string $locale): string
    {
        return 'locale'.Str::studly(str_replace('-', '_', $locale));
    }

    private function typescriptString(string $value): string
    {
        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
}
