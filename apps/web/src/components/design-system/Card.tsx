import { cn } from "../../lib/utils";
import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    shadow?: "sm" | "md" | "lg";
    hoverable?: boolean;
}

export const Card = ({
    children,
    className,
    padding = "md",
    shadow = "sm",
    hoverable = false,
}: CardProps) => {
    const paddings = {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-8",
    };

    const shadows = {
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
    };

    return (
        <div
            className={cn(
                "rounded-lg border border-border bg-white transition-all duration-200",
                paddings[padding],
                shadows[shadow],
                hoverable && "hover:-translate-y-1 hover:shadow-md",
                className
            )}
        >
            {children}
        </div>
    );
};
