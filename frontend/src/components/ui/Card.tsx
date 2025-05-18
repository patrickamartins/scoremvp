import * as React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-alabaster rounded-xl shadow-md p-6 border border-eerieblack/10",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

export default Card; 