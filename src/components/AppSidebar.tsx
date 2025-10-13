import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CreditCard,
  Film,
  Music,
  Mic,
  BookMarked,
  Languages,
  LogOut,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const menuItems = [
  { title: "Dictionary", url: "/dashboard", icon: BookOpen },
  { title: "Flashcards", url: "/flashcards", icon: CreditCard },
  { title: "Movies & Series", url: "/movies", icon: Film },
  { title: "Books", url: "/books", icon: BookMarked },
  { title: "Music", url: "/music", icon: Music },
  { title: "Speaking", url: "/speaking", icon: Mic },
  { title: "Grammar", url: "/grammar", icon: Languages },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching languages:", error);
      return;
    }

    if (data && data.length > 0) {
      setLanguages(data);
      setSelectedLanguage(data[0].id);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <Sidebar className="border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Languages className="w-5 h-5 text-sidebar-primary" />
            <BookOpen className="w-5 h-5 text-secondary" />
          </div>
          <span className="font-bold text-sidebar-foreground">PolyglotPro</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Language</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full bg-sidebar-accent">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.flag_emoji} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => navigate("/languages")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Language
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
