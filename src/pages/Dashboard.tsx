import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FolderPlus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const [newWord, setNewWord] = useState({
    word: "",
    definition: "",
    example_sentence: "",
    image_url: "",
    category_id: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    const { data: wordsData } = await supabase
      .from("words")
      .select("*, categories(*)")
      .order("created_at", { ascending: false });
    
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (wordsData) setWords(wordsData);
    if (categoriesData) setCategories(categoriesData);
  };

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.definition) {
      toast({
        title: "Error",
        description: "Word and definition are required",
        variant: "destructive",
      });
      return;
    }

    const { data: languageData } = await supabase
      .from("languages")
      .select("id")
      .limit(1)
      .single();

    if (!languageData) {
      toast({
        title: "Error",
        description: "Please add a language first",
        variant: "destructive",
      });
      navigate("/languages");
      return;
    }

    const { error } = await supabase.from("words").insert({
      ...newWord,
      language_id: languageData.id,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add word",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Word added successfully",
      });
      setIsAddWordOpen(false);
      setNewWord({
        word: "",
        definition: "",
        example_sentence: "",
        image_url: "",
        category_id: "",
      });
      fetchData();
    }
  };

  const filteredWords = words.filter((word) =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dictionary
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isAddWordOpen} onOpenChange={setIsAddWordOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Word
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Word</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Word"
                      value={newWord.word}
                      onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    />
                    <Textarea
                      placeholder="Definition"
                      value={newWord.definition}
                      onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                    />
                    <Textarea
                      placeholder="Example sentence (optional)"
                      value={newWord.example_sentence}
                      onChange={(e) => setNewWord({ ...newWord, example_sentence: e.target.value })}
                    />
                    <Input
                      placeholder="Image URL (optional)"
                      value={newWord.image_url}
                      onChange={(e) => setNewWord({ ...newWord, image_url: e.target.value })}
                    />
                    <Select
                      value={newWord.category_id}
                      onValueChange={(value) => setNewWord({ ...newWord, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddWord} className="w-full">
                      Add Word
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => navigate("/categories")}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Manage Categories
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((word) => (
                <Card key={word.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{word.word}</CardTitle>
                      {word.difficulty && (
                        <Badge
                          variant={
                            word.difficulty === "easy"
                              ? "default"
                              : word.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            word.difficulty === "easy"
                              ? "bg-success"
                              : word.difficulty === "medium"
                              ? "bg-warning"
                              : "bg-destructive"
                          }
                        >
                          {word.difficulty}
                        </Badge>
                      )}
                    </div>
                    {word.categories && (
                      <Badge variant="outline">{word.categories.name}</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {word.image_url && (
                      <img
                        src={word.image_url}
                        alt={word.word}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-sm text-muted-foreground">{word.definition}</p>
                    {word.example_sentence && (
                      <p className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                        "{word.example_sentence}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredWords.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No words yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your vocabulary by adding your first word
                </p>
                <Button onClick={() => setIsAddWordOpen(true)} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Word
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
