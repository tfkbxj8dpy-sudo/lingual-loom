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

const Movies = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();
  const [movies, setMovies] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<string, any[]>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string>("");
  const [selectedMovieUserId, setSelectedMovieUserId] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: "",
    review: "",
    summary: "",
    rating: 0,
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchMovies();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchMovies();
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

  const fetchMovies = async () => {
    if (!selectedLanguage) return;

    const { data } = await supabase
      .from("movies")
      .select("*")
      .eq("language_id", selectedLanguage)
      .order("created_at", { ascending: false });

    if (data) {
      setMovies(data);
      
      // Fetch feedback for all movies
      const movieIds = data.map(m => m.id);
      const { data: feedbackData } = await supabase
        .from("review_feedback")
        .select("*")
        .eq("item_type", "movie")
        .in("item_id", movieIds);
      
      if (feedbackData) {
        const feedbackByMovie: Record<string, any[]> = {};
        feedbackData.forEach(fb => {
          if (!feedbackByMovie[fb.item_id]) {
            feedbackByMovie[fb.item_id] = [];
          }
          feedbackByMovie[fb.item_id].push(fb);
        });
        setFeedbacks(feedbackByMovie);
      }
    }
    
    await checkIfTeacher();
  };

  const handleAddMovie = async () => {
    if (!newMovie.title) {
      toast({
        title: "Error",
        description: "Movie title is required",
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

    let posterUrl = null;
    
    // Upload poster image if provided
    if (posterFile) {
      const fileExt = posterFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, posterFile);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload poster image",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);
      
      posterUrl = publicUrl;
    }

    const { error } = await supabase.from("movies").insert({
      ...newMovie,
      poster_url: posterUrl,
      language_id: selectedLanguage,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add movie",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Movie added successfully",
      });
      setIsAddOpen(false);
      setNewMovie({ title: "", review: "", summary: "", rating: 0 });
      setPosterFile(null);
      fetchMovies();
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
      student_user_id: selectedMovieUserId,
      teacher_user_id: user.id,
      item_type: "movie",
      item_id: selectedMovieId,
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
      fetchMovies();
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
              Movies & Series
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Movie/Series
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Movie or Series</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Poster</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Textarea
                    placeholder="Summary"
                    value={newMovie.summary}
                    onChange={(e) => setNewMovie({ ...newMovie, summary: e.target.value })}
                  />
                  <Textarea
                    placeholder="Review (in target language)"
                    value={newMovie.review}
                    onChange={(e) => setNewMovie({ ...newMovie, review: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Rating:</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={`w-6 h-6 cursor-pointer ${
                          rating <= newMovie.rating ? "fill-warning text-warning" : "text-muted-foreground"
                        }`}
                        onClick={() => setNewMovie({ ...newMovie, rating })}
                      />
                    ))}
                  </div>
                  <Button onClick={handleAddMovie} className="w-full">
                    Add Movie/Series
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movies.map((movie) => (
                <Card key={movie.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  {movie.poster_url && (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle>{movie.title}</CardTitle>
                    {movie.rating > 0 && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= movie.rating ? "fill-warning text-warning" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {movie.summary && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Summary</h4>
                        <p className="text-sm text-muted-foreground">{movie.summary}</p>
                      </div>
                    )}
                    {movie.review && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Review</h4>
                        <p className="text-sm text-muted-foreground">{movie.review}</p>
                      </div>
                    )}
                    
                    {feedbacks[movie.id] && feedbacks[movie.id].length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Teacher Feedback</h4>
                        {feedbacks[movie.id].map((fb) => (
                          <div key={fb.id} className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">{fb.feedback}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(fb.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isTeacher && (movie.summary || movie.review) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setSelectedMovieId(movie.id);
                          setSelectedMovieUserId(movie.user_id);
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

export default Movies;
