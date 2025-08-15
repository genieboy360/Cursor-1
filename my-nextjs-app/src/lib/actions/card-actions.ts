"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for card creation
const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front text is required").max(1000, "Front text too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text too long"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

// Validation schema for card updates
const updateCardSchema = z.object({
  id: z.number().int().positive(),
  front: z.string().min(1, "Front text is required").max(1000, "Front text too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text too long"),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

// Validation schema for card deletion
const deleteCardSchema = z.object({
  id: z.number().int().positive(),
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCard(data: DeleteCardInput) {
  try {
    // Get authenticated user ID
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/sign-in");
    }

    // Validate input data
    const validatedData = deleteCardSchema.parse(data);

    // Verify card ownership by checking the deck ownership
    const cardWithDeck = await db.select({
      cardId: cardsTable.id,
      deckId: cardsTable.deckId,
      deckUserId: decksTable.userId,
    })
      .from(cardsTable)
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(and(
        eq(cardsTable.id, validatedData.id),
        eq(decksTable.userId, userId) // CRITICAL: Verify ownership through deck
      ));

    if (cardWithDeck.length === 0) {
      throw new Error("Card not found or access denied");
    }

    // Delete the card
    const deletedCard = await db.delete(cardsTable)
      .where(eq(cardsTable.id, validatedData.id))
      .returning();

    // Update the deck's updatedAt timestamp
    await db.update(decksTable)
      .set({ updatedAt: new Date() })
      .where(eq(decksTable.id, cardWithDeck[0].deckId));

    // Revalidate the deck page to show the updated card list
    revalidatePath(`/decks/${cardWithDeck[0].deckId}`);

    return { 
      success: true, 
      card: deletedCard[0],
      message: "Card deleted successfully"
    };
  } catch (error) {
    console.error("Failed to delete card:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete card"
    };
  }
}

export async function updateCard(data: UpdateCardInput) {
  try {
    // Get authenticated user ID
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/sign-in");
    }

    // Validate input data
    const validatedData = updateCardSchema.parse(data);

    // Verify card ownership by checking the deck ownership
    const cardWithDeck = await db.select({
      cardId: cardsTable.id,
      deckId: cardsTable.deckId,
      deckUserId: decksTable.userId,
    })
      .from(cardsTable)
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(and(
        eq(cardsTable.id, validatedData.id),
        eq(decksTable.userId, userId) // CRITICAL: Verify ownership through deck
      ));

    if (cardWithDeck.length === 0) {
      throw new Error("Card not found or access denied");
    }

    // Update the card
    const updatedCard = await db.update(cardsTable)
      .set({
        front: validatedData.front,
        back: validatedData.back,
        updatedAt: new Date(),
      })
      .where(eq(cardsTable.id, validatedData.id))
      .returning();

    // Update the deck's updatedAt timestamp
    await db.update(decksTable)
      .set({ updatedAt: new Date() })
      .where(eq(decksTable.id, cardWithDeck[0].deckId));

    // Revalidate the deck page to show the updated card
    revalidatePath(`/decks/${cardWithDeck[0].deckId}`);

    return { 
      success: true, 
      card: updatedCard[0],
      message: "Card updated successfully"
    };
  } catch (error) {
    console.error("Failed to update card:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update card"
    };
  }
}

export async function createCard(data: CreateCardInput) {
  try {
    // Get authenticated user ID
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/sign-in");
    }

    // Validate input data
    const validatedData = createCardSchema.parse(data);

    // Verify deck ownership before creating card
    const deck = await db.select()
      .from(decksTable)
      .where(and(
        eq(decksTable.id, validatedData.deckId),
        eq(decksTable.userId, userId) // CRITICAL: Verify ownership
      ));

    if (deck.length === 0) {
      throw new Error("Deck not found or access denied");
    }

    // Create the new card
    const newCard = await db.insert(cardsTable).values({
      deckId: validatedData.deckId,
      front: validatedData.front,
      back: validatedData.back,
    }).returning();

    // Update the deck's updatedAt timestamp
    await db.update(decksTable)
      .set({ updatedAt: new Date() })
      .where(eq(decksTable.id, validatedData.deckId));

    // Revalidate the deck page to show the new card
    revalidatePath(`/decks/${validatedData.deckId}`);

    return { 
      success: true, 
      card: newCard[0],
      message: "Card created successfully"
    };
  } catch (error) {
    console.error("Failed to create card:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create card"
    };
  }
}
