import { auth } from '../../../../src/lib/auth';

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  return auth.handler(request);
});
