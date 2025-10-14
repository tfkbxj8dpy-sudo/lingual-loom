import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const Flashcards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();
  const [words, setWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchWords();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchWords();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedLanguage]);

  const fetchWords = async () => {
    if (!selectedLanguage) return;

    const { data } = await supabase
      .from("words")
      .select("*")
      .eq("language_id", selectedLanguage)
      .order("created_at", { ascending: false });
    
    if (data) setWords(data);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleMarkDifficulty = async (difficulty: "easy" | "medium" | "hard") => {
    const word = words[currentIndex];
    const { error } = await supabase
      .from("words")
      .update({ difficulty })
      .eq("id", word.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update difficulty",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Marked as ${difficulty}`,
      });
      fetchWords();
      handleNext();
    }
  };

  if (words.length === 0) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Flashcards
              </h1>
            </header>
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6">
              <p className="text-muted-foreground mb-4">No words available for flashcards</p>
              <Button onClick={() => navigate("/dashboard")} className="bg-gradient-primary">
                Add Words
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Flashcards
            </h1>
          </header>

          <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 space-y-6">
            <div className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {words.length}
            </div>

            <Card
              className="w-full max-w-2xl h-96 shadow-card-hover cursor-pointer transition-all duration-500 transform hover:scale-105"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <CardContent
                className="h-full flex flex-col items-center justify-center p-8"
                style={{
                  backfaceVisibility: "hidden",
                }}
              >
                {!isFlipped ? (
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold">{currentWord.word}</h2>
                    {currentWord.image_url && (
                      <img
                        src={currentWord.image_url}
                        alt={currentWord.word}
                        className="w-48 h-48 object-cover rounded-lg mx-auto"
                      />
                    )}
                    <p className="text-muted-foreground">Click to reveal definition</p>
                  </div>
                ) : (
                  <div
                    className="text-center space-y-4"
                    style={{
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-xl">{currentWord.definition}</p>
                    {currentWord.example_sentence && (
                      <p className="text-sm italic text-muted-foreground border-l-2 border-primary pl-4">
                        "{currentWord.example_sentence}"
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={() => handleMarkDifficulty("easy")}
                className="bg-success hover:bg-success/90"
              >
                Easy
              </Button>
              <Button
                onClick={() => handleMarkDifficulty("medium")}
                className="bg-warning hover:bg-warning/90"
              >
                Medium
              </Button>
              <Button
                onClick={() => handleMarkDifficulty("hard")}
                className="bg-destructive hover:bg-destructive/90"
              >
                Hard
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Flip
              </Button>
              <Button variant="outline" onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Flashcards;
