"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function SecondaryNav({
  links,
}: {
  links: Array<{ text: string; href: string }>;
}) {
  const path = usePathname();
  console.log(path);
  return (
    <div className="flex flex-inline gap-8">
      {links.map((link, i) => {
        return (
          <Link
            key={i}
            title="Providers"
            href={link.href}
            className={`btn-sec-nav ${path === link.href && "active"}`}
          >
            {link.text}
          </Link>
        );
      })}
    </div>
  );
}
