import { cn } from "../../lib/utils";
import React from "react";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    padding?: boolean;
}

export const Container = ({
    children,
    className,
    size = "lg",
    padding = true,
}: ContainerProps) => {
    const sizes = {
        sm: "max-w-3xl",
        md: "max-w-5xl",
        lg: "max-w-7xl",
        xl: "max-w-[1440px]",
        full: "max-w-none",
    };

    return (
        <div
            className={cn(
                "mx-auto w-full",
                sizes[size],
                padding && "px-4 sm:px-6 lg:px-8",
                className
            )}
        >
            {children}
        </div>
    );
};
