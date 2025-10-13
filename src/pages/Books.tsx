import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Books = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    review: "",
    summary: "",
    rating: 0,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchBooks();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchBooks();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setBooks(data);
  };

  const handleAddBook = async () => {
    if (!newBook.title) {
      toast({
        title: "Error",
        description: "Book title is required",
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("books").insert({
      ...newBook,
      language_id: languageData.id,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Book added successfully",
      });
      setIsAddOpen(false);
      setNewBook({ title: "", author: "", review: "", summary: "", rating: 0 });
      fetchBooks();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Books
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Book</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  />
                  <Input
                    placeholder="Author"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  />
                  <Textarea
                    placeholder="Summary"
                    value={newBook.summary}
                    onChange={(e) => setNewBook({ ...newBook, summary: e.target.value })}
                  />
                  <Textarea
                    placeholder="Review (in target language)"
                    value={newBook.review}
                    onChange={(e) => setNewBook({ ...newBook, review: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Rating:</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={`w-6 h-6 cursor-pointer ${
                          rating <= newBook.rating ? "fill-warning text-warning" : "text-muted-foreground"
                        }`}
                        onClick={() => setNewBook({ ...newBook, rating })}
                      />
                    ))}
                  </div>
                  <Button onClick={handleAddBook} className="w-full">
                    Add Book
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader>
                    <CardTitle>{book.title}</CardTitle>
                    {book.author && (
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                    )}
                    {book.rating > 0 && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= book.rating ? "fill-warning text-warning" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {book.summary && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Summary</h4>
                        <p className="text-sm text-muted-foreground">{book.summary}</p>
                      </div>
                    )}
                    {book.review && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Review</h4>
                        <p className="text-sm text-muted-foreground">{book.review}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Books;
