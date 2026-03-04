import { corsHeaders, handleOptions } from './utils/cors.js';
import { handleAuthRoutes } from './routes/auth.js';
import { handlePostsRoutes } from './routes/posts.js';
import { handleSearchRoutes } from './routes/search.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const optionsResponse = handleOptions(request);
    if (optionsResponse) return optionsResponse;

    const JWT_SECRET = env.JWT_SECRET || 'your-default-secret-key-for-local';

    try {
      let response = await handleAuthRoutes(request, path, env, JWT_SECRET);
      if (response) return response;

      response = await handlePostsRoutes(request, path, env, JWT_SECRET);
      if (response) return response;

      response = await handleSearchRoutes(request, path, env);
      if (response) return response;

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
    }
  }
};
