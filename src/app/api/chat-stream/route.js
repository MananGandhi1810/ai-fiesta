import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Define the AI models we want to use
const MODELS = [
  { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder' },
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2' },
  { id: 'google/gemma-3n-e2b-it:free', name: 'Gemma 3N E2B' },
];

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a readable stream for server-sent events
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial message to indicate streaming has started
        controller.enqueue(`data: ${JSON.stringify({ type: 'start', models: MODELS })}\n\n`);

        // Create promises for all models
        const modelPromises = MODELS.map(async (model) => {
          try {
            const result = await streamText({
              model: openrouter(model.id),
              prompt: message,
              maxTokens: 1000,
            });

            // Stream the response
            let fullText = '';
            for await (const chunk of result.textStream) {
              fullText += chunk;
              controller.enqueue(`data: ${JSON.stringify({
                type: 'chunk',
                modelId: model.id,
                modelName: model.name,
                chunk: chunk,
                fullText: fullText
              })}\n\n`);
            }

            // Send completion signal for this model
            controller.enqueue(`data: ${JSON.stringify({
              type: 'complete',
              modelId: model.id,
              modelName: model.name,
              fullText: fullText
            })}\n\n`);

          } catch (error) {
            console.error(`Error with model ${model.name}:`, error);
            controller.enqueue(`data: ${JSON.stringify({
              type: 'error',
              modelId: model.id,
              modelName: model.name,
              error: error.message
            })}\n\n`);
          }
        });

        // Wait for all models to complete
        await Promise.all(modelPromises);
        
        // End the stream
        controller.enqueue(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
