'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Maximize2, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ModelPanel({ model, response, chatHistory, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef(null);
  const expandedScrollRef = useRef(null);

  // Auto-scroll to bottom when response updates or chat history changes
  useEffect(() => {
    const scrollToBottom = (ref) => {
      if (ref.current) {
        const viewport = ref.current.querySelector('[data-radix-scroll-area-viewport]');
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
      return <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-muted-foreground"></Badge>;
    }
    if (response.error) {
      return <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full"></Badge>;
    }
    if (!response.isComplete && isLoading) {
      return (
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      );
    }
    if (response.isComplete) {
      return <Badge variant="default" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>;
    }
    return <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full bg-yellow-500"></Badge>;
  };

  return (
      <Card
          className={`${model.bgColor} h-full relative border-0 rounded-none overflow-hidden`}
      >
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                  <Avatar className={`w-6 h-6 bg-gradient-to-r ${model.color}`}>
                      <AvatarFallback className="text-xs bg-transparent text-white">
                          {model.icon}
                      </AvatarFallback>
                  </Avatar>
                  <div>
                      <h3 className="font-medium text-foreground text-sm">
                          {model.name}
                      </h3>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                  {getStatusIndicator()}
                  <Button
                      onClick={() => setIsExpanded(!isExpanded)}
                      size="sm"
                      variant="ghost"
                      className="p-1 h-6 w-6"
                  >
                      <Maximize2 className="w-4 h-4" />
                  </Button>
              </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea ref={scrollAreaRef} className="h-full p-4">
                  <div className="space-y-4">
                      {/* Chat History */}
                      {chatHistory.map((chat, index) => (
                          <div key={chat.id} className="space-y-3">
                              {/* User Message */}
                              <div className="flex justify-end">
                                  <Card className="bg-primary text-primary-foreground max-w-[80%] p-1 rounded-sm">
                                      <CardContent className="p-1 text-sm">
                                          {chat.userMessage}
                                      </CardContent>
                                  </Card>
                              </div>

                              {/* AI Response */}
                              {chat.responses && chat.responses[model.id] && (
                                  <div className="flex justify-start">
                                      <Card className="bg-secondary max-w-[80%] p-1 rounded-sm">
                                          <CardContent className="p-1 text-sm">
                                              {chat.responses[model.id]
                                                  .error ? (
                                                  <span className="text-destructive">
                                                      Error:{" "}
                                                      {
                                                          chat.responses[
                                                              model.id
                                                          ].error
                                                      }
                                                  </span>
                                              ) : (
                                                  <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                                                      <ReactMarkdown>
                                                          {
                                                              chat.responses[
                                                                  model.id
                                                              ].text
                                                          }
                                                      </ReactMarkdown>
                                                  </div>
                                              )}
                                          </CardContent>
                                      </Card>
                                  </div>
                              )}
                          </div>
                      ))}

                      {/* Current Response - Only show if there's ongoing streaming and not already saved */}
                      {isLoading && response && !response.isComplete && (
                          <div className="space-y-3">
                              {/* Current AI Response */}
                              <div className="flex justify-start">
                                  <Card className="bg-secondary max-w-[80%] p-1 rounded-sm">
                                      <CardContent className="p-3 text-sm">
                                          {response?.error ? (
                                              <span className="text-destructive">
                                                  Error: {response.error}
                                              </span>
                                          ) : response?.text ? (
                                              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                                                  <ReactMarkdown>
                                                      {response.text}
                                                  </ReactMarkdown>
                                                  <span className="inline-block w-2 h-4 bg-foreground ml-1 animate-pulse"></span>
                                              </div>
                                          ) : (
                                              <div className="flex items-center gap-2 text-muted-foreground">
                                                  <Loader2 className="w-4 h-4 animate-spin" />
                                                  Thinking...
                                              </div>
                                          )}
                                      </CardContent>
                                  </Card>
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
                      <div className="p-6">
                          {response?.text ? (
                              <div className="prose prose-neutral dark:prose-invert max-w-none">
                                  <ReactMarkdown>
                                      {response.text}
                                  </ReactMarkdown>
                              </div>
                          ) : (
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
