import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Categories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({ name: "" });

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

  useEffect(() => {
    if (selectedLanguageId) {
      fetchCategories();
    }
  }, [selectedLanguageId]);

  const fetchLanguages = async () => {
    const { data } = await supabase
      .from("languages")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (data && data.length > 0) {
      setLanguages(data);
      setSelectedLanguageId(data[0].id);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("language_id", selectedLanguageId)
      .order("name");
    
    if (data) setCategories(data);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("categories").insert({
      name: newCategory.name,
      language_id: selectedLanguageId,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      setIsAddOpen(false);
      setNewCategory({ name: "" });
      fetchCategories();
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory?.name) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("categories")
      .update({ name: editingCategory.name })
      .eq("id", editingCategory.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setEditingCategory(null);
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchCategories();
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
              Manage Categories
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <div className="flex gap-4 flex-wrap items-center">
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Category name (e.g., Food & Dining)"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ name: e.target.value })}
                    />
                    <Button onClick={handleAddCategory} className="w-full">
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {languages.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Showing categories for: {languages.find(l => l.id === selectedLanguageId)?.flag_emoji} {languages.find(l => l.id === selectedLanguageId)?.name}
                </div>
              )}
            </div>

            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No categories yet. Add your first category to organize your vocabulary!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <Card key={cat.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">{cat.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCategory(cat)}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Category name"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              />
              <Button onClick={handleUpdateCategory} className="w-full">
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </SidebarProvider>
  );
};

export default Categories;
