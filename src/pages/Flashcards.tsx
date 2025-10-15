import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterMode = "all" | "category" | "forgot";

const Flashcards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();
  const [words, setWords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) {
          fetchCategories();
          if (filterMode) fetchWords();
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) {
          fetchCategories();
          if (filterMode) fetchWords();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedLanguage, filterMode, selectedCategory]);

  const fetchCategories = async () => {
    if (!selectedLanguage) return;

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("language_id", selectedLanguage)
      .order("name");
    
    if (data) setCategories(data);
  };

  const fetchWords = async () => {
    if (!selectedLanguage || !filterMode) return;

    let query = supabase
      .from("words")
      .select("*")
      .eq("language_id", selectedLanguage)
      .eq("learned", false);

    if (filterMode === "category" && selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    } else if (filterMode === "forgot") {
      query = query.gte("forgot_count", 3);
    }

    const { data } = await query.order("created_at", { ascending: false });
    
    if (data) setWords(data);
  };

  const handleSwipeLeft = async () => {
    const word = words[currentIndex];
    const newForgotCount = (word.forgot_count || 0) + 1;
    
    const { error } = await supabase
      .from("words")
      .update({ forgot_count: newForgotCount })
      .eq("id", word.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update word",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Needs more practice",
        description: newForgotCount >= 3 ? "Word moved to 'Words to Forget' folder" : "Word marked for review",
      });
      setIsFlipped(false);
      setCurrentIndex((prev) => (prev + 1) % words.length);
      fetchWords();
    }
  };

  const handleSwipeRight = async () => {
    const word = words[currentIndex];
    
    const { error } = await supabase
      .from("words")
      .update({ learned: true })
      .eq("id", word.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark word as learned",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Great job!",
        description: "Word marked as learned",
      });
      const newWords = words.filter(w => w.id !== word.id);
      setWords(newWords);
      if (newWords.length > 0) {
        setCurrentIndex(currentIndex % newWords.length);
      }
      setIsFlipped(false);
    }
  };

  // Category selection screen
  if (!filterMode) {
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
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
              <h2 className="text-3xl font-bold mb-8">Choose what to practice</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setFilterMode("all");
                    fetchWords();
                  }}
                >
                  <CardHeader>
                    <CardTitle>All Words</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Practice all words in this language</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setFilterMode("forgot");
                    fetchWords();
                  }}
                >
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Folder className="w-5 h-5" />
                    <CardTitle>Words to Forget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Words you've marked as difficult (3+ times)</p>
                  </CardContent>
                </Card>

                {categories.map((category) => (
                  <Card 
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setFilterMode("category");
                      setSelectedCategory(category.id);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <CardTitle>{category.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Practice words in this category</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
              <div className="flex gap-4">
                <Button onClick={() => setFilterMode(null)} variant="outline">
                  Back to Selection
                </Button>
                <Button onClick={() => navigate("/dashboard")} className="bg-gradient-primary">
                  Add Words
                </Button>
              </div>
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
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Flashcards
              </h1>
              <Button variant="outline" size="sm" onClick={() => setFilterMode(null)}>
                Change Category
              </Button>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Card {currentIndex + 1} of {words.length}
              </Badge>
              {currentWord.forgot_count > 0 && (
                <Badge variant="destructive">
                  Forgotten {currentWord.forgot_count} times
                </Badge>
              )}
            </div>

            <div className="w-full max-w-2xl h-96 perspective-1000">
              <Card
                className="w-full h-full cursor-pointer transition-all duration-500 preserve-3d"
                style={{
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transformStyle: "preserve-3d",
                }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className="absolute inset-0 backface-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <CardContent className="h-full flex flex-col items-center justify-center p-8">
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
                  </CardContent>
                </div>
                
                <div
                  className="absolute inset-0 backface-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <CardContent className="h-full flex flex-col items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <p className="text-2xl font-semibold">{currentWord.definition}</p>
                      {currentWord.example_sentence && (
                        <p className="text-base italic text-muted-foreground border-l-4 border-primary pl-4 text-left max-w-md">
                          "{currentWord.example_sentence}"
                        </p>
                      )}
                      {currentWord.image_url && (
                        <img
                          src={currentWord.image_url}
                          alt={currentWord.word}
                          className="w-32 h-32 object-cover rounded-lg mx-auto opacity-50"
                        />
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>

            <div className="flex gap-4 flex-wrap justify-center">
              <Button
                onClick={handleSwipeLeft}
                variant="outline"
                size="lg"
                className="min-w-32"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Need Practice
              </Button>
              <Button
                onClick={handleSwipeRight}
                className="bg-gradient-primary min-w-32"
                size="lg"
              >
                Learned
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-md">
              Swipe left if you need more practice (3+ times moves to "Words to Forget"), swipe right when you've learned the word
            </p>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Flashcards;
