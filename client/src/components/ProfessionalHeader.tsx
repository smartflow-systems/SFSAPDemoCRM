/**
 * Professional Header Component
 * Clean, modern header with quick actions and user menu
 */

import { Bell, Search, Settings, User, LogOut, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfessionalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--sf-gold-dim))]/20 bg-[hsl(var(--sf-black))]/80 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--sf-black))]/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[hsl(var(--sf-gold))]" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--sf-gold))] to-[hsl(var(--sf-gold-bright))] bg-clip-text text-transparent">
            SmartFlow Systems
          </h1>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search... (Ctrl+K)"
              className="w-full pl-9 bg-[hsl(var(--sf-brown))]/30 border-[hsl(var(--sf-gold-dim))]/20 focus:border-[hsl(var(--sf-gold))]/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <Button variant="ghost" size="icon" className="relative">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--sf-gold))] text-[10px] font-bold text-[hsl(var(--sf-black))]">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--sf-gold))]/30">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--sf-gold))] to-[hsl(var(--sf-gold-bright))] text-[hsl(var(--sf-black))]">
                    GB
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Gareth Bowers</p>
                  <p className="text-xs text-muted-foreground">gareth@smartflowsystems.com</p>
                  <Badge className="w-fit mt-1 bg-[hsl(var(--sf-gold))]/10 text-[hsl(var(--sf-gold))] border-[hsl(var(--sf-gold))]/30">
                    Enterprise Plan
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
