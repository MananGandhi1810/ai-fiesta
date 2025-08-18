import { MODELS } from '../app/api/models/route.js';

// Server-side function to get models
export async function getModelsServerSide() {
  try {
    // Since we're on the server, we can directly import and return the models
    return {
      success: true,
      models: MODELS,
      count: MODELS.length
    };
  } catch (error) {
    console.error('Error fetching models server-side:', error);
    return {
      success: false,
      models: [],
      count: 0,
      error: 'Failed to fetch models'
    };
  }
}

// Alternative: If you want to fetch from the API endpoint (useful for external APIs)
export async function getModelsFromAPI() {
  try {
    // This would be useful if fetching from external APIs
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/models`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching models from API:', error);
    return {
      success: false,
      models: [],
      count: 0,
      error: 'Failed to fetch models from API'
    };
  }
}
