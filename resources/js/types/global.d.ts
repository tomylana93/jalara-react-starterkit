import type { Auth } from '@/types/auth';
import type { Brand } from '@/types/brand';
import type { Localization } from '@/types';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            localization: Localization;
            name: string;
            auth: Auth;
            brand?: Brand;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
