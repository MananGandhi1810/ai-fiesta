import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chat, message } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/chats/:id - fetch chat messages
export async function GET(req, { params }) {
  try {
    let session; try { session = await auth.api.getSession({ headers: req.headers }); } catch { session = null; }
    if (!session?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const userId = session.user.id;
    const chatId = params.id;

    const [c] = await db.select().from(chat).where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
    if (!c) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const messages = await db.select().from(message).where(eq(message.chatId, chatId)).orderBy(message.createdAt);
    return new Response(JSON.stringify({ chat: c, messages }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to load chat' }), { status: 500 });
  }
}

// PATCH /api/chats/:id - rename chat
export async function PATCH(req, { params }) {
  try {
    let session; try { session = await auth.api.getSession({ headers: req.headers }); } catch { session = null; }
    if (!session?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const userId = session.user.id;
    const chatId = params.id;
    const { title } = await req.json();
    await db.update(chat).set({ title }).where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to update chat' }), { status: 500 });
  }
}

// DELETE /api/chats/:id
export async function DELETE(req, { params }) {
  try {
    let session; try { session = await auth.api.getSession({ headers: req.headers }); } catch { session = null; }
    if (!session?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const userId = session.user.id;
    const chatId = params.id;
    await db.delete(chat).where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to delete chat' }), { status: 500 });
  }
}
