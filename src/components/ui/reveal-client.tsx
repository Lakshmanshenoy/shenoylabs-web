"use client";

import React, { useEffect, useRef, useState } from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };

type RevealProps = DivProps & {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
};

type RevealGroupProps = RevealProps & {
  stagger?: number; // milliseconds between child reveal delays
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RevealGroup({
  children,
  className = "",
  threshold = 0.05,
  rootMargin = "0px 0px -10% 0px",
  once = true,
  stagger = 40,
  ...props
}: RevealGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) obs.disconnect();
          }
        });
      },
      { threshold, rootMargin },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  // Apply stagger as inline transitionDelay to direct child elements
  const childrenWithDelay = React.Children.map(children, (child, i) => {
    if (!React.isValidElement(child)) return child;
    const delay = visible ? `${i * stagger}ms` : undefined;
    const existingStyle = ((child.props as any)?.style as any) || {};
    const style = delay ? { ...existingStyle, transitionDelay: delay } : existingStyle;
    return React.cloneElement(child as React.ReactElement, { style } as any);
  });

  return (
    <div ref={ref} className={`${className} ${visible ? "visible" : ""}`} {...props}>
      {childrenWithDelay}
    </div>
  );
}

export function Reveal({
  children,
  className = "",
  threshold = 0.1,
  rootMargin = "0px 0px -5% 0px",
  once = true,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) obs.disconnect();
          }
        });
      },
      { threshold, rootMargin },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return (
    <div ref={ref} className={`${className} ${visible ? "visible" : ""}`} {...props}>
      {children}
    </div>
  );
}
