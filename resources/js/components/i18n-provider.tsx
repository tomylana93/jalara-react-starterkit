import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createAppI18n, resolveLocalization } from '@/lib/i18n';
import type { Localization } from '@/types';

export function AppI18nProvider({
    children,
    localization,
}: {
    children: ReactNode;
    localization: Localization;
}) {
    const [i18n] = useState(() => createAppI18n(localization));
    useEffect(() => {
        const sync = (config: Localization) => {
            const { locale, fallbackLocale } = resolveLocalization(config);
            i18n.options.fallbackLng = fallbackLocale;
            void i18n.changeLanguage(locale);
            document.documentElement.lang = locale;
        };
        sync(localization);
        return router.on('navigate', ({ detail }) =>
            sync(detail.page.props.localization),
        );
    }, [i18n, localization]);
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
