'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ModelPanel from './ModelPanel';
import { Send, Image, Upload, Mic } from 'lucide-react';

const MODELS = [
  { 
    id: 'openai/gpt-oss-20b:free', 
    name: 'ChatGPT 5', 
    icon: '🧠',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-card'
  },
  { 
    id: 'qwen/qwen3-coder:free', 
    name: 'Gemini 2.5 Pro', 
    icon: '💎',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-card'
  },
  { 
    id: 'moonshotai/kimi-k2:free', 
    name: 'DeepSeek', 
    icon: '🔮',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-card'
  },
  { 
    id: 'google/gemma-3n-e2b-it:free', 
    name: 'Perplexity Sonar Pro', 
    icon: '🌟',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-card'
  },
];

export default function MultiPanelChat() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

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
    MODELS.forEach(model => {
      initialResponses[model.id] = {
        modelName: model.name,
        text: '',
        isComplete: false,
        error: null,
      };
    });
    setResponses(initialResponses);

    try {
      // Use the streaming API
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
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
                setResponses(prev => ({
                  ...prev,
                  [data.modelId]: {
                    ...prev[data.modelId],
                    text: data.fullText,
                    isComplete: true,
                  }
                }));
              } else if (data.type === 'error') {
                setResponses(prev => ({
                  ...prev,
                  [data.modelId]: {
                    ...prev[data.modelId],
                    error: data.error,
                    isComplete: true,
                  }
                }));
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
      {/* Model Panels Grid */}
      <div className="flex-1 grid grid-cols-2 gap-px bg-border overflow-hidden">
        {MODELS.map((model) => (
          <ModelPanel
            key={model.id}
            model={model}
            response={responses[model.id]}
            chatHistory={chatHistory}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-background border-t border-border p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <Card className="p-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="min-h-[60px] pr-32 resize-none"
                disabled={isLoading}
              />
              
              {/* Input Actions */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="p-2 h-8 w-8"
                  title="Generate Image"
                >
                  <Image className="w-4 h-4" />
                </Button>
                
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="p-2 h-8 w-8"
                  title="Upload Image"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="p-2 h-8 w-8"
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                
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
