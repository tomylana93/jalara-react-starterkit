import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

// Keep the production renderer, but prevent its server transport from listening.
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '@inertiajs/react/server') {
            return {
                url: 'data:text/javascript,export default (render) => render',
                shortCircuit: true,
            };
        }
        return nextResolve(specifier, context);
    },
});
const render = (await import('../../bootstrap/ssr/app.js')).default;
const messages = Object.fromEntries(
    await Promise.all(
        ['en', 'id'].map(async (locale) => [
            locale,
            (
                await import(
                    `../../resources/js/locales/generated/${locale}.json`,
                    { with: { type: 'json' } }
                )
            ).default,
        ]),
    ),
);

void test('production SSR renders localized layouts and keeps consecutive requests isolated', async () => {
    for (const locale of ['en', 'id', 'en']) {
        for (const [component, key] of [
            ['auth/login', 'authentication.heading.login'],
            ['auth/register', 'authentication.heading.register'],
            [
                'auth/two-factor-challenge',
                'authentication.heading.authentication_code',
            ],
            ['settings/appearance', 'appearance.heading.settings'],
            ['settings/security', 'security.heading.update_password'],
        ]) {
            const result = await render({
                component,
                props: {
                    name: 'Jalara',
                    auth: {
                        user: {
                            id: 1,
                            name: 'Test User',
                            email: 'test@example.com',
                            email_verified_at: '2026-01-01',
                            created_at: '2026-01-01',
                            updated_at: '2026-01-01',
                        },
                    },
                    sidebarOpen: true,
                    localization: { locale, fallbackLocale: 'en' },
                    canResetPassword: true,
                    passwordRules: '',
                    canManagePasskeys: true,
                    passkeys: [],
                    canManageTwoFactor: false,
                    twoFactorEnabled: false,
                    requiresConfirmation: false,
                },
                url: '/test',
                version: 'test',
                clearHistory: false,
                encryptHistory: false,
                rememberedState: {},
            });
            const expected = key
                .split('.')
                .reduce((value, part) => value[part], messages[locale]);
            assert.ok(
                result.body.includes(expected),
                `${locale} ${component} must render ${expected}`,
            );
            assert.ok(result.head.join('').includes('Jalara'));
        }
    }
});
