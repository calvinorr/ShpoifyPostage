"use client"

import * as React from "react"
import {
  Calculator,
  Package2,
  BarChart3,
  Settings,
  History,
  ShieldCheck,
  Home,
  Menu,
  Bell,
  User
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Navigation items
const navItems = [
  {
    title: "Calculator",
    url: "/",
    icon: Calculator,
    description: "Calculate shipping costs"
  },
  {
    title: "Price History",
    url: "/history",
    icon: History,
    description: "View price trends"
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    description: "Analytics & insights"
  },
  {
    title: "Admin",
    url: "/admin",
    icon: ShieldCheck,
    description: "System administration",
    badge: "Admin"
  }
]

const settingsItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "App preferences"
  }
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white">
                      <Package2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        Royal Mail Calculator
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        Shipping Cost Calculator
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.description}
                      >
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Preferences</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.description}
                      >
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                      <User className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Royal Mail</span>
                      <span className="truncate text-xs text-muted-foreground">
                        v1.0.0
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
                  {pathname === "/" && "Calculator"}
                  {pathname === "/history" && "Price History"}
                  {pathname === "/dashboard" && "Dashboard"}
                  {pathname === "/admin" && "Admin"}
                  {pathname === "/settings" && "Settings"}
                </h1>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}