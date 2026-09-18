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
            ['auth/confirm-password', 'authentication.label.confirm_password'],
            ['auth/forgot-password', 'authentication.heading.forgot_password'],
            ['auth/reset-password', 'authentication.heading.reset_password'],
            ['auth/verify-email', 'authentication.heading.verify_email'],
            [
                'auth/two-factor-challenge',
                'authentication.heading.authentication_code',
            ],
            ['dashboard', 'navigation.label.dashboard'],
            ['settings/profile', 'profile.heading.settings'],
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
                    avatarMedia: {
                        id: '1',
                        name: 'saved-avatar.png',
                        mimeType: 'image/png',
                        sizeBytes: 1536,
                        url: '/storage/1/saved-avatar.png',
                        thumbnailUrl:
                            '/storage/1/conversions/saved-avatar-thumbnail.webp',
                    },
                    email: 'reset@example.com',
                    token: 'reset-token',
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

            const appearanceLabel =
                messages[locale].appearance.heading.settings;
            const appearanceButtons = [
                ...result.body.matchAll(/<button\b[^>]*>/g),
            ].filter(([button]) =>
                button.includes(`aria-label="${appearanceLabel}"`),
            );
            assert.equal(
                appearanceButtons.length,
                1,
                `${locale} ${component} must render one appearance button`,
            );
            const headers = [
                ...result.body.matchAll(/<header\b[^>]*>[\s\S]*?<\/header>/g),
            ];
            assert.ok(
                headers.some(([header]) =>
                    header.includes(`aria-label="${appearanceLabel}"`),
                ),
                component,
            );
            assert.doesNotMatch(
                result.body,
                /href="[^"]*settings\/appearance/,
                component,
            );

            for (const [form] of result.body.matchAll(/<form\b[^>]*>/g)) {
                assert.match(form, /\bnovalidate(?:\s|=|>)/i, component);
            }
            assert.doesNotMatch(
                result.body,
                /<input\b[^>]*\btype="email"/,
                component,
            );
            assert.doesNotMatch(
                result.body,
                /<input\b[^>]*\srequired(?:\s|=|>)/,
                component,
            );
            assert.doesNotMatch(
                result.body,
                /<input\b[^>]*\spattern=/,
                component,
            );
            for (const [input] of result.body.matchAll(
                /<input\b[^>]*\bname="email"[^>]*>/g,
            )) {
                assert.match(input, /\btype="text"/, component);
                assert.match(input, /\binputmode="email"/i, component);
            }

            if (component === 'settings/profile') {
                assert.ok(result.body.includes('saved-avatar.png'));
                assert.ok(result.body.includes('1.5 KB'));
                assert.match(
                    result.body,
                    /<img[^>]*src="\/storage\/1\/conversions\/saved-avatar-thumbnail.webp"/,
                );
                assert.ok(result.body.includes('data-slot="upload-dropzone"'));
                assert.match(result.body, /<input[^>]*type="file"/);
                assert.doesNotMatch(result.body, /blob:/);
                assert.ok(result.body.includes('value="Test User"'));
                assert.ok(result.body.includes('value="test@example.com"'));
            }

            if (component === 'auth/reset-password') {
                assert.ok(result.body.includes('value="reset@example.com"'));
            }
        }
    }
});
