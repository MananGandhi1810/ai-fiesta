// Client-side API utility for fetching models
export async function fetchModels() {
  try {
    const response = await fetch('/api/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch models');
    }

    return data.models;
  } catch (error) {
    console.error('Error fetching models:', error);
    // Return fallback models in case of error
    return [
      { 
        id: 'openai/gpt-oss-20b', 
        name: 'GPT OSS 20B', 
        icon: '🧠',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-card'
      },
      { 
        id: 'llama-3.1-8b-instant', 
        name: 'Llama 3.1 8B', 
        icon: '⚡',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-card'
      }
    ];
  }
}

// Cache for models to avoid repeated API calls
let modelsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedModels() {
  const now = Date.now();
  
  // Return cached models if they're still fresh
  if (modelsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return modelsCache;
  }
  
  // Fetch fresh models
  const models = await fetchModels();
  modelsCache = models;
  cacheTimestamp = now;
  
  return models;
}
