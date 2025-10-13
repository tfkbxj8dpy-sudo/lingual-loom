import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Languages } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-card p-4 rounded-2xl shadow-card">
              <div className="flex gap-2">
                <Languages className="w-8 h-8 text-primary" />
                <BookOpen className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PolyglotPro</h1>
          <p className="text-white/80">Master languages through immersive learning</p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(265 83% 57%)",
                    brandAccent: "hsl(200 95% 55%)",
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/dashboard`}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
