import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import IconRefresh from "./icons/iconRefresh";

export default function NavLinks({links}: {links: Array<{title: string, href: string}>}) {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-inline items-center gap-2">
      <div className={`flex gap-x-12 bg-white p-2 px-8 rounded-lg shadow-lg`}>
        {links.map((link, i) => {
          return (
            <Link key={i} href={link.href} className={`hover:scale-105 text-sm leading-6 text-gray-900 ${path === link.href ? "font-black" : "font-semibold"}`}>
              {link.title}
            </Link>
          )
        })}
      </div>
      <IconRefresh onClick={() => router.refresh()} size="lg"/>
    </div>
  );
}
