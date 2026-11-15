"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, ShieldCheck, UserCheck, Menu, X, KeyRound } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: "/elderly",
      label: "Elderly View",
      icon: UserCheck,
      desc: "Large-button daily routine",
    },
    {
      href: "/caregiver",
      label: "Caregiver Dashboard",
      icon: ShieldCheck,
      desc: "Adherence & circle oversight",
    },
    {
      href: "/passcode",
      label: "Passcode Login",
      icon: KeyRound,
      desc: "Quick 6-digit access",
    },
  ];

  return (
    <header className="bg-white border-b border-parchment-300 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-terracotta-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded-lg p-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-terracotta-50 border border-terracotta-200 flex items-center justify-center text-terracotta-600 shadow-sm">
              <HeartHandshake className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-charcoal-900 block leading-none">
                Care<span className="text-terracotta-500">Circle</span>
              </span>
              <span className="text-xs font-semibold text-sage-700 tracking-wide block mt-1">
                Elderly Care &amp; Medication
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-terracotta-50 text-terracotta-700 border border-terracotta-200 shadow-sm"
                      : "text-charcoal-800 hover:bg-parchment-100 hover:text-terracotta-600"
                  }`}
                >
                  <Icon className="w-4 h-4 text-terracotta-500" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-charcoal-800 hover:bg-parchment-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="md:hidden py-4 border-t border-parchment-200 space-y-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base transition-colors ${
                    isActive
                      ? "bg-terracotta-50 text-terracotta-700 border border-terracotta-200"
                      : "text-charcoal-900 hover:bg-parchment-100"
                  }`}
                >
                  <Icon className="w-5 h-5 text-terracotta-500" aria-hidden="true" />
                  <div>
                    <div>{link.label}</div>
                    <div className="text-xs font-normal text-charcoal-800">
                      {link.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

