"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { updateDeck } from "@/lib/actions/deck-actions";
import type { UpdateDeckInput } from "@/lib/actions/deck-actions";

interface EditDeckDialogProps {
  deckId: number;
  currentName: string;
  currentDescription?: string;
  trigger?: React.ReactNode;
}

export function EditDeckDialog({ 
  deckId, 
  currentName, 
  currentDescription, 
  trigger 
}: EditDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const data: UpdateDeckInput = {
        id: deckId,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
      };

      const result = await updateDeck(data);

      if (result.success) {
        setOpen(false);
        // Form will be reset when dialog closes
      } else {
        setError(result.error || "Failed to update deck");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error updating deck:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update your deck's name and description. Make it easy to remember what you're studying.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Deck Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={currentName}
                placeholder="Enter deck name..."
                required
                disabled={isLoading}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                defaultValue={currentDescription || ""}
                placeholder="What are you studying? (optional)"
                className="min-h-[80px] resize-none"
                disabled={isLoading}
                maxLength={1000}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
