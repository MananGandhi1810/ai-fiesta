import { MODELS } from '../api/models/route.js';
import MultiPanelChat from './MultiPanelChat.js';

// Wrapper component that passes static models to the client component
export default function MultiPanelChatWrapper({ activeChatId, ensureChat }) {
  const models = MODELS;
  return <MultiPanelChat initialModels={models} activeChatId={activeChatId} onEnsureChat={ensureChat} />;
}
