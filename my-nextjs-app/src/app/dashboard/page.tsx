import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { decksTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, BookOpen, Clock } from "lucide-react";
import { DeckCard } from "@/components/deck-card";

export default async function DashboardPage() {
  // Get the authenticated user's ID
  const { userId } = await auth();
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Fetch the user's decks from the database
  const userDecks = await db.select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(decksTable.updatedAt);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flashcard decks and continue learning
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create-deck">
            <Plus className="mr-2 h-4 w-4" />
            Create New Deck
          </Link>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userDecks.length}</div>
            <p className="text-xs text-muted-foreground">
              Active flashcard decks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Completed today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total cards learned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decks Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Your Decks</h2>
        
        {userDecks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first flashcard deck to start learning
            </p>
            <Button asChild>
              <Link href="/dashboard/create-deck">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Deck
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
