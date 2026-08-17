import { handleApiQuestions } from '../../../../src/server/api-handlers';

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  return handleApiQuestions(request);
});
