import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { createTrans } from '@/lib/i18n';

export function useTrans() {
    const { t } = useTranslation();
    const trans = useMemo(
        () => createTrans((key, parameters) => t(key, parameters)),
        [t],
    );
    return { trans };
}
