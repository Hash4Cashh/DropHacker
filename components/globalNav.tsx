"use client";

import React from "react";
import NavLinks from "./NavLinks";

const links = [
  {title: "Home", href: "/"},
  {title: "Tasks", href: "/tasks"},
  {title: "Executions", href: "/executions"},
  {title: "Settings", href: "/settings"},
  {title: "Accounts", href: "/accounts"},
]

export default function GlobalNav({preFix = <div></div>, postFix = <div></div>}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50" style={{zIndex: 100000}}>
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        {preFix}
        <NavLinks links={links}/>
        {postFix}
      </nav>
    </header>
  );
}