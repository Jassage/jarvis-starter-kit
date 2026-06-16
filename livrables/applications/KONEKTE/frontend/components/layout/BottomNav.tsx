"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Compass, MessageCircle, User, Flame } from "lucide-react";
import NotificationBadge from "./NotificationBadge";

const tabs = [
  { href: "/discover", icon: Compass, label: "Découvrir" },
  { href: "/matches", icon: Heart, label: "Matchs" },
  { href: "/likes", icon: Flame, label: "Likes" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/profile", icon: User, label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
            style={{ color: active ? "#D4537E" : "#9ca3af" }}
          >
            <span className="relative">
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {href === "/messages" && <NotificationBadge />}
            </span>
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
