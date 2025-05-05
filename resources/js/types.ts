import { LucideIcon } from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

// Tipos para el dashboard de seguridad
export interface Vulnerability {
    line: number;
    issue: string;
    suggestion?: string;
}

export interface SecurityResult {
    score: number;
    summary?: string;
    critical_lines?: number[];
    vulnerabilities: Vulnerability[];
}

export interface SecResponse extends Record<string, any> {
    SecContents: SecurityResult[];
    SecNames: string[];
    flash: { success?: string; error?: string };
}
