import AppearanceMenu from '@/components/appearance-menu';
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import { useTrans } from '@/hooks/use-trans';
import type { TextMessageKey } from '@/types';
export default function AuthLayout({
    title = '',
    description = '',
    titleKey,
    descriptionKey,
    children,
}: {
    title?: string;
    description?: string;
    titleKey?: TextMessageKey;
    descriptionKey?: TextMessageKey;
    children: React.ReactNode;
}) {
    const { trans } = useTrans();
    return (
        <div className="relative">
            <header className="absolute top-4 right-4 z-20">
                <AppearanceMenu />
            </header>
            <AuthLayoutTemplate
                title={title || (titleKey ? trans(titleKey) : '')}
                description={
                    description || (descriptionKey ? trans(descriptionKey) : '')
                }
            >
                {children}
            </AuthLayoutTemplate>
        </div>
    );
}
