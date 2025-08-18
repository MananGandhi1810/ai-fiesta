import ClientLayout from './components/ClientLayout';
import MultiPanelChatWrapper from './components/MultiPanelChatWrapper';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect('/auth');
  }
  return (
    <ClientLayout>
      <MultiPanelChatWrapper />
    </ClientLayout>
  );
}
