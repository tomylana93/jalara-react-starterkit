import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { useTrans } from '@/hooks/use-trans';

export default function AppearanceMenu() {
    const { appearance, updateAppearance } = useAppearance();
    const { trans } = useTrans();
    const options = [
        { value: 'light', icon: Sun, label: trans('appearance.label.light') },
        { value: 'dark', icon: Moon, label: trans('appearance.label.dark') },
        {
            value: 'system',
            icon: Monitor,
            label: trans('appearance.label.system'),
        },
    ] as const;
    const ActiveIcon =
        options.find((option) => option.value === appearance)?.icon ?? Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={trans('appearance.heading.settings')}
                >
                    <ActiveIcon aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={appearance}>
                    {options.map(({ value, icon: Icon, label }) => (
                        <DropdownMenuRadioItem
                            key={value}
                            value={value}
                            onSelect={() => updateAppearance(value)}
                        >
                            <Icon aria-hidden="true" />
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
