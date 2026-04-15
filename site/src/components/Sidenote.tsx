"use client";

import { useId } from "react";

export function Sidenote({ children }: { children: React.ReactNode }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="margin-toggle sidenote-number" />
      <input type="checkbox" id={id} className="margin-toggle" />
      <span className="sidenote">{children}</span>
    </>
  );
}

export function MarginNote({ children }: { children: React.ReactNode }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="margin-toggle">
        &#8853;
      </label>
      <input type="checkbox" id={id} className="margin-toggle" />
      <span className="marginnote">{children}</span>
    </>
  );
}
