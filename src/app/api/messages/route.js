import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chat, message } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// POST /api/messages - add user + assistant messages in one request
export async function POST(req) {
  try {
    let session; try { session = await auth.api.getSession({ headers: req.headers }); } catch { session = null; }
    if (!session?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const userId = session.user.id;
    const { chatId, userContent, assistantResponses } = await req.json();

    if (!chatId || !userContent) {
      return new Response(JSON.stringify({ error: 'chatId and userContent required' }), { status: 400 });
    }

    // Ensure chat belongs to user
    const [c] = await db.select().from(chat).where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
    if (!c) return new Response(JSON.stringify({ error: 'Chat not found' }), { status: 404 });

    const userMsgId = randomUUID();
    const rows = [
      { id: userMsgId, chatId, userId, role: 'user', content: userContent }
    ];

    if (assistantResponses && Array.isArray(assistantResponses)) {
      assistantResponses.forEach(r => {
        rows.push({ id: randomUUID(), chatId, role: 'assistant', modelId: r.modelId, content: r.content });
      });
    }

    await db.insert(message).values(rows);
    return new Response(JSON.stringify({ userMessageId: userMsgId }), { status: 201 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to save messages' }), { status: 500 });
  }
}
