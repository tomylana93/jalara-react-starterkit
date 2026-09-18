import { useTrans } from '@/hooks/use-trans';
import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { trans } = useTrans();

    return (
        <>
            <Head title={trans('appearance.heading.settings')} />

            <h1 className="sr-only">
                {' '}
                {trans('appearance.heading.settings')}{' '}
            </h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={trans('appearance.heading.settings')}
                    description={trans('appearance.description.settings')}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbKeys: [
        {
            titleKey: 'appearance.heading.settings',
            href: editAppearance(),
        },
    ],
};
