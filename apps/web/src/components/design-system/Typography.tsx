import { cn } from "../../lib/utils";
import React from "react";

interface TypographyProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export const H1 = ({ children, className, as: Component = "h1" }: TypographyProps) => (
    <Component className={cn("text-h1 font-heading text-text-primary", className)}>
        {children}
    </Component>
);

export const H2 = ({ children, className, as: Component = "h2" }: TypographyProps) => (
    <Component className={cn("text-h2 font-heading text-text-primary", className)}>
        {children}
    </Component>
);

export const H3 = ({ children, className, as: Component = "h3" }: TypographyProps) => (
    <Component className={cn("text-h3 font-heading text-text-primary", className)}>
        {children}
    </Component>
);

export const H4 = ({ children, className, as: Component = "h4" }: TypographyProps) => (
    <Component className={cn("text-h4 font-heading text-text-primary", className)}>
        {children}
    </Component>
);

export const Body = ({ children, className, as: Component = "p" }: TypographyProps) => (
    <Component className={cn("text-body font-sans text-text-secondary", className)}>
        {children}
    </Component>
);

export const Small = ({ children, className, as: Component = "span" }: TypographyProps) => (
    <Component className={cn("text-small font-sans text-text-secondary", className)}>
        {children}
    </Component>
);
