"use client";

import { useEffect } from "react";

type Props = {
  id: string;
};

// Track injected templates to avoid mutating DOM nodes or using `any`
const injectedTemplates = new WeakSet<HTMLTemplateElement>();

export default function JsonLdInjector({ id }: Props) {
  useEffect(() => {
    try {
      const tmpl = document.getElementById(id) as HTMLTemplateElement | null;
      if (!tmpl) return;
      // Avoid double-injection
      if (injectedTemplates.has(tmpl)) return;

      const script = document.createElement("script");
      script.type = "application/ld+json";
      // Use the template's innerHTML (the JSON string) as the script body
      script.textContent = tmpl.innerHTML;
      document.head.appendChild(script);

      injectedTemplates.add(tmpl);
    } catch {
      // ignore
    }
  }, [id]);

  return null;
}
