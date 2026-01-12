"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  TrendingUp,
  Wallet,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Flame,
} from "lucide-react";
import { useMarketStore } from "@/stores";

interface SidebarProps {
  className?: string;
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
    badge: "Breaking",
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const { favoriteMarkets } = useMarketStore();

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background/80 backdrop-blur-md transition-all duration-300",
        collapsed ? "w-16" : "w-[280px]",
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg">Palpiteiros</span>
          </Link>
        ) : (
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto"
          >
            <Sparkles className="h-4 w-4" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isBreaking = item.name === "Breaking";

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-200",
                    isActive && "bg-accent",
                    isBreaking && !isActive && "hover:bg-orange-500/10",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isBreaking && "text-orange-500"
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={isBreaking ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            isBreaking && "bg-orange-500 hover:bg-orange-600"
                          )}
                        >
                          {item.badge === "Breaking" ? (
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              {item.badge}
                            </span>
                          ) : (
                            item.badge
                          )}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <>
            <Separator className="my-4" />
            <div className="px-2">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                Favorites ({favoriteMarkets.size})
              </p>
              {favoriteMarkets.size > 0 ? (
                <div className="space-y-1">
                  {Array.from(favoriteMarkets).slice(0, 3).map((id) => (
                    <Link
                      key={id}
                      href={`/markets/${id}`}
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
          </>
        )}
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t p-2">
        {!collapsed ? (
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Guest User</p>
              <p className="text-xs text-muted-foreground truncate">
                View profile
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="w-full">
              <User className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
