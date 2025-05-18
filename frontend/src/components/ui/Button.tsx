import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const variantClasses = {
  primary: "bg-persimoon text-alabaster hover:bg-eerieblack transition-colors",
  secondary: "bg-powderblue text-eerieblack hover:bg-lion transition-colors",
  danger: "bg-red-600 text-alabaster hover:bg-red-700 transition-colors",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        className={cn(
          "px-5 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-persimoon disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button; 