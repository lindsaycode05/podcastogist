'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';

type ThemeToggleProps = {
  className?: string;
};

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark =
    theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  if (!mounted) {
    return (
      <div
        className={cn('size-9 rounded-md border border-transparent', className)}
        aria-hidden='true'
      />
    );
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className={cn(
        'relative overflow-hidden border border-transparent transition-all duration-300',
        className
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      <Sun
        className={cn(
          'size-4 transition-all duration-300',
          isDark ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
      />
      <Moon
        className={cn(
          'absolute size-4 transition-all duration-300',
          isDark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}
      />
    </Button>
  );
};
