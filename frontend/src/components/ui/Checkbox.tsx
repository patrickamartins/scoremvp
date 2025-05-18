import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "h-4 w-4 rounded border-eerieblack/30 text-persimoon focus:ring-persimoon transition-colors",
        className
      )}
      {...props}
    />
  );
});
Checkbox.displayName = "Checkbox";

export default Checkbox; 