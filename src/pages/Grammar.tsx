import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Grammar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rules, setRules] = useState<any[]>([]);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [newRule, setNewRule] = useState({ title: "", content: "" });
  const [newExercise, setNewExercise] = useState({
    question: "",
    answer: "",
    explanation: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchRules();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchRules();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchRules = async () => {
    const { data: rulesData } = await supabase
      .from("grammar_rules")
      .select("*, grammar_exercises(*)")
      .order("created_at", { ascending: false });
    
    if (rulesData) setRules(rulesData);
  };

  const handleAddRule = async () => {
    if (!newRule.title || !newRule.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
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

    const { error } = await supabase.from("grammar_rules").insert({
      ...newRule,
      language_id: languageData.id,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add rule",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Grammar rule added successfully",
      });
      setIsAddRuleOpen(false);
      setNewRule({ title: "", content: "" });
      fetchRules();
    }
  };

  const handleAddExercise = async () => {
    if (!newExercise.question || !newExercise.answer || !selectedRuleId) {
      toast({
        title: "Error",
        description: "Question and answer are required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("grammar_exercises").insert({
      ...newExercise,
      rule_id: selectedRuleId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add exercise",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Exercise added successfully",
      });
      setIsAddExerciseOpen(false);
      setNewExercise({ question: "", answer: "", explanation: "" });
      setSelectedRuleId("");
      fetchRules();
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
              Grammar
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grammar Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Grammar Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Rule title (e.g., Present Perfect Tense)"
                    value={newRule.title}
                    onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Rule explanation and examples"
                    value={newRule.content}
                    onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                    rows={8}
                  />
                  <Button onClick={handleAddRule} className="w-full">
                    Add Rule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Accordion type="single" collapsible className="space-y-4">
              {rules.map((rule) => (
                <AccordionItem
                  key={rule.id}
                  value={rule.id}
                  className="border rounded-lg shadow-card"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{rule.title}</span>
                      <span className="text-sm text-muted-foreground">
                        ({rule.grammar_exercises?.length || 0} exercises)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                        {rule.content}
                      </pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRuleId(rule.id);
                        setIsAddExerciseOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                    <div className="space-y-2">
                      {rule.grammar_exercises?.map((exercise: any, index: number) => (
                        <Card key={exercise.id} className="bg-muted/50">
                          <CardHeader>
                            <CardTitle className="text-sm">Exercise {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm font-medium">{exercise.question}</p>
                            <details className="text-sm">
                              <summary className="cursor-pointer text-primary">Show answer</summary>
                              <p className="mt-2 pl-4 border-l-2 border-success">
                                {exercise.answer}
                              </p>
                              {exercise.explanation && (
                                <p className="mt-2 text-muted-foreground">{exercise.explanation}</p>
                              )}
                            </details>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Exercise</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Question"
                    value={newExercise.question}
                    onChange={(e) => setNewExercise({ ...newExercise, question: e.target.value })}
                  />
                  <Textarea
                    placeholder="Answer"
                    value={newExercise.answer}
                    onChange={(e) => setNewExercise({ ...newExercise, answer: e.target.value })}
                  />
                  <Textarea
                    placeholder="Explanation (optional)"
                    value={newExercise.explanation}
                    onChange={(e) => setNewExercise({ ...newExercise, explanation: e.target.value })}
                  />
                  <Button onClick={handleAddExercise} className="w-full">
                    Add Exercise
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

export default Grammar;
