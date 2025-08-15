"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DeckCardProps {
  deck: {
    id: number;
    name: string;
    description: string | null;
    createdAt: Date;
  };
}

export function DeckCard({ deck }: DeckCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/decks/${deck.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent, href: string) => {
    e.stopPropagation();
    router.push(href);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader>
        <CardTitle className="text-lg">{deck.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {deck.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Created {new Date(deck.createdAt).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => handleButtonClick(e, `/decks/${deck.id}`)}
            >
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
