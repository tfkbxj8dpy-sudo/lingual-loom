import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Music = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [songs, setSongs] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    lyrics: "",
    translation: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchSongs();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchSongs();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from("music")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setSongs(data);
  };

  const handleAddSong = async () => {
    if (!newSong.title) {
      toast({
        title: "Error",
        description: "Song title is required",
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

    const { error } = await supabase.from("music").insert({
      ...newSong,
      language_id: languageData.id,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add song",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Song added successfully",
      });
      setIsAddOpen(false);
      setNewSong({ title: "", artist: "", lyrics: "", translation: "" });
      fetchSongs();
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
              Music
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Song
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Song</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  />
                  <Input
                    placeholder="Artist"
                    value={newSong.artist}
                    onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                  />
                  <Textarea
                    placeholder="Lyrics"
                    value={newSong.lyrics}
                    onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
                    rows={10}
                  />
                  <Textarea
                    placeholder="Translation"
                    value={newSong.translation}
                    onChange={(e) => setNewSong({ ...newSong, translation: e.target.value })}
                    rows={10}
                  />
                  <Button onClick={handleAddSong} className="w-full">
                    Add Song
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {songs.map((song) => (
                <Card key={song.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader>
                    <CardTitle>{song.title}</CardTitle>
                    {song.artist && (
                      <p className="text-sm text-muted-foreground">by {song.artist}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {song.lyrics && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Lyrics</h4>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                          {song.lyrics}
                        </pre>
                      </div>
                    )}
                    {song.translation && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">Translation</h4>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                          {song.translation}
                        </pre>
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

export default Music;
