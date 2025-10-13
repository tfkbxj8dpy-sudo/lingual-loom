import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Languages, BookOpen, CreditCard, Film, Music, Mic } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center gap-3 mb-6">
          <Languages className="w-16 h-16 text-white" />
          <BookOpen className="w-16 h-16 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          PolyglotPro
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8">
          Master multiple languages through immersive learning
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          {[
            { icon: BookOpen, label: "Dictionary" },
            { icon: CreditCard, label: "Flashcards" },
            { icon: Film, label: "Movies & Series" },
            { icon: BookOpen, label: "Books" },
            { icon: Music, label: "Music" },
            { icon: Mic, label: "Speaking" },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"
            >
              <feature.icon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{feature.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            variant="outline"
            className="bg-white/10 text-white border-white hover:bg-white/20 text-lg px-8"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
