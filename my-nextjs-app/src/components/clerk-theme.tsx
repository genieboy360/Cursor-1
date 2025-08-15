"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return ClerkProvider with a safe default appearance during SSR
    return (
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "hsl(var(--primary))",
            colorBackground: "hsl(var(--background))",
            borderRadius: "calc(var(--radius) - 2px)",
          }
        }}
      >
        {children}
      </ClerkProvider>
    );
  }

  // Determine if we should use dark theme based on current theme
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const appearance = {
    baseTheme: isDark ? dark : undefined,
    variables: {
      colorPrimary: "hsl(var(--primary))",
      colorBackground: "hsl(var(--background))",
      colorInputBackground: "hsl(var(--input))",
      colorInputText: "hsl(var(--foreground))",
      colorText: "hsl(var(--foreground))",
      colorTextSecondary: "hsl(var(--muted-foreground))",
      colorNeutral: "hsl(var(--border))",
      colorDanger: "hsl(var(--destructive))",
      borderRadius: "calc(var(--radius) - 2px)",
    },
    elements: {
      // Modal backdrop with proper contrast
      modalBackdrop: "backdrop-blur-sm",
      modalContent: "bg-background border border-border shadow-2xl",
      
      // Modal content
      card: "bg-background border border-border shadow-lg",
      headerTitle: "text-foreground font-semibold",
      headerSubtitle: "text-muted-foreground",
      
      // Form elements with better contrast
      formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md border-0 font-medium",
      formFieldInput: "bg-background border-2 border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20",
      formFieldLabel: "text-foreground font-medium",
      
      // Social buttons
      socialButtonsBlockButton: "bg-background border-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground",
      socialButtonsBlockButtonText: "text-foreground",
      
      // Links and secondary elements
      footerActionLink: "text-primary hover:text-primary/80 font-medium",
      identityPreviewText: "text-muted-foreground",
      identityPreviewEditButtonIcon: "text-muted-foreground hover:text-foreground",
      
      // Divider
      dividerLine: "bg-border",
      dividerText: "text-muted-foreground bg-background px-2",
      
      // Loading states
      spinner: "text-primary",
      
      // Error states
      formFieldError: "text-destructive font-medium",
      alertText: "text-destructive",
      
      // Verification
      formResendCodeLink: "text-primary hover:text-primary/80 font-medium",
      
      // User button dropdown
      userButtonPopoverCard: "bg-background border border-border shadow-lg",
      userButtonPopoverActionButton: "text-foreground hover:bg-accent hover:text-accent-foreground",
      userButtonPopoverActionButtonText: "text-foreground",
      userButtonPopoverActionButtonIcon: "text-muted-foreground",
      
      // Footer
      footer: "bg-background border-t border-border",
      footerActionText: "text-muted-foreground",
    }
  };

  return (
    <ClerkProvider appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
