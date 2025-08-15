import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { db } from "@/db/index";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Play, Edit, Plus, Trash2, BookOpen } from "lucide-react";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardDialog } from "@/components/delete-card-dialog";

interface DeckPageProps {
  params: {
    deckId: string;
  };
}

export default async function DeckPage({ params }: DeckPageProps) {
  // Get the authenticated user's ID
  const { userId } = await auth();
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  const deckId = parseInt(params.deckId);
  
  // Validate deckId is a valid number
  if (isNaN(deckId)) {
    notFound();
  }

  // Fetch the deck with user ownership verification
  const deck = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId) // CRITICAL: Verify ownership
    ));

  // Return 404 if deck not found or doesn't belong to user
  if (deck.length === 0) {
    notFound();
  }

  const deckData = deck[0];

  // Fetch all cards for this deck
  const cards = await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(cardsTable.createdAt);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{deckData.name}</h1>
            <p className="text-muted-foreground mt-1">
              {deckData.description || "No description available"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/decks/${deckId}/study`}>
              <Play className="h-4 w-4 mr-2" />
              Study Deck
            </Link>
          </Button>
          <EditDeckDialog 
            deckId={deckId}
            currentName={deckData.name}
            currentDescription={deckData.description || ""}
          />
        </div>
      </div>

      {/* Deck Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
            <p className="text-xs text-muted-foreground">
              Flashcards in this deck
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(deckData.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Deck creation date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(deckData.updatedAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last modification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Flashcards</h2>
          <AddCardDialog deckId={deckId} />
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first flashcard to start building this deck
            </p>
            <AddCardDialog 
              deckId={deckId} 
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Card
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Flashcard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Front</div>
                    <div className="text-sm bg-muted p-3 rounded-md">
                      {card.front}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Back</div>
                    <div className="text-sm bg-muted p-3 rounded-md">
                      {card.back}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(card.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-1">
                      <EditCardDialog 
                        cardId={card.id}
                        currentFront={card.front}
                        currentBack={card.back}
                      />
                      <DeleteCardDialog 
                        cardId={card.id}
                        cardFront={card.front}
                        cardBack={card.back}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
