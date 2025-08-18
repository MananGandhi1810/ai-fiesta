import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chat, message } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET /api/chats - list chats for current user with last message timestamp
export async function GET(req) {
  try {
    let session;
    try { session = await auth.api.getSession({ headers: req.headers }); } catch { session = null; }
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const userId = session.user.id;

    const chats = await db.select().from(chat).where(eq(chat.userId, userId)).orderBy(chat.createdAt.desc?.() || chat.createdAt);

    return new Response(JSON.stringify({ chats }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to load chats' }), { status: 500 });
  }
}

// POST /api/chats - create new chat
export async function POST(req) {
  try {
    let session;
    try { session = await auth.api.getSession({ headers: req.headers }); } catch { session = null; }
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const userId = session.user.id;
    const { title } = await req.json();
    const id = randomUUID();
    await db.insert(chat).values({ id, userId, title: title?.trim() || 'New Chat' });
    return new Response(JSON.stringify({ id }), { status: 201 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to create chat' }), { status: 500 });
  }
}
