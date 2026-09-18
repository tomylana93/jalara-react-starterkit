import type {
    MessageKey,
    MessageParameters,
} from '../locales/generated/messages';

export type Localization = { locale: string; fallbackLocale: string };
export type TextMessageKey = {
    [Key in MessageKey]: MessageParameters[Key] extends Record<string, never>
        ? Key
        : never;
}[MessageKey];

export type TranslationArguments<Key extends MessageKey> =
    MessageParameters[Key] extends Record<string, never>
        ? [parameters?: MessageParameters[Key]]
        : [parameters: MessageParameters[Key]];
