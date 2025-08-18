import { MODELS } from '../api/models/route.js';
import MultiPanelChat from './MultiPanelChat.js';

// Server component that fetches models and passes them to the client component
export default async function MultiPanelChatWrapper() {
  // Fetch models on the server side
  const models = MODELS;

  return <MultiPanelChat initialModels={models} />;
}
