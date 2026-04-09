import React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };

// Server-safe stubs: render the same structure on the server without
// performing client-side DOM mutations. Client animations are handled
// by `reveal-client.tsx` when imported directly from client components.
export function RevealGroup({ children, className = "", ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function Reveal({ children, className = "", ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export default RevealGroup;
