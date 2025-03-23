import { LucideIcon } from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
