import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { selectedLanguage } = useLanguage();
  const [books, setBooks] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<string, any[]>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [selectedBookUserId, setSelectedBookUserId] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    review: "",
    summary: "",
    rating: 0,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchBooks();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchBooks();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedLanguage]);

  const checkIfTeacher = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: languages } = await supabase
      .from("languages")
      .select("role")
      .eq("user_id", user.id);

    setIsTeacher(languages?.some(l => l.role === "teacher") || false);
  };

  const fetchBooks = async () => {
    if (!selectedLanguage) return;

    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("language_id", selectedLanguage)
      .order("created_at", { ascending: false });

    if (data) {
      setBooks(data);
      
      // Fetch feedback for all books
      const bookIds = data.map(b => b.id);
      const { data: feedbackData } = await supabase
        .from("review_feedback")
        .select("*")
        .eq("item_type", "book")
        .in("item_id", bookIds);
      
      if (feedbackData) {
        const feedbackByBook: Record<string, any[]> = {};
        feedbackData.forEach(fb => {
          if (!feedbackByBook[fb.item_id]) {
            feedbackByBook[fb.item_id] = [];
          }
          feedbackByBook[fb.item_id].push(fb);
        });
        setFeedbacks(feedbackByBook);
      }
    }
    
    await checkIfTeacher();
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

    if (!selectedLanguage) {
      toast({
        title: "Error",
        description: "Please select a language first",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let coverUrl = null;
    
    // Upload cover image if provided
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, coverFile);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload cover image",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);
      
      coverUrl = publicUrl;
    }

    const { error } = await supabase.from("books").insert({
      ...newBook,
      cover_url: coverUrl,
      language_id: selectedLanguage,
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
      setNewBook({ title: "", author: "", summary: "", review: "", rating: 0 });
      setCoverFile(null);
      fetchBooks();
    }
  };

  const handleAddFeedback = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Error",
        description: "Feedback cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("review_feedback").insert({
      student_user_id: selectedBookUserId,
      teacher_user_id: user.id,
      item_type: "book",
      item_id: selectedBookId,
      feedback: feedbackText,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add feedback",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Feedback added successfully",
      });
      setIsFeedbackOpen(false);
      setFeedbackText("");
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Book Cover</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                  </div>
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
                  {book.cover_url && (
                    <img 
                      src={book.cover_url} 
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
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
                    
                    {feedbacks[book.id] && feedbacks[book.id].length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Teacher Feedback</h4>
                        {feedbacks[book.id].map((fb) => (
                          <div key={fb.id} className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">{fb.feedback}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(fb.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isTeacher && (book.summary || book.review) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setSelectedBookUserId(book.user_id);
                          setIsFeedbackOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Feedback
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Feedback to Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Write your feedback here..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={6}
                  />
                  <Button onClick={handleAddFeedback} className="w-full">
                    Submit Feedback
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Books;
