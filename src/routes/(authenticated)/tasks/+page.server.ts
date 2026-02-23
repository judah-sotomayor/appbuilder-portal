import type { PageServerLoad } from './$types';
import { getUserTasks } from '$lib/projects/sse';
import { userDataTaskAdapter } from '$lib/tasks/userDataTaskAdapter.server';

export const load = (async (event) => {
  event.locals.security.requireAuthenticated();
  const userId = (await event.locals.auth())!.user.userId;
  const [userTasks, userDataTasks] = await Promise.all([
    getUserTasks(userId),
    userDataTaskAdapter.listUserDataTasksForCurrentUser(userId)
  ]);
  return { userTasks, userDataTasks };
}) satisfies PageServerLoad;
