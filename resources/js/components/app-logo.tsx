import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { brand, name } = usePage().props;

    if (brand?.logoFull) {
        return (
            <div className="flex min-w-0 items-center gap-2">
                <img
                    src={brand.logoFull}
                    alt={name}
                    className="h-8 max-w-36 object-contain object-left"
                />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-2">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </div>
    );
}
