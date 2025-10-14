import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Languages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [languages, setLanguages] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState({
    name: "",
    flag_emoji: "",
  });
  const [isAddingStarter, setIsAddingStarter] = useState(false);

  const starterLanguages = [
    { name: "English", flag: "🇬🇧" },
    { name: "Spanish", flag: "🇪🇸" },
    { name: "French", flag: "🇫🇷" },
    { name: "German", flag: "🇩🇪" },
    { name: "Portuguese", flag: "🇵🇹" },
    { name: "Italian", flag: "🇮🇹" },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchLanguages();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchLanguages();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchLanguages = async () => {
    const { data } = await supabase
      .from("languages")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setLanguages(data);
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.name) {
      toast({
        title: "Error",
        description: "Language name is required",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("languages").insert({
      ...newLanguage,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add language",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Language added successfully",
      });
      setIsAddOpen(false);
      setNewLanguage({ name: "", flag_emoji: "" });
      fetchLanguages();
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    const { error } = await supabase.from("languages").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete language",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Language deleted successfully",
      });
      fetchLanguages();
    }
  };

  const handleAddStarterLanguage = async (languageName: string, flagEmoji: string) => {
    setIsAddingStarter(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAddingStarter(false);
      return;
    }

    const { data, error } = await supabase.rpc("create_starter_language_data", {
      p_user_id: user.id,
      p_language_name: languageName,
      p_flag_emoji: flagEmoji,
    });

    if (error) {
      toast({
        title: "Error",
        description: `Failed to add ${languageName}: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${languageName} added with 6 categories and 5 starter words!`,
      });
      fetchLanguages();
    }
    setIsAddingStarter(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Manage Languages
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <div className="flex gap-4 flex-wrap">
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Language
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Language</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Language name (e.g., Spanish)"
                    value={newLanguage.name}
                    onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  />
                  <Input
                    placeholder="Flag emoji (e.g., 🇪🇸)"
                    value={newLanguage.flag_emoji}
                    onChange={(e) => setNewLanguage({ ...newLanguage, flag_emoji: e.target.value })}
                  />
                  <Button onClick={handleAddLanguage} className="w-full">
                    Add Language
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>

            <Card className="bg-gradient-subtle border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick Start - Popular Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a language with 6 categories and 5 starter words to begin learning immediately.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {starterLanguages.map((lang) => (
                    <Button
                      key={lang.name}
                      variant="outline"
                      onClick={() => handleAddStarterLanguage(lang.name, lang.flag)}
                      disabled={isAddingStarter || languages.some(l => l.name === lang.name)}
                      className="border-primary/50 hover:bg-primary/10"
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                      {languages.some(l => l.name === lang.name) && (
                        <Badge variant="secondary" className="ml-2">Added</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <Card key={lang.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">
                        {lang.flag_emoji} {lang.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLanguage(lang.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(lang.created_at).toLocaleDateString()}
                    </p>
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

export default Languages;
