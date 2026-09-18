import type { MessageKey } from '../locales/generated/messages.ts';
import type { TranslationArguments } from '../types/index.ts';
import { createInstance } from 'i18next';
import { messages } from '../locales/generated/messages.ts';
import type { AppLocale } from '../locales/generated/messages.ts';
import type { Localization } from '../types/index.ts';

export function resolveLocalization(config: Localization): {
    locale: AppLocale;
    fallbackLocale: AppLocale;
} {
    const fallbackLocale = Object.hasOwn(messages, config.fallbackLocale)
        ? (config.fallbackLocale as AppLocale)
        : 'en';
    return {
        locale: Object.hasOwn(messages, config.locale)
            ? (config.locale as AppLocale)
            : fallbackLocale,
        fallbackLocale,
    };
}

export function createAppI18n(config: Localization) {
    const { locale, fallbackLocale } = resolveLocalization(config);
    const i18n = createInstance();
    void i18n.init({
        lng: locale,
        fallbackLng: fallbackLocale,
        supportedLngs: Object.keys(messages),
        resources: Object.fromEntries(
            Object.entries(messages).map(([language, translation]) => [
                language,
                { translation },
            ]),
        ),
        initAsync: false,
        interpolation: { prefix: '{', suffix: '}', escapeValue: false },
    });
    return i18n;
}

export function createTrans(
    translate: (
        key: string,
        parameters: Record<string, string | number>,
    ) => string,
) {
    return function trans<Key extends MessageKey>(
        key: Key,
        ...[parameters]: TranslationArguments<Key>
    ): string {
        return translate(key, parameters ?? {});
    };
}
