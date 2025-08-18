'use client';

import { useState } from 'react';

const getModelIcon = (modelName) => {
  if (modelName.includes('GPT')) return '�';
  if (modelName.includes('Qwen')) return '💻';
  if (modelName.includes('Kimi')) return '🌙';
  if (modelName.includes('Gemma')) return '💎';
  return '🤔';
};

const getModelColor = (modelName) => {
  if (modelName.includes('GPT')) return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
  if (modelName.includes('Qwen')) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
  if (modelName.includes('Kimi')) return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
  if (modelName.includes('Gemma')) return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
  return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700';
};

export default function ModelResponse({ model, response }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!response) {
    return (
      <div className={`border rounded-lg p-4 ${getModelColor(model.name)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getModelIcon(model.name)}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">{model.name}</h3>
          </div>
          <div className="animate-pulse w-4 h-4 bg-gray-400 rounded-full"></div>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          Waiting for response...
        </div>
      </div>
    );
  }

  const wordCount = response.text ? response.text.trim().split(/\s+/).filter(word => word).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Assuming 200 words per minute

  return (
    <div className={`border rounded-lg ${getModelColor(response.modelName || model.name)}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getModelIcon(response.modelName || model.name)}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {response.modelName || model.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!response.isComplete && !response.error && (
              <div className="flex items-center gap-1">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
            {response.isComplete && !response.error && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            {response.error && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>

        {response.error ? (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
            <strong>Error:</strong> {response.error}
          </div>
        ) : isExpanded ? (
          <div className="space-y-3">
            <div className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap">
              {response.text || (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  {response.isComplete ? 'No response received' : 'Generating response...'}
                </span>
              )}
            </div>
            
            {response.text && response.isComplete && (
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>{wordCount} words</span>
                <span>~{readingTime} min read</span>
                <span>{response.text.length} characters</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {response.text ? `${response.text.slice(0, 100)}${response.text.length > 100 ? '...' : ''}` : 'Click to expand'}
          </div>
        )}
      </div>
    </div>
  );
}
