import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "w-full px-4 py-2 rounded-lg border border-alabaster bg-alabaster text-eerieblack placeholder:text-eerieblack/60 focus:outline-none focus:ring-2 focus:ring-persimoon focus:border-persimoon transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export default Input; 