import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { db } from "@/db/index";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import StudyInterface from "@/components/study-interface";

interface StudyPageProps {
  params: {
    deckId: string;
  };
}

export default async function StudyPage({ params }: StudyPageProps) {
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

  // If no cards, redirect back to deck page
  if (cards.length === 0) {
    redirect(`/decks/${deckId}?message=no-cards`);
  }

  return (
    <div className="min-h-screen bg-background">
      <StudyInterface
        deck={deckData}
        cards={cards}
        deckId={deckId}
      />
    </div>
  );
}
