"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/gallery", label: "影集" },
  { href: "/about", label: "关于" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700/50">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity">
          YuMo
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-dark-300 hover:text-accent transition-colors duration-300 text-sm font-medium">
              {link.label}
            </Link>
          ))}
        </div>
        <button className="md:hidden text-dark-300 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {isOpen && (
        <div className="md:hidden bg-dark-800/95 backdrop-blur-lg border-b border-dark-700">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="block text-dark-300 hover:text-accent transition-colors py-2"
                onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
