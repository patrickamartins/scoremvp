// Implementação padrão do shadcn/ui para Toast
import * as React from "react"

const ToastContext = React.createContext<{
  toast: (options: { title: string; description?: string; variant?: string }) => void
} | undefined>(undefined)

type ToastProviderProps = {
  children: React.ReactNode;
  value: any;
};

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider(props: ToastProviderProps) {
  return (
    <ToastContext.Provider value={props.value}>
      {props.children}
    </ToastContext.Provider>
  );
} 