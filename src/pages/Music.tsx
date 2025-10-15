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
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { selectedLanguage } = useLanguage();
  const [songs, setSongs] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    lyrics: "",
    translation: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchSongs();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchSongs();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedLanguage]);

  const fetchSongs = async () => {
    if (!selectedLanguage) return;

    const { data } = await supabase
      .from("music")
      .select("*")
      .eq("language_id", selectedLanguage)
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

    const { error } = await supabase.from("music").insert({
      ...newSong,
      cover_url: coverUrl,
      language_id: selectedLanguage,
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
      setCoverFile(null);
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Album Cover</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Lyrics</label>
                      <Textarea
                        placeholder="Enter lyrics here..."
                        value={newSong.lyrics}
                        onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
                        rows={10}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Translation</label>
                      <Textarea
                        placeholder="Enter translation here..."
                        value={newSong.translation}
                        onChange={(e) => setNewSong({ ...newSong, translation: e.target.value })}
                        rows={10}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddSong} className="w-full">
                    Add Song
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {songs.map((song) => (
                <Card key={song.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  {song.cover_url && (
                    <img 
                      src={song.cover_url} 
                      alt={song.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle>{song.title}</CardTitle>
                    {song.artist && (
                      <p className="text-sm text-muted-foreground">by {song.artist}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {(song.lyrics || song.translation) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {song.lyrics && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Lyrics</h4>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                              {song.lyrics}
                            </pre>
                          </div>
                        )}
                        {song.translation && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Translation</h4>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                              {song.translation}
                            </pre>
                          </div>
                        )}
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
