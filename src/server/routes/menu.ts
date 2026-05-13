import { context } from '@devvit/web/server';
import type { UiResponse } from '@devvit/web/shared';
import { Hono } from 'hono';

import { createWorkbenchPost } from '../core/post';

export const menuRoute = new Hono();

menuRoute.post('/post-create', async (requestContext) => {
  try {
    const post = await createWorkbenchPost();

    return requestContext.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200,
    );
  } catch (error) {
    console.error('Failed to create Queue Sentinel workbench post', error);

    return requestContext.json<UiResponse>(
      {
        showToast: 'Failed to create Queue Sentinel workbench post',
      },
      400,
    );
  }
});
