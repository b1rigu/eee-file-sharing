"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderLink({
  href,
  title,
  onClick,
}: {
  href: string;
  title: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={`text-sm font-medium hover:text-blue-400 transition-colors ${
        pathname === href ? "text-blue-400" : ""
      }`}
      onClick={onClick}
    >
      {title}
    </Link>
  );
}
