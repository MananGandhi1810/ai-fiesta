'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ModelPanel from './ModelPanel.js';
import { Send, Loader2 } from 'lucide-react';
import { getCachedModels } from '@/lib/models-api';

export default function MultiPanelChat({ initialModels = [] }) {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [models, setModels] = useState(initialModels);
  const [modelsLoading, setModelsLoading] = useState(!initialModels.length);
  const textareaRef = useRef(null);

  // Fetch models on component mount only if not provided via SSR
  useEffect(() => {
    const loadModels = async () => {
      // If we already have models from SSR, don't fetch again
      if (initialModels.length > 0) {
        setModelsLoading(false);
        return;
      }

      try {
        setModelsLoading(true);
        const fetchedModels = await getCachedModels();
        setModels(fetchedModels);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, [initialModels]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || models.length === 0) return;

    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message to chat history
    const newChatEntry = {
      id: Date.now(),
      userMessage: currentMessage,
      responses: {},
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, newChatEntry]);

    // Initialize responses for all models
    const initialResponses = {};
    models.forEach(model => {
      initialResponses[model.id] = {
        modelName: model.name,
        text: '',
        isComplete: false,
        error: null,
      };
    });
    setResponses(initialResponses);

    try {
      // Use the streaming API with model-specific context
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chatHistory,
          currentMessage,
          models: models.map(model => ({
            id: model.id,
            name: model.name
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                setResponses(prev => ({
                  ...prev,
                  [data.modelId]: {
                    ...prev[data.modelId],
                    text: data.fullText,
                  }
                }));
              } else if (data.type === 'complete') {
                // Update chat history with the final response
                setChatHistory(prev => {
                  const updated = [...prev];
                  const lastEntry = updated[updated.length - 1];
                  if (lastEntry) {
                    lastEntry.responses = {
                      ...lastEntry.responses,
                      [data.modelId]: {
                        text: data.fullText,
                        error: null,
                      }
                    };
                  }
                  return updated;
                });
                
                // Mark response as complete in current responses
                setResponses(prev => ({
                  ...prev,
                  [data.modelId]: {
                    ...prev[data.modelId],
                    text: data.fullText,
                    isComplete: true,
                  }
                }));
              } else if (data.type === 'error') {
                // Update chat history with the error
                setChatHistory(prev => {
                  const updated = [...prev];
                  const lastEntry = updated[updated.length - 1];
                  if (lastEntry) {
                    lastEntry.responses = {
                      ...lastEntry.responses,
                      [data.modelId]: {
                        text: '',
                        error: data.error,
                      }
                    };
                  }
                  return updated;
                });
                
                setResponses(prev => ({
                  ...prev,
                  [data.modelId]: {
                    ...prev[data.modelId],
                    error: data.error,
                    isComplete: true,
                  }
                }));
              } else if (data.type === 'end') {
                // Clear current responses when all models are done
                setResponses({});
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Model Panels Horizontal Scroll */}
      <div className="flex-1 overflow-hidden bg-border">
        {modelsLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading models...
            </div>
          </div>
        ) : models.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No models available</p>
              <p className="text-sm">Please try refreshing the page</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="flex h-full gap-px" style={{ minWidth: `${models.length * 384}px` }}>
              {models.map((model) => (
                <div key={model.id} className="flex-shrink-0 w-96 h-full">
                  <ModelPanel
                    model={model}
                    response={responses[model.id]}
                    chatHistory={chatHistory}
                    isLoading={isLoading}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-background border-t border-border p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <Card className="p-4">
            <div className="flex flex-row gap-2">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
                rows={1}
              />
              
              {/* Input Actions */}
              <div className="right-3 bottom-3 flex items-center gap-2">              
                <Button
                  type="submit"
                  size="sm"
                  disabled={!message.trim() || isLoading}
                  className="p-2 h-8 w-8"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
