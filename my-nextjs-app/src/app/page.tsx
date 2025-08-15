import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-foreground">
          Zulfi Cards
        </h1>
        <h2 className="text-2xl text-muted-foreground">
          Your Genie for cards
        </h2>
        
        <SignedOut>
          <div className="flex gap-4 mt-8 justify-center">
            <SignInButton mode="modal">
              <Button size="lg">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="flex gap-4 mt-8 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/create-deck">
                Create New Deck
              </Link>
            </Button>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
