import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mic, Square, Play, Trash2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { RichTextEditor } from "@/components/RichTextEditor";
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
  const [feedbacks, setFeedbacks] = useState<Record<string, any[]>>({});
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedRecordingId, setSelectedRecordingId] = useState("");
  const [selectedRecordingUserId, setSelectedRecordingUserId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingNotes, setRecordingNotes] = useState("");
  const [recordings, setRecordings] = useState<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const checkIfTeacher = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: languages } = await supabase
      .from("languages")
      .select("role")
      .eq("user_id", user.id);

    setIsTeacher(languages?.some(l => l.role === "teacher") || false);
  };

  const fetchTopics = async () => {
    if (!selectedLanguage) return;

    const { data: topicsData } = await supabase
      .from("speaking_topics")
      .select("*, speaking_questions(*)")
      .eq("language_id", selectedLanguage)
      .order("created_at", { ascending: false });
    
    if (topicsData) setTopics(topicsData);
    await checkIfTeacher();
  };

  const fetchRecordings = async (questionId: string) => {
    const { data } = await supabase
      .from("speaking_recordings")
      .select("*")
      .eq("question_id", questionId)
      .order("created_at", { ascending: false });
    
    if (data) {
      setRecordings(data);
      
      // Fetch feedback for all recordings
      const recordingIds = data.map(r => r.id);
      const { data: feedbackData } = await supabase
        .from("review_feedback")
        .select("*")
        .eq("item_type", "speaking")
        .in("item_id", recordingIds);
      
      if (feedbackData) {
        const feedbackByRecording: Record<string, any[]> = {};
        feedbackData.forEach(fb => {
          if (!feedbackByRecording[fb.item_id]) {
            feedbackByRecording[fb.item_id] = [];
          }
          feedbackByRecording[fb.item_id].push(fb);
        });
        setFeedbacks(feedbackByRecording);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await saveRecording(base64Audio);
        };
        
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording",
        description: "Recording started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecording = async (audioData: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("speaking_recordings").insert({
      question_id: selectedQuestionId,
      recording_url: audioData,
      notes: recordingNotes,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save recording",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Recording saved successfully",
      });
      setRecordingNotes("");
      fetchRecordings(selectedQuestionId);
    }
  };

  const deleteRecording = async (recordingId: string) => {
    const { error } = await supabase
      .from("speaking_recordings")
      .delete()
      .eq("id", recordingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete recording",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Recording deleted",
      });
      fetchRecordings(selectedQuestionId);
    }
  };

  const playRecording = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
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

  const handleAddFeedback = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Error",
        description: "Feedback cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("review_feedback").insert({
      student_user_id: selectedRecordingUserId,
      teacher_user_id: user.id,
      item_type: "speaking",
      item_id: selectedRecordingId,
      feedback: feedbackText,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add feedback",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Feedback added successfully",
      });
      setIsFeedbackOpen(false);
      setFeedbackText("");
      fetchRecordings(selectedQuestionId);
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
                              setSelectedQuestionId(question.id);
                              fetchRecordings(question.id);
                              setIsRecordingOpen(true);
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

            <Dialog open={isRecordingOpen} onOpenChange={setIsRecordingOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Answer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="flex-1">
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} variant="destructive" className="flex-1">
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </div>

                  <Textarea
                    placeholder="Add notes about your answer..."
                    value={recordingNotes}
                    onChange={(e) => setRecordingNotes(e.target.value)}
                    rows={3}
                  />

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Previous Recordings</h4>
                    <div className="space-y-2">
                      {recordings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recordings yet</p>
                      ) : (
                        recordings.map((recording) => (
                          <Card key={recording.id}>
                            <CardContent className="p-3 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(recording.created_at).toLocaleString()}
                                  </p>
                                  {recording.notes && (
                                    <p className="text-sm mt-1">{recording.notes}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => playRecording(recording.recording_url)}
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteRecording(recording.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {feedbacks[recording.id] && feedbacks[recording.id].length > 0 && (
                                <div className="space-y-2 border-t pt-3">
                                  <h5 className="font-semibold text-xs">Teacher Feedback</h5>
                                  {feedbacks[recording.id].map((fb) => (
                                    <div key={fb.id} className="bg-muted/50 p-2 rounded-lg">
                                      <div 
                                        className="text-xs text-muted-foreground prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: fb.feedback }}
                                      />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(fb.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {isTeacher && recording.notes && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedRecordingId(recording.id);
                                    setSelectedRecordingUserId(recording.user_id);
                                    setIsFeedbackOpen(true);
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Add Feedback
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Feedback to Recording</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <RichTextEditor
                    content={feedbackText}
                    onChange={setFeedbackText}
                    placeholder="Write your feedback here..."
                    minHeight="150px"
                  />
                  <Button onClick={handleAddFeedback} className="w-full">
                    Submit Feedback
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
