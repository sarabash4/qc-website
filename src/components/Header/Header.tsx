"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function getKosovoTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Tirane",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export default function Header() {
  const [time, setTime] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isDarkRoute = pathname?.startsWith("/playground");
  useEffect(() => {
    const updateTime = () => setTime(getKosovoTime());

    updateTime(); // set immediately after mount
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = (
    <>
      <Link
        href="/information"
        className="hover:opacity-80 transition-opacity"
        onClick={() => setMenuOpen(false)}
      >
        Information
      </Link>
      <Link
        href="/playground"
        className="hover:opacity-80 transition-opacity"
        onClick={() => setMenuOpen(false)}
      >
        Playground
      </Link>
      <Link
        href="/contact"
        className="hover:opacity-80 transition-opacity"
        onClick={() => setMenuOpen(false)}
      >
        Contact
      </Link>
    </>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-[100] flex items-center justify-between p-[15px] lg:grid lg:grid-cols-3 lg:items-center lg:gap-8 ${
          isDarkRoute ? "bg-black text-white" : "bg-white text-black"
        }`}
        style={{ fontFamily: "var(--font-family-base)" }}
      >
        <div
          className="text-sm font-medium md:text-base cursor-pointer"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
        >
          Qendrim Caka
        </div>

        {/* Desktop: centered time */}
        <div className="hidden justify-center lg:flex">
          {time && <span className="tabular-nums text-base">{time} XK</span>}
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex md:items-center md:gap-12 md:text-base lg:justify-end lg:gap-[72px] xl:gap-[150px]">
          {time && <span className="tabular-nums lg:hidden">{time} XK</span>}
          {navLinks}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col justify-center gap-1.5 p-1 md:hidden"
        >
          <span
            className={`h-0.5 w-5 transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            } ${isDarkRoute ? "bg-white" : "bg-black"}`}
          />
          <span
            className={`h-0.5 w-5 transition-opacity ${
              menuOpen ? "opacity-0" : ""
            } ${isDarkRoute ? "bg-white" : "bg-black"}`}
          />
          <span
            className={`h-0.5 w-5 transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            } ${isDarkRoute ? "bg-white" : "bg-black"}`}
          />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className={`fixed inset-x-0 top-14 bottom-0 z-[99] md:hidden ${
            isDarkRoute ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <nav className="flex flex-col gap-6 px-6 pt-8 text-base">
            {time && (
              <span className={`tabular-nums ${isDarkRoute ? "text-white/70" : "text-black/70"}`}>
                {time} XK
              </span>
            )}
            <Link
              href="/information"
              className="font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Information
            </Link>
            <Link
              href="/playground"
              className="font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Playground
            </Link>
            <Link
              href="/contact"
              className="font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
