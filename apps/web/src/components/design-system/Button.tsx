import { cn } from "../../lib/utils";
import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-sm",
            secondary: "bg-green-100 text-green-900 hover:bg-green-200 active:bg-green-300",
            outline: "border border-border bg-transparent hover:bg-surface text-text-primary",
            ghost: "bg-transparent hover:bg-surface text-text-secondary hover:text-text-primary",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-small rounded-sm",
            md: "px-4 py-2 text-body rounded-md",
            lg: "px-6 py-3 text-h4 rounded-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
