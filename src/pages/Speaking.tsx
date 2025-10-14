import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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

const Speaking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();
  const [topics, setTopics] = useState<any[]>([]);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchTopics();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        if (selectedLanguage) fetchTopics();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedLanguage]);

  const fetchTopics = async () => {
    if (!selectedLanguage) return;

    const { data: topicsData } = await supabase
      .from("speaking_topics")
      .select("*, speaking_questions(*)")
      .eq("language_id", selectedLanguage)
      .order("created_at", { ascending: false });
    
    if (topicsData) setTopics(topicsData);
  };

  const handleAddTopic = async () => {
    if (!newTopic) {
      toast({
        title: "Error",
        description: "Topic title is required",
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

    const { error } = await supabase.from("speaking_topics").insert({
      title: newTopic,
      language_id: selectedLanguage,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add topic",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Topic added successfully",
      });
      setIsAddTopicOpen(false);
      setNewTopic("");
      fetchTopics();
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion || !selectedTopicId) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("speaking_questions").insert({
      question: newQuestion,
      topic_id: selectedTopicId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      setIsAddQuestionOpen(false);
      setNewQuestion("");
      setSelectedTopicId("");
      fetchTopics();
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
              Speaking Practice
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Speaking Topic</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Topic title (e.g., Daily Routine)"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                  />
                  <Button onClick={handleAddTopic} className="w-full">
                    Add Topic
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Accordion type="single" collapsible className="space-y-4">
              {topics.map((topic) => (
                <AccordionItem
                  key={topic.id}
                  value={topic.id}
                  className="border rounded-lg shadow-card"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{topic.title}</span>
                      <span className="text-sm text-muted-foreground">
                        ({topic.speaking_questions?.length || 0} questions)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setIsAddQuestionOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                    {topic.speaking_questions?.map((question: any) => (
                      <Card key={question.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="text-sm">{question.question}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "Recording feature will be available soon",
                              });
                            }}
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            Record Answer
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                  <Button onClick={handleAddQuestion} className="w-full">
                    Add Question
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

export default Speaking;
