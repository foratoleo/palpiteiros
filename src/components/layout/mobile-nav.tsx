"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useMarketStore } from "@/stores";
import {
  Home,
  TrendingUp,
  Wallet,
  Bell,
  Settings,
  X,
  Sparkles,
  Flame,
} from "lucide-react";

interface MobileNavProps {
  open?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Markets",
    href: "/markets",
    icon: TrendingUp,
  },
  {
    name: "Breaking",
    href: "/breaking",
    icon: Flame,
    badge: "Hot",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileNav({ open = false, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { favoriteMarkets } = useMarketStore();

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl transition-transform duration-200 ease-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold"
              onClick={onClose}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg">Palpiteiros</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const isBreaking = item.name === "Breaking";

                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 transition-all duration-200",
                        isActive && "bg-accent",
                        isBreaking && !isActive && "hover:bg-orange-500/10"
                      )}
                    >
                      <div className="relative">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isBreaking && "text-orange-500"
                          )}
                        />
                        {isBreaking && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                          </span>
                        )}
                      </div>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={isBreaking ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            isBreaking && "bg-orange-500 hover:bg-orange-600"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                Favorites ({favoriteMarkets.size})
              </p>
              {favoriteMarkets.size > 0 ? (
                <div className="space-y-1">
                  {Array.from(favoriteMarkets).slice(0, 5).map((id) => (
                    <Link
                      key={id}
                      href={`/markets/${id}`}
                      onClick={onClose}
                      className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors truncate"
                    >
                      Market {id.slice(-4)}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-2 text-xs text-muted-foreground">
                  No favorites yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface BottomTabBarProps {
  className?: string;
}

export function BottomTabBar({ className }: BottomTabBarProps) {
  const pathname = usePathname();
  const { favoriteMarkets } = useMarketStore();

  const tabs = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Markets",
      href: "/markets",
      icon: TrendingUp,
      badge: favoriteMarkets.size > 0 ? favoriteMarkets.size : undefined,
    },
    {
      name: "Breaking",
      href: "/breaking",
      icon: Flame,
      isBreaking: true,
    },
    {
      name: "Portfolio",
      href: "/portfolio",
      icon: Wallet,
    },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md md:hidden",
        className
      )}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                (tab as any).isBreaking && !isActive && "text-orange-500"
              )}
              aria-label={tab.name}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {(tab as any).isBreaking && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                )}
                {tab.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-2 h-4 min-w-4 p-0 text-[10px] flex items-center justify-center"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px]">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
