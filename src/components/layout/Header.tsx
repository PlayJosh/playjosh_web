'use client';

import { Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
}

export function Header({ title = 'PlayJosh', showNotifications = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PJ</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-success text-xs font-medium px-2 py-1 bg-success/10 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Safe</span>
          </div>
          {showNotifications && (
            <Button variant="ghost" size="iconSm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
