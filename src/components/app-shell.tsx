
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  Brain,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/logo';
import { APP_NAME } from '@/lib/constants';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import React from 'react';


const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/onboarding', label: 'Onboarding', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/hc-gym', label: 'HC Gym', icon: Brain },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('cognitiveProfile');
      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          setOnboardingComplete(parsedProfile.onboardingCompleted || false);
        } catch (e) {
          console.error("Failed to parse profile from localStorage", e);
          setOnboardingComplete(false);
        }
      }
    }
  }, []);


  return (
    <SidebarProvider defaultOpen>
      <AppSidebar onboardingComplete={onboardingComplete} />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function AppSidebar({ onboardingComplete }: { onboardingComplete: boolean }) {
  const pathname = usePathname();
  const { open, toggleSidebar, isMobile, state } = useSidebar();

  const filteredNavItems = navItems.filter(item => {
    if (item.href === '/onboarding' && onboardingComplete) {
      return false;
    }
    if ((item.href === '/profile' || item.href === '/hc-gym') && !onboardingComplete) {
      return false;
    }
    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Logo />
          {state === "expanded" && <span className="font-semibold text-lg">{APP_NAME}</span>}
        </Link>
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className={cn(
                    "w-full justify-start",
                    state === "collapsed" && "justify-center"
                  )}
                  tooltip={state === 'collapsed' ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {state === "expanded" && <span>{item.label}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton
                className={cn(
                  "w-full justify-start",
                  state === "collapsed" && "justify-center"
                )}
                tooltip={state === 'collapsed' ? "Settings" : undefined}
              >
              <Settings className="h-5 w-5" />
              {state === "expanded" && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppHeader() {
  const { isMobile, toggleSidebar } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0"
        >
          <PanelLeftOpen className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      )}
      <div className="flex-1">
        {/* Current page title could go here, or breadcrumbs */}
      </div>
      <UserMenu />
    </header>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User avatar" data-ai-hint="user avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile" passHref>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
