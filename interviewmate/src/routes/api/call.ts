import { createAPIFileRoute } from '@tanstack/react-start/api';
import { handleApiCall } from '../../server/api-handlers';

export const APIRoute = createAPIFileRoute('/api/call')({
  POST: async ({ request }) => {
    return handleApiCall(request);
  },
});
