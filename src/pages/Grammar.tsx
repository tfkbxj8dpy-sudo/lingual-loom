import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Upload, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const { selectedLanguage } = useLanguage();
  const [rules, setRules] = useState<any[]>([]);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [newRule, setNewRule] = useState({ title: "", content: "", image_url: "" });
  const [ruleImageFile, setRuleImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newExercise, setNewExercise] = useState({
    question: "",
    answer: "",
    explanation: "",
    exercise_type: "open_ended" as "open_ended" | "multiple_choice" | "fill_blank" | "true_false",
    options: [] as string[],
  });
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchRules();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchRules();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedLanguage]);

  const fetchRules = async () => {
    if (!selectedLanguage) return;

    const { data: rulesData } = await supabase
      .from("grammar_rules")
      .select("*, grammar_exercises(*)")
      .eq("language_id", selectedLanguage)
      .order("created_at", { ascending: false });
    
    if (rulesData) setRules(rulesData);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("grammar-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("grammar-images")
        .getPublicUrl(filePath);

      setNewRule({ ...newRule, image_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
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

    let imageUrl = newRule.image_url;
    if (ruleImageFile && !imageUrl) {
      await handleImageUpload(ruleImageFile);
      imageUrl = newRule.image_url;
    }

    const { error } = await supabase.from("grammar_rules").insert({
      title: newRule.title,
      content: newRule.content,
      image_url: imageUrl,
      language_id: selectedLanguage,
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
      setNewRule({ title: "", content: "", image_url: "" });
      setRuleImageFile(null);
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

    if (newExercise.exercise_type === "multiple_choice" && newExercise.options.length < 2) {
      toast({
        title: "Error",
        description: "Multiple choice needs at least 2 options",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("grammar_exercises").insert({
      question: newExercise.question,
      answer: newExercise.answer,
      explanation: newExercise.explanation,
      exercise_type: newExercise.exercise_type,
      options: newExercise.exercise_type === "multiple_choice" ? newExercise.options : null,
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
      setNewExercise({ 
        question: "", 
        answer: "", 
        explanation: "",
        exercise_type: "open_ended",
        options: [],
      });
      setSelectedRuleId("");
      fetchRules();
    }
  };

  const checkAnswer = (exerciseId: string, userAnswer: string, correctAnswer: string) => {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
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
                  <div className="space-y-2">
                    <Label>Image (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setRuleImageFile(file);
                        }}
                        disabled={uploadingImage}
                      />
                      {ruleImageFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setRuleImageFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleAddRule} className="w-full" disabled={uploadingImage}>
                    {uploadingImage ? "Uploading..." : "Add Rule"}
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
                    {rule.image_url && (
                      <img 
                        src={rule.image_url} 
                        alt={rule.title}
                        className="w-full max-w-md rounded-lg shadow-md"
                      />
                    )}
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
                      {rule.grammar_exercises?.map((exercise: any, index: number) => {
                        const exerciseId = exercise.id;
                        const userAnswer = userAnswers[exerciseId] || "";
                        const isCorrect = userAnswer && checkAnswer(exerciseId, userAnswer, exercise.answer);
                        
                        return (
                          <Card key={exercise.id} className="bg-muted/50">
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center justify-between">
                                <span>Exercise {index + 1}</span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {exercise.exercise_type?.replace("_", " ") || "open ended"}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm font-medium">{exercise.question}</p>
                              
                              {exercise.exercise_type === "multiple_choice" && exercise.options && (
                                <RadioGroup 
                                  value={userAnswer}
                                  onValueChange={(value) => setUserAnswers({ ...userAnswers, [exerciseId]: value })}
                                >
                                  {exercise.options.map((option: string, idx: number) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`${exerciseId}-${idx}`} />
                                      <Label htmlFor={`${exerciseId}-${idx}`}>{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              )}
                              
                              {exercise.exercise_type === "true_false" && (
                                <RadioGroup 
                                  value={userAnswer}
                                  onValueChange={(value) => setUserAnswers({ ...userAnswers, [exerciseId]: value })}
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" id={`${exerciseId}-true`} />
                                    <Label htmlFor={`${exerciseId}-true`}>True</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" id={`${exerciseId}-false`} />
                                    <Label htmlFor={`${exerciseId}-false`}>False</Label>
                                  </div>
                                </RadioGroup>
                              )}
                              
                              {(exercise.exercise_type === "fill_blank" || exercise.exercise_type === "open_ended" || !exercise.exercise_type) && (
                                <Input
                                  placeholder="Type your answer here..."
                                  value={userAnswer}
                                  onChange={(e) => setUserAnswers({ ...userAnswers, [exerciseId]: e.target.value })}
                                />
                              )}
                              
                              {userAnswer && (
                                <div className={`flex items-center gap-2 p-2 rounded ${isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                                  {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                  <span className="text-sm font-medium">
                                    {isCorrect ? "Correct!" : "Incorrect"}
                                  </span>
                                </div>
                              )}
                              
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
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Interactive Exercise</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Exercise Type</Label>
                    <RadioGroup 
                      value={newExercise.exercise_type}
                      onValueChange={(value: any) => setNewExercise({ ...newExercise, exercise_type: value, options: [] })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="open_ended" id="open_ended" />
                        <Label htmlFor="open_ended">Open Ended</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                        <Label htmlFor="multiple_choice">Multiple Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fill_blank" id="fill_blank" />
                        <Label htmlFor="fill_blank">Fill in the Blank</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true_false" id="true_false" />
                        <Label htmlFor="true_false">True/False</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Textarea
                    placeholder="Question"
                    value={newExercise.question}
                    onChange={(e) => setNewExercise({ ...newExercise, question: e.target.value })}
                  />
                  
                  {newExercise.exercise_type === "multiple_choice" && (
                    <div className="space-y-2">
                      <Label>Options (one per line, mark correct answer below)</Label>
                      <Textarea
                        placeholder="Enter options, one per line"
                        value={newExercise.options.join("\n")}
                        onChange={(e) => setNewExercise({ 
                          ...newExercise, 
                          options: e.target.value.split("\n").filter(o => o.trim()) 
                        })}
                        rows={4}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    {newExercise.exercise_type === "multiple_choice" && newExercise.options.length > 0 ? (
                      <RadioGroup 
                        value={newExercise.answer}
                        onValueChange={(value) => setNewExercise({ ...newExercise, answer: value })}
                      >
                        {newExercise.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`answer-${idx}`} />
                            <Label htmlFor={`answer-${idx}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : newExercise.exercise_type === "true_false" ? (
                      <RadioGroup 
                        value={newExercise.answer}
                        onValueChange={(value) => setNewExercise({ ...newExercise, answer: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="answer-true" />
                          <Label htmlFor="answer-true">True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="answer-false" />
                          <Label htmlFor="answer-false">False</Label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <Input
                        placeholder="Correct answer"
                        value={newExercise.answer}
                        onChange={(e) => setNewExercise({ ...newExercise, answer: e.target.value })}
                      />
                    )}
                  </div>
                  
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
