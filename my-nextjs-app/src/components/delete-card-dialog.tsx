"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { deleteCard } from "@/lib/actions/card-actions";
import type { DeleteCardInput } from "@/lib/actions/card-actions";

interface DeleteCardDialogProps {
  cardId: number;
  cardFront: string;
  cardBack: string;
  trigger?: React.ReactNode;
}

export function DeleteCardDialog({ 
  cardId, 
  cardFront, 
  cardBack, 
  trigger 
}: DeleteCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: DeleteCardInput = {
        id: cardId,
      };

      const result = await deleteCard(data);

      if (result.success) {
        setOpen(false);
        // The page will be revalidated automatically by the server action
      } else {
        setError(result.error || "Failed to delete card");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error deleting card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Truncate text for display if too long
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost">
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Front</div>
              <div className="text-sm bg-muted p-3 rounded-md">
                {truncateText(cardFront)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Back</div>
              <div className="text-sm bg-muted p-3 rounded-md">
                {truncateText(cardBack)}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 text-sm text-destructive">
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
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
