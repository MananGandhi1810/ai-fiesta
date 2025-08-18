import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

const MODELS = [
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
  { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
];

export async function POST(req) {
  try {
    const { chatHistory, currentMessage, models } = await req.json();

    if (!currentMessage || !models || !Array.isArray(models)) {
      return new Response(JSON.stringify({ error: 'currentMessage and models array are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buildMessagesForModel = (modelId) => {
      const messages = [];
      
      if (chatHistory && Array.isArray(chatHistory)) {
        chatHistory.forEach(chat => {
          messages.push({
            role: 'user',
            content: chat.userMessage
          });
          
          if (chat.responses && chat.responses[modelId] && chat.responses[modelId].text && !chat.responses[modelId].error) {
            messages.push({
              role: 'assistant',
              content: chat.responses[modelId].text.trim()
            });
          }
        });
      }
      
      messages.push({
        role: 'user',
        content: currentMessage
      });
      
      return messages;
    };

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(`data: ${JSON.stringify({ type: 'start', models: MODELS })}\n\n`);

        const modelPromises = MODELS.map(async (model) => {
          try {
            const modelMessages = buildMessagesForModel(model.id);
            
            const result = await streamText({
              model: groq(model.id),
              messages: modelMessages,
              maxTokens: 1000,
              temperature: 0.7,
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
