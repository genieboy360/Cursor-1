"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for deck update
const updateDeckSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Deck name is required").max(255, "Deck name too long"),
  description: z.string().max(1000, "Description too long").optional(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeck(data: UpdateDeckInput) {
  try {
    // Get authenticated user ID
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/sign-in");
    }

    // Validate input data
    const validatedData = updateDeckSchema.parse(data);

    // Verify deck ownership before updating
    const existingDeck = await db.select()
      .from(decksTable)
      .where(and(
        eq(decksTable.id, validatedData.id),
        eq(decksTable.userId, userId) // CRITICAL: Verify ownership
      ));

    if (existingDeck.length === 0) {
      throw new Error("Deck not found or access denied");
    }

    // Update the deck
    const updatedDeck = await db.update(decksTable)
      .set({
        name: validatedData.name,
        description: validatedData.description || "",
        updatedAt: new Date(),
      })
      .where(and(
        eq(decksTable.id, validatedData.id),
        eq(decksTable.userId, userId) // CRITICAL: Verify ownership in update
      ))
      .returning();

    // Revalidate relevant pages
    revalidatePath(`/decks/${validatedData.id}`);
    revalidatePath("/dashboard");

    return { 
      success: true, 
      deck: updatedDeck[0],
      message: "Deck updated successfully"
    };
  } catch (error) {
    console.error("Failed to update deck:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update deck"
    };
  }
}
