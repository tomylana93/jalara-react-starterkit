import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useTrans } from '@/hooks/use-trans';
import type { BreadcrumbItem } from '@/types';
import type { TextMessageKey } from '@/types';
export default function AppLayout({
    breadcrumbs = [],
    breadcrumbKeys = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    breadcrumbKeys?: {
        titleKey: TextMessageKey;
        href: BreadcrumbItem['href'];
    }[];
    children: React.ReactNode;
}) {
    const { trans } = useTrans();
    return (
        <AppLayoutTemplate
            breadcrumbs={
                breadcrumbKeys.length
                    ? breadcrumbKeys.map(({ titleKey, href }) => ({
                          title: trans(titleKey),
                          href,
                      }))
                    : breadcrumbs
            }
        >
            {children}
        </AppLayoutTemplate>
    );
}
