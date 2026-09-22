import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTrans } from '@/hooks/use-trans';
import { cn, toUrl } from '@/lib/utils';
import { edit as editBrand } from '@/routes/settings/brand';
import { edit as editGeneral } from '@/routes/settings/general';
import type { NavItem } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { trans } = useTrans();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const sidebarNavItems: NavItem[] = [
        {
            title: trans('navigation.label.general'),
            href: editGeneral(),
            icon: null,
        },
        {
            title: trans('navigation.label.brand'),
            href: editBrand(),
            icon: null,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading
                title={trans('general_settings.heading.settings')}
                description={trans('general_settings.description.settings')}
            />

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col gap-1"
                        aria-label={trans('general_settings.heading.settings')}
                    >
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={toUrl(item.href)}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl">{children}</section>
                </div>
            </div>
        </div>
    );
}
