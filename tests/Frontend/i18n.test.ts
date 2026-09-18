import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    createAppI18n,
    createTrans,
    resolveLocalization,
} from '../../resources/js/lib/i18n.ts';

const config = (locale: string, fallbackLocale = 'en') => ({
    locale,
    fallbackLocale,
});

function translator(locale: string) {
    const engine = createAppI18n(config(locale));
    return { engine, trans: createTrans(engine.t.bind(engine)) };
}

test('both languages render messages and named parameters immediately', () => {
    const english = translator('en');
    const indonesian = translator('id');
    assert.equal(english.trans('common.button.save'), 'Save');
    assert.equal(indonesian.trans('common.button.save'), 'Simpan');
    assert.equal(
        indonesian.trans('security.description.remove_passkey', {
            name: '<device>',
        }),
        'Yakin ingin menghapus passkey "<device>"? Anda tidak lagi dapat menggunakannya untuk masuk.',
    );
});

test('unknown active and fallback locales resolve to bundled resources', () => {
    assert.deepEqual(resolveLocalization(config('unknown', 'id')), {
        locale: 'id',
        fallbackLocale: 'id',
    });
    assert.deepEqual(resolveLocalization(config('unknown', 'unknown')), {
        locale: 'en',
        fallbackLocale: 'en',
    });
    assert.equal(translator('unknown').trans('common.button.save'), 'Save');
});

test('separate app instances keep their locales isolated after updates', async () => {
    const first = translator('en');
    const second = translator('en');
    const { engine } = first;
    await engine.changeLanguage('id');
    assert.equal(first.trans('common.button.save'), 'Simpan');
    assert.equal(second.trans('common.button.save'), 'Save');
});

test('missing keys return the key', () => {
    const engine = createAppI18n(config('en'));
    const translate = engine.t.bind(engine);
    assert.equal(translate('missing.key', {}), 'missing.key');
});

// These calls are checked by TypeScript and never executed.
function assertTranslationTypes(trans: ReturnType<typeof createTrans>) {
    trans('common.button.save');
    trans('security.description.remove_passkey', { name: 'Device' });
    // @ts-expect-error unknown translation key
    trans('missing.key');
    // @ts-expect-error required parameter is missing
    trans('security.description.remove_passkey');
    // @ts-expect-error unexpected parameter
    trans('common.button.save', { name: 'Device' });
    // @ts-expect-error incorrect parameter name
    trans('security.description.remove_passkey', { device: 'Device' });
}
void assertTranslationTypes;
