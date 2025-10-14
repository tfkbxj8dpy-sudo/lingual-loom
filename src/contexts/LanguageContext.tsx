import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Language {
  id: string;
  name: string;
  flag_emoji: string;
}

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: (id: string) => void;
  languages: Language[];
  currentLanguage: Language | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languages, setLanguages] = useState<Language[]>([]);
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

  const currentLanguage = languages.find(lang => lang.id === selectedLanguage) || null;

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, languages, currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
