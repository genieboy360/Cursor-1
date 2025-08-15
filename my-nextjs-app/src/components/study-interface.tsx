"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  ArrowLeft, 
  Check, 
  X,
  Trophy,
  RefreshCw 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StudyCard {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyDeck {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyInterfaceProps {
  deck: StudyDeck;
  cards: StudyCard[];
  deckId: number;
}

export default function StudyInterface({ deck, cards, deckId }: StudyInterfaceProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const currentCard = cards[currentCardIndex];
  const totalCards = cards.length;
  const progress = ((currentCardIndex + 1) / totalCards) * 100;

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setStudyComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleCorrect = () => {
    setCorrectCount(correctCount + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    setIncorrectCount(incorrectCount + 1);
    handleNext();
  };

  const restartStudy = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyComplete(false);
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  // Study completion screen
  if (studyComplete) {
    const accuracy = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Study Complete!</h1>
            <p className="text-muted-foreground">
              You've finished studying the "{deck.name}" deck
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">{totalCards}</div>
                  <div className="text-sm text-muted-foreground">Total Cards</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-lg font-semibold">Accuracy: {accuracy}%</div>
                <Progress value={accuracy} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button onClick={restartStudy} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
            <Button asChild>
              <Link href={`/decks/${deckId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deck
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main study interface
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/decks/${deckId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deck
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{deck.name}</h1>
              <p className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {totalCards}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={restartStudy}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="flex justify-center">
          <div 
            className="relative w-full max-w-2xl h-96 cursor-pointer"
            onClick={handleFlip}
          >
            <div className={cn(
              "absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d",
              isFlipped && "rotate-y-180"
            )}>
              {/* Front of card */}
              <Card className={cn(
                "absolute inset-0 w-full h-full backface-hidden border-2 hover:border-primary/50 transition-colors",
                !isFlipped && "shadow-lg"
              )}>
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Front
                  </div>
                  <div className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                    {currentCard.front}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Click to reveal answer
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card className={cn(
                "absolute inset-0 w-full h-full backface-hidden border-2 rotate-y-180 hover:border-primary/50 transition-colors",
                isFlipped && "shadow-lg"
              )}>
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Back
                  </div>
                  <div className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                    {currentCard.back}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    How did you do?
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {isFlipped ? (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleIncorrect}
                  className="border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <X className="h-4 w-4 mr-2 text-red-600" />
                  Incorrect
                </Button>
                <Button
                  size="lg"
                  onClick={handleCorrect}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Correct
                </Button>
              </div>
            ) : (
              <Button size="lg" onClick={handleFlip} variant="outline">
                Show Answer
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
              disabled={currentCardIndex === totalCards - 1 && !isFlipped}
            >
              {currentCardIndex === totalCards - 1 ? "Finish" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Score Display */}
        {(correctCount > 0 || incorrectCount > 0) && (
          <div className="flex justify-center">
            <Card className="w-fit">
              <CardContent className="p-4 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Correct: {correctCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Incorrect: {incorrectCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
