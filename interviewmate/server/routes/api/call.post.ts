import { handleApiCall } from '../../../../src/server/api-handlers';

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  return handleApiCall(request);
});
