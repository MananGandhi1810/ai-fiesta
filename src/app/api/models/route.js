import { NextResponse } from 'next/server';

// Centralized models configuration
const MODELS = [
  { 
    id: 'openai/gpt-oss-20b', 
    name: 'GPT OSS 20B', 
    icon: '🧠',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-card',
    provider: 'openai',
    description: 'Open source GPT model with 20B parameters'
  },
  { 
    id: 'llama-3.1-8b-instant', 
    name: 'Llama 3.1 8B', 
    icon: '⚡',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-card',
    provider: 'meta',
    description: 'Fast Llama 3.1 model with 8B parameters'
  },
  { 
    id: 'moonshotai/kimi-k2-instruct', 
    name: 'Kimi K2', 
    icon: '🔮',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-card',
    provider: 'moonshot',
    description: 'Moonshot AI instruction-tuned model'
  },
  { 
    id: 'gemma2-9b-it', 
    name: 'Gemma 2 9B', 
    icon: '💎',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-card',
    provider: 'google',
    description: 'Google Gemma 2 instruction-tuned model'
  },
  // Add more models here as needed
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      models: MODELS,
      count: MODELS.length
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch models',
        models: []
      },
      { status: 500 }
    );
  }
}

// Export the models for server-side usage
export { MODELS };
