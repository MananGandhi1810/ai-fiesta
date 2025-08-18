'use client';

// This component is now a no-op because auth is enforced server-side.
export function ProtectedRoute({ children }) {
  return children;
}
