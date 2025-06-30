import React, { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  return <>{children}</>;
} 