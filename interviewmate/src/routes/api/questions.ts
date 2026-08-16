import { createAPIFileRoute } from '@tanstack/react-start/api';
import { handleApiQuestions } from '../../server/api-handlers';

export const APIRoute = createAPIFileRoute('/api/questions')({
  POST: async ({ request }) => {
    return handleApiQuestions(request);
  },
});
