'use client';

import { useState, useRef, useEffect } from 'react';
import ModelResponse from './ModelResponse';

const MODELS = [
  { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B', color: 'bg-purple-100 border-purple-300' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', color: 'bg-green-100 border-green-300' },
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2', color: 'bg-blue-100 border-blue-300' },
  { id: 'google/gemma-3n-e2b-it:free', name: 'Gemma 3N E2B', color: 'bg-orange-100 border-orange-300' },
];

export default function ChatInterface() {
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

                // Update chat history
                setChatHistory(prev => 
                  prev.map(entry => 
                    entry.id === newChatEntry.id 
                      ? {
                          ...entry,
                          responses: {
                            ...entry.responses,
                            [data.modelId]: {
                              modelName: data.modelName,
                              text: data.fullText,
                              isComplete: false,
                            }
                          }
                        }
                      : entry
                  )
                );
              } else if (data.type === 'complete') {
                setResponses(prev => ({
                  ...prev,
                  [data.modelId]: {
                    ...prev[data.modelId],
                    text: data.fullText,
                    isComplete: true,
                  }
                }));

                // Update chat history
                setChatHistory(prev => 
                  prev.map(entry => 
                    entry.id === newChatEntry.id 
                      ? {
                          ...entry,
                          responses: {
                            ...entry.responses,
                            [data.modelId]: {
                              modelName: data.modelName,
                              text: data.fullText,
                              isComplete: true,
                            }
                          }
                        }
                      : entry
                  )
                );
              } else if (data.type === 'error') {
                setResponses(prev => ({
                  ...prev,
                  [data.modelId]: {
                    ...prev[data.modelId],
                    error: data.error,
                    isComplete: true,
                  }
                }));

                // Update chat history
                setChatHistory(prev => 
                  prev.map(entry => 
                    entry.id === newChatEntry.id 
                      ? {
                          ...entry,
                          responses: {
                            ...entry.responses,
                            [data.modelId]: {
                              modelName: data.modelName,
                              text: '',
                              error: data.error,
                              isComplete: true,
                            }
                          }
                        }
                      : entry
                  )
                );
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Set error for all models
      setResponses(prev => {
        const errorResponses = {};
        MODELS.forEach(model => {
          errorResponses[model.id] = {
            ...prev[model.id],
            error: 'Failed to get response',
            isComplete: true,
          };
        });
        return errorResponses;
      });
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
    <div className="max-w-7xl mx-auto">
      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="mb-8 space-y-8">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <div className="mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      U
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">{chat.userMessage}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {chat.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODELS.map((model) => (
                  <ModelResponse
                    key={model.id}
                    model={model}
                    response={chat.responses[model.id]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Responses */}
      {isLoading && (
        <div className="mb-8">
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  U
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">{chatHistory[chatHistory.length - 1]?.userMessage}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODELS.map((model) => (
              <ModelResponse
                key={model.id}
                model={model}
                response={responses[model.id]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question to all AI models..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows={3}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Press Enter to send, Shift+Enter for new line
            </p>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
