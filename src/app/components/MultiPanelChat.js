'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ModelPanel from './ModelPanel.js';
import { Send, Loader2 } from 'lucide-react';
import { getCachedModels } from '@/lib/models-api';

export default function MultiPanelChat({ initialModels = [], activeChatId, onEnsureChat }) {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // local structure
  const [models, setModels] = useState(initialModels);
  const [modelsLoading, setModelsLoading] = useState(!initialModels.length);
  const textareaRef = useRef(null);
  const finalResponsesRef = useRef({});
  const completionCountRef = useRef(0);
  const modelsCountRef = useRef(0);
  const currentChatIdRef = useRef(null);

  // Load chat messages when activeChatId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) { setChatHistory([]); return; }
      try {
        const res = await fetch(`/api/chats/${activeChatId}`);
        if (res.ok) {
          const data = await res.json();
          // Transform flat messages into chatHistory shape
            const grouped = [];
            data.messages.forEach(m => {
              if (m.role === 'user') {
                grouped.push({ id: m.id, userMessage: m.content, responses: {}, timestamp: new Date(m.createdAt) });
              } else if (m.role === 'assistant') {
                const last = grouped[grouped.length - 1];
                if (last) {
                  last.responses[m.modelId] = { text: m.content, error: null };
                }
              }
            });
            setChatHistory(grouped);
        }
      } catch (e) { console.error(e); }
    };
    loadMessages();
  }, [activeChatId]);

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

  const ensureChat = async () => {
    if (activeChatId) return activeChatId;
    if (onEnsureChat) {
      const id = await onEnsureChat();
      return id;
    }
    // fallback: create directly
    const res = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Chat' }) });
    if (res.ok) { const { id } = await res.json(); return id; }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || models.length === 0) return;

    const chatId = await ensureChat();
    if (!chatId) return;
    currentChatIdRef.current = chatId;

    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    const newChatEntry = { id: Date.now(), userMessage: currentMessage, responses: {}, timestamp: new Date() };
    const updatedChatHistory = [...chatHistory, newChatEntry];
    setChatHistory(updatedChatHistory);

    const initialResponses = {};
    models.forEach(model => { initialResponses[model.id] = { modelName: model.name, text: '', isComplete: false, error: null }; });
    setResponses(initialResponses);

    // Reset refs for this round
    finalResponsesRef.current = {};
    completionCountRef.current = 0;
    modelsCountRef.current = models.length;

    try {
      const response = await fetch('/api/chat-stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatHistory: updatedChatHistory, currentMessage, models: models.map(m => ({ id: m.id, name: m.name })) }) });
      if (!response.ok) throw new Error('Failed to get response');
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
                setResponses(prev => ({ ...prev, [data.modelId]: { ...prev[data.modelId], text: data.fullText } }));
              } else if (data.type === 'complete' || data.type === 'error') {
                // Update chat history and responses state
                setChatHistory(prev => { const updated = [...prev]; const lastEntry = updated[updated.length -1]; if (lastEntry) { lastEntry.responses = { ...lastEntry.responses, [data.modelId]: { text: data.type === 'complete' ? data.fullText : '', error: data.type === 'error' ? data.error : null } }; } return updated; });
                setResponses(prev => ({ ...prev, [data.modelId]: { ...prev[data.modelId], text: data.fullText || prev[data.modelId]?.text || '', error: data.type === 'error' ? data.error : null, isComplete: true } }));
                // Record final response
                finalResponsesRef.current[data.modelId] = { modelId: data.modelId, content: data.type === 'complete' ? data.fullText : '', error: data.type === 'error' ? data.error : null };
                completionCountRef.current += 1;
                // If all models finished, persist messages
                if (completionCountRef.current === modelsCountRef.current) {
                  const assistantResponses = Object.values(finalResponsesRef.current).filter(r => !r.error).map(r => ({ modelId: r.modelId, content: r.content }));
                  fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId: currentChatIdRef.current, userContent: currentMessage, assistantResponses }) });
                  setResponses({});
                }
              }
              // Ignore 'end' now (handled by completion counts)
            } catch (err) { console.error('Error parsing SSE data:', err); }
          }
        }
      }
    } catch (error) { console.error('Error:', error); } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } };
  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; } }, [message]);

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
                <div key={model.id} className="flex-shrink-0 w-[500px] h-full">
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
