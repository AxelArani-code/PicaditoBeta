import { cn } from "../../lib/utils";
import React from "react";

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "surface" | "alternate";
    padding?: "none" | "sm" | "md" | "lg";
}

export const Section = ({
    children,
    className,
    variant = "default",
    padding = "md",
}: SectionProps) => {
    const variants = {
        default: "bg-background",
        surface: "bg-surface",
        alternate: "bg-green-50",
    };

    const paddings = {
        none: "py-0",
        sm: "py-8 md:py-12",
        md: "py-12 md:py-24",
        lg: "py-24 md:py-32 uw:py-48",
    };

    return (
        <section
            className={cn(
                variants[variant],
                paddings[padding],
                className
            )}
        >
            {children}
        </section>
    );
};
