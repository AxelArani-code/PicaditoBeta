import { cn } from "../../lib/utils";
import React, { SelectHTMLAttributes } from "react";

interface Option {
    label: string;
    value: string | number;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Option[];
    fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, fullWidth = true, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
                {label && (
                    <label className="text-small font-medium text-text-primary px-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-body transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <span className="text-xs text-red-500 px-1 font-medium">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
