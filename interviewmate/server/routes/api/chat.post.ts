import { handleApiChat } from '../../../../src/server/api-handlers';

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  return handleApiChat(request);
});
