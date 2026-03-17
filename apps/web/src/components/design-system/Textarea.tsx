import { cn } from "../../lib/utils";
import React, { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, fullWidth = true, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
                {label && (
                    <label className="text-small font-medium text-text-primary px-1">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        "flex min-h-[100px] w-full rounded-md border border-border bg-white px-3 py-2 text-body transition-all placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-red-500 px-1 font-medium">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
