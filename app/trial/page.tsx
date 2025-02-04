"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import AtsChecker from "@/components/function/atscheecker";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import { ThemeToggle } from "@/components/ui/theme-toggle";

interface ChatMessage {
  id?: string;
  content: string;
  role: "user" | "ai";
  tempId?: string; 
}

export default function CVEditor() {
  const [cvContent, setCvContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [chatCaching, setChatCaching] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<"modify" | "chat">("chat");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true); 
  }, []);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatCaching]);

  useEffect(() => {
    if (!aiResponse) return;

    if (mode === "modify") {
      setCvContent("");
      setAiInput("");
      let index = 0;
      const intervalId = setInterval(() => {
        setCvContent((prev) => prev + aiResponse[index]);
        index++;
        if (index >= aiResponse.length) {
          clearInterval(intervalId);
          setIsProcessing(false);
        }
      }, 10);

      return () => clearInterval(intervalId);
    }
    else{
      // setAiResponse('')
      let index = 0;
      const tempId = Date.now().toString();
      
      setChatCaching(prev => [
        ...prev,
        { role: "ai", content: "", tempId }
      ]);

      const intervalId = setInterval(() => {
        setChatCaching(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.tempId === tempId) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + aiResponse[index] }
            ];
          }
          return prev;
        });
        
        index++;
        if (index >= aiResponse.length) {
          clearInterval(intervalId);
          setIsProcessing(false);
        }
      }, 10);

      return () => clearInterval(intervalId);
    }
  }, [aiResponse, mode]);

  const handleFileUpload = async () => {
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/get-html", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to parse CV");
      const  formatedHtml  = await response.json();
      console.log("the paring data--",formatedHtml.extractedText)
      setCvContent(formatedHtml.extractedText);
    } catch (error) {
      console.error("Error parsing CV:", error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAISubmit = async (e: React.FormEvent, submitMode: "modify" | "chat") => {
    e.preventDefault();
    if (!aiInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setMode(submitMode);
    const userMessage = aiInput;

    try {
      if (submitMode === "modify") {
        // Clear previous responses before making new request
        setAiResponse("");
        // setCvContent("");
      }
      if (submitMode === "chat") {
        setChatCaching(prev => [...prev, { role: "user", content: userMessage }]);
        setAiInput("");
      }

      const response = await fetch(`/api/ai/${submitMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          cvContent: cvContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI response");
      
      const { result } = await response.json();
      console.log(result,"------ai response is -----------")
      setAiResponse(result);

      if (submitMode === "modify") {
        setCvContent(result);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsProcessing(false);
    }
  };

  return (

  <div> 
     {client ? (<div className="h-screen p-4">
       {/* <ThemeToggle/> */}
  {/* Resizable Panels for Upload and Editor Sections */}
  <PanelGroup direction="horizontal">
    {/* Left Section - PDF Upload/Viewer */}
    <Panel defaultSize={25} minSize={20} className="pr-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf"
            />
            <Button
              onClick={handleFileUpload}
              disabled={!file || isParsing}
              className="w-full"
            >
              {isParsing ? "Processing..." : "Parse CV"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Panel>

    {/* Resize Handle */}
    <PanelResizeHandle className="w-[4px] mx-2 bg-gray-600 hover:bg-gray-300 transition-colors relative group">
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
    ⭤ 
    </span>
  </div>
</PanelResizeHandle>
    {/* Middle Section - CV Editor */}
    <Panel defaultSize={75} minSize={50}>
      <TiptapEditor content={cvContent} onChange={setCvContent} />
    </Panel>
  </PanelGroup>


      {/* AI Chat Section */}
<motion.div 
style={{zIndex:"100"}}
  className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg p-4"
  initial={{ x: "100%" }}
  animate={{ x: isChatOpen ? 0 : "100%" }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">AI Assistant</h2>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsChatOpen(false)}
      >
        ×
      </Button>
    </div>

    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
      {chatCaching.map((message, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>

    {/* Quick Prompts Section */}
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Quick Prompts</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAiInput("Improve the grammar and tone of my resume.")}
          className="text-left"
        >
          ✨ Improve Grammar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAiInput("Summarize my resume into a professional summary.")}
          className="text-left"
        >
          📝 Summarize Resume
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAiInput("Suggest improvements for my work experience section.")}
          className="text-left"
        >
          💼 Enhance Experience
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAiInput("Provide career advice based on my resume.")}
          className="text-left"
        >
          🚀 Career Advice
        </Button>
      </div>
    </div>

    {/* Input and Action Buttons */}
    <form className="space-y-4">
      <Input
        value={aiInput}
        onChange={(e) => setAiInput(e.target.value)}
        placeholder="Ask AI to improve the resume..."
        disabled={isProcessing}
      />
      <div className="flex justify-between">
        <Button
          onClick={(e) => handleAISubmit(e, "modify")}
          className="w-[48%]"
          disabled={isProcessing}
        >
          {isProcessing && mode === "modify" ? "Modifying..." : "Modify Resume"}
        </Button>
        <Button
          onClick={(e) => handleAISubmit(e, "chat")}
          className="w-[48%]"
          disabled={isProcessing}
        >
          {isProcessing && mode === "chat" ? "Responding..." : "Career Advice"}
        </Button>
      </div>
    </form>

    {/* Clear Chat History */}
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setChatCaching([])}
      className="mt-2"
    >
      Clear Chat History
    </Button>
  </div>
</motion.div>
      {!isChatOpen && (
        <Button
          className="fixed right-4 bottom-4"
          onClick={() => setIsChatOpen(true)}
        >
          Open AI Assistant
        </Button>
      )}
      <AtsChecker cvContent={cvContent} />

    </div>): (
      <p>Loading...</p>
    )}
    </div>
  );
}