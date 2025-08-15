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
import { Edit } from "lucide-react";
import { updateCard } from "@/lib/actions/card-actions";
import type { UpdateCardInput } from "@/lib/actions/card-actions";

interface EditCardDialogProps {
  cardId: number;
  currentFront: string;
  currentBack: string;
  trigger?: React.ReactNode;
}

export function EditCardDialog({ 
  cardId, 
  currentFront, 
  currentBack, 
  trigger 
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const data: UpdateCardInput = {
        id: cardId,
        front: formData.get("front") as string,
        back: formData.get("back") as string,
      };

      const result = await updateCard(data);

      if (result.success) {
        setOpen(false);
        // Form will be reset when dialog closes
      } else {
        setError(result.error || "Failed to update card");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error updating card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost">
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update your flashcard content. Make changes to the front and back text below.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front *
              </label>
              <textarea
                id="front"
                name="front"
                defaultValue={currentFront}
                placeholder="Enter the question or prompt..."
                className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isLoading}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back *
              </label>
              <textarea
                id="back"
                name="back"
                defaultValue={currentBack}
                placeholder="Enter the answer or definition..."
                className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
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
              {isLoading ? "Updating..." : "Update Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
