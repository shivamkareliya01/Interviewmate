import { createAPIFileRoute } from '@tanstack/react-start/api';
import { handleApiChat } from '../../server/api-handlers';

export const APIRoute = createAPIFileRoute('/api/chat')({
  POST: async ({ request }) => {
    return handleApiChat(request);
  },
});
