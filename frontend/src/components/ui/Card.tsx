import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = ({ children, className, ...props }: CardProps) => (
  <div 
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

export { Card }; 