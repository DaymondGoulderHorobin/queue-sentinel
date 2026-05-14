import { reddit } from '@devvit/web/server';

export const createWorkbenchPost = async () => {
  return await reddit.submitCustomPost({
    title: 'Queue Sentinel',
  });
};
