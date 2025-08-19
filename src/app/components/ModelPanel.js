"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Maximize2,
  X,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ModelPanel({
  model,
  response,
  chatHistory,
  isLoading,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef(null);
  const expandedScrollRef = useRef(null);
  // track copy state
  const [copiedId, setCopiedId] = useState(null);

  // Auto-scroll to bottom when response updates or chat history changes
  useEffect(() => {
    const scrollToBottom = (ref) => {
      if (ref.current) {
        const viewport = ref.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    // Scroll main area
    scrollToBottom(scrollAreaRef);

    // Scroll expanded area if it's open
    if (isExpanded) {
      scrollToBottom(expandedScrollRef);
    }
  }, [response, chatHistory, isLoading, isExpanded]);

  const getStatusIndicator = () => {
    if (!response) {
      return (
        <Badge
          variant="secondary"
          className="w-2 h-2 p-0 rounded-full bg-muted-foreground"
        ></Badge>
      );
    }
    if (response.error) {
      return (
        <Badge
          variant="destructive"
          className="w-2 h-2 p-0 rounded-full"
        ></Badge>
      );
    }
    if (!response.isComplete && isLoading) {
      return (
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          <div
            className="w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      );
    }
    if (response.isComplete) {
      return (
        <Badge
          variant="default"
          className="w-2 h-2 p-0 rounded-full bg-green-500"
        ></Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="w-2 h-2 p-0 rounded-full bg-yellow-500"
      ></Badge>
    );
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Helper to render model markdown (shared for saved + streaming)
  const MarkdownBlock = ({ children }) => (
    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );

  return (
    <Card
      className={`${model.bgColor} h-full relative border-0 rounded-none p-0`}
    >
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/70">
        <div className="flex items-center gap-3">
          <Avatar
            className={`w-6 h-6 bg-gradient-to-r ${model.color}`}
          >
            <AvatarFallback className="text-xs bg-transparent text-white">
              {model.icon}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-foreground text-sm">
            {model.name}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {getStatusIndicator()}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setIsExpanded(true)}
            aria-label="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="px-6 pb-10">
            {chatHistory.length === 0 && (
              <div className="text-muted-foreground text-center py-16 text-sm">
                No messages yet. Start the conversation!
              </div>
            )}

            {chatHistory.map((chat, index) => {
              const modelResp = chat.responses?.[model.id];
              return (
                <div
                  key={chat.id}
                  className="border-b border-border/40 last:border-b-0 py-6 space-y-6"
                >
                  {/* User Message Row */}
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8 bg-muted">
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed text-wrap break-words">
                        {chat.userMessage}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          handleCopy(chat.userMessage, chat.id + "-user")
                        }
                        aria-label="Copy user message"
                      >
                        {copiedId === chat.id + "-user" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Model Response Row */}
                  {modelResp && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Avatar
                          className={`h-8 w-8 bg-gradient-to-r ${model.color}`}
                        >
                          <AvatarFallback className="text-xs bg-transparent text-white">
                            {model.icon}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        {modelResp.error ? (
                          <span className="text-sm text-destructive">
                            Error: {modelResp.error}
                          </span>
                        ) : (
                          <MarkdownBlock className="text-wrap">{modelResp.text}</MarkdownBlock>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground text-wrap">
                          <button
                            onClick={() =>
                              handleCopy(modelResp.text, chat.id + "-model")
                            }
                            className="flex items-center gap-1 hover:text-foreground transition"
                          >
                            {copiedId === chat.id + "-model" ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Streaming current response (if not yet in history) */}
            {isLoading && response && !response.isComplete && (
              <div className="border-b border-border/40 py-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Avatar
                      className={`h-8 w-8 bg-gradient-to-r ${model.color}`}
                    >
                      <AvatarFallback className="text-xs bg-transparent text-white">
                        {model.icon}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    {response.error ? (
                      <span className="text-sm text-destructive">
                        Error: {response.error}
                      </span>
                    ) : response.text ? (
                      <div className="relative">
                        <MarkdownBlock>{response.text}</MarkdownBlock>
                        <span className="inline-block align-middle w-1.5 h-5 bg-foreground ml-1 animate-pulse rounded-sm" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 opacity-50">
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </div>
                      <div className="flex items-center gap-1 opacity-50">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1 opacity-50">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="opacity-50">Share feedback</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Expanded Overlay */}
      {isExpanded && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col">
          {/* Expanded Header */}
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar
                className={`w-8 h-8 bg-gradient-to-r ${model.color}`}
              >
                <AvatarFallback className="bg-transparent text-white">
                  {model.icon}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">
                  {model.name}
                </h3>
                <div className="text-xs text-muted-foreground">
                  Expanded View
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsExpanded(false)}
              size="sm"
              variant="ghost"
              className="p-2 h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          {/* Expanded Content */}
          <ScrollArea ref={expandedScrollRef} className="flex-1">
            <div className="p-6 space-y-8">
              {chatHistory.map((chat) => {
                const modelResp = chat.responses?.[model.id];
                if (!modelResp) return null;
                return (
                  <div key={chat.id} className="space-y-3">
                    <MarkdownBlock>{modelResp.text}</MarkdownBlock>
                  </div>
                );
              })}
              {response?.text && !response.isComplete && (
                <div className="space-y-3">
                  <MarkdownBlock>{response.text}</MarkdownBlock>
                  <span className="inline-block w-1.5 h-5 bg-foreground animate-pulse rounded-sm" />
                </div>
              )}
              {!response?.text && chatHistory.length === 0 && (
                <div className="text-muted-foreground text-center py-12">
                  No content to display
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
