import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { userDataTaskAdapter } from '$lib/tasks/userDataTaskAdapter.server';

export const load = (async ({ locals, params }) => {
  locals.security.requireAuthenticated();
  const userId = (await locals.auth())!.user.userId;
  const task = await userDataTaskAdapter.getUserDataTask(userId, params.requestId);
  if (!task) return error(404);
  return { task };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ locals, params }) => {
    locals.security.requireAuthenticated();
    const userId = (await locals.auth())!.user.userId;
    const result = await userDataTaskAdapter.markUserDataTaskComplete(userId, params.requestId);

    if (!result.ok) {
      return fail(result.status, {
        ok: false as const,
        reason:
          result.status === 403
            ? 'forbidden'
            : result.status === 404
              ? 'not-found'
              : 'unavailable'
      });
    }

    redirect(303, localizeHref('/tasks'));
  }
} satisfies Actions;

