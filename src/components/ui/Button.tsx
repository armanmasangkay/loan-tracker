import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

const variantClasses = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
  ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[52px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
