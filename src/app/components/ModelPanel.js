'use client';

import { useState, useRef, useEffect } from 'react';

export default function ModelPanel({ model, response, chatHistory, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [response, chatHistory]);

  const getStatusIndicator = () => {
    if (!response) {
      return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
    if (response.error) {
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
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
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    }
    return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
  };

  return (
    <div className={`${model.bgColor} flex flex-col h-full relative`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${model.color} flex items-center justify-center text-xs`}>
            {model.icon}
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">{model.name}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Chat History */}
        {chatHistory.map((chat, index) => (
          <div key={chat.id} className="space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg px-3 py-2 max-w-[80%] text-sm">
                {chat.userMessage}
              </div>
            </div>
            
            {/* AI Response */}
            {chat.responses && chat.responses[model.id] && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white rounded-lg px-3 py-2 max-w-[80%] text-sm">
                  {chat.responses[model.id].error ? (
                    <span className="text-red-400">Error: {chat.responses[model.id].error}</span>
                  ) : (
                    <div className="whitespace-pre-wrap">{chat.responses[model.id].text}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Current Response */}
        {isLoading && (
          <div className="space-y-3">
            {/* Current User Message */}
            {chatHistory.length > 0 && (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-lg px-3 py-2 max-w-[80%] text-sm">
                  {chatHistory[chatHistory.length - 1]?.userMessage}
                </div>
              </div>
            )}
            
            {/* Current AI Response */}
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white rounded-lg px-3 py-2 max-w-[80%] text-sm">
                {response?.error ? (
                  <span className="text-red-400">Error: {response.error}</span>
                ) : response?.text ? (
                  <div className="whitespace-pre-wrap">
                    {response.text}
                    {!response.isComplete && (
                      <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse"></span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Thinking...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Expanded Overlay */}
      {isExpanded && (
        <div className="absolute inset-0 bg-gray-900 z-10 flex flex-col">
          {/* Expanded Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${model.color} flex items-center justify-center`}>
                {model.icon}
              </div>
              <div>
                <h3 className="font-medium text-white">{model.name}</h3>
                <div className="text-xs text-gray-400">Expanded View</div>
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Expanded Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {response?.text ? (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {response.text}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-12">
                No content to display
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
