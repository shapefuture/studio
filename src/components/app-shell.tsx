
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
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'; // SidebarTrigger removed as it's part of Sidebar now.
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import React from 'react';


const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/onboarding', label: 'Onboarding', icon: Sparkles }, // Changed Icon
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/hc-gym', label: 'HC Gym', icon: Brain },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [onboardingComplete, setOnboardingComplete] = React.useState<boolean | null>(null); // Initialize with null
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const mindframeData = localStorage.getItem('mindframe_mvp_data_v1');
      if (mindframeData) {
          try {
              const parsedData = JSON.parse(mindframeData);
              setOnboardingComplete(parsedData.profile?.onboardingCompleted || false);
          } catch (e) {
              console.error("Failed to parse Mindframe data from localStorage", e);
              setOnboardingComplete(false);
          }
      } else {
          setOnboardingComplete(false);
      }
    }
  }, []);


  if (!isMounted || onboardingComplete === null) { // Show loading state until onboarding status is known
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Logo className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}> {/* Default to open for desktop */}
      <AppSidebar onboardingComplete={onboardingComplete} />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background min-h-[calc(100vh-4rem)]"> {/* Ensure main content takes up space */}
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
  const { toast } = useToast();

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
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "icon"} 
      className={cn(
        "border-r glassmorphic !bg-sidebar/80 dark:!bg-sidebar/70 shadow-apple-lg", // Apply glassmorphic and custom bg
        isMobile ? "w-[280px]" : "" // Sidebar width for mobile when open
      )}
    >
      <SidebarHeader className="p-4 flex items-center justify-between h-16"> {/* Fixed height */}
        <Link href="/" className="flex items-center gap-2.5" prefetch={false}>
          <Logo className="h-7 w-7" />
          {state === "expanded" && <span className="font-semibold text-lg tracking-tight">{APP_NAME}</span>}
        </Link>
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground hover:bg-sidebar-accent/20">
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="py-2"> {/* Add padding */}
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href} className="px-2">
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className={cn(
                    "w-full justify-start rounded-lg h-10 text-sm", // Standardized height and radius
                    "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
                    state === "collapsed" && "justify-center !px-0",
                    "hover:bg-sidebar-accent/50"
                  )}
                  tooltip={state === 'collapsed' ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {state === "expanded" && <span className="ml-2">{item.label}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem className="px-2">
             <SidebarMenuButton
                onClick={() => toast({ title: "Settings", description: "Settings page coming soon!"})}
                className={cn(
                  "w-full justify-start rounded-lg h-10 text-sm",
                  state === "collapsed" && "justify-center !px-0",
                   "hover:bg-sidebar-accent/50"
                )}
                tooltip={state === 'collapsed' ? "Settings" : undefined}
              >
              <Settings className="h-5 w-5" />
              {state === "expanded" && <span className="ml-2">Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppHeader() {
  const { isMobile, toggleSidebar, open } = useSidebar();
  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 dark:bg-background/70 backdrop-blur-lg px-4 md:px-6 shadow-apple",
      isMobile ? "" : (open ? "md:pl-[calc(var(--sidebar-width)_+_1rem)]" : "md:pl-[calc(var(--sidebar-width-icon)_+_1rem)]"),
      "transition-[padding-left] duration-200 ease-linear"
    )}>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0 text-foreground/70 hover:text-foreground"
        >
          <PanelLeftOpen className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      )}
      <div className="flex-1">
        {/* Breadcrumbs or page title can go here */}
      </div>
      <UserMenu />
    </header>
  );
}

function UserMenu() {
  const { toast } = useToast();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://picsum.photos/seed/userPortrait/40/40" alt="User avatar" data-ai-hint="user portrait" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 shadow-apple-lg glassmorphic" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Mindframe User</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile" passHref>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => toast({ title: "Settings", description: "Settings page coming soon!"})} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
