import type {
  DateLike,
  UserDataTaskAdapter,
  UserDataTaskCompleteResult,
  UserDataTaskDetail,
  UserDataTaskListItem
} from './types';

const mockTasksByUser = new Map<number, Map<string, UserDataTaskDetail>>();

function cloneDate(value: DateLike): DateLike {
  if (!value) return value;
  return value instanceof Date ? new Date(value) : value;
}

function cloneTask(task: UserDataTaskDetail): UserDataTaskDetail {
  return {
    ...task,
    dateCreated: cloneDate(task.dateCreated),
    dateUpdated: cloneDate(task.dateUpdated),
    dateConfirmed: cloneDate(task.dateConfirmed),
    dateCompleted: cloneDate(task.dateCompleted)
  };
}

function ensureMockTasks(userId: number): Map<string, UserDataTaskDetail> {
  const existing = mockTasksByUser.get(userId);
  if (existing) return existing;

  const now = new Date();
  const confirmedUpdated = new Date(now.valueOf() - 1000 * 60 * 48);
  const confirmedCreated = new Date(now.valueOf() - 1000 * 60 * 60 * 2);
  const pendingUpdated = new Date(now.valueOf() - 1000 * 60 * 12);
  const pendingCreated = new Date(now.valueOf() - 1000 * 60 * 35);
  const completedUpdated = new Date(now.valueOf() - 1000 * 60 * 60 * 24);
  const completedCreated = new Date(now.valueOf() - 1000 * 60 * 60 * 48);
  const completedConfirmed = new Date(now.valueOf() - 1000 * 60 * 60 * 30);
  const completedDate = new Date(now.valueOf() - 1000 * 60 * 60 * 20);

  const tasks = new Map<string, UserDataTaskDetail>();
  for (const task of [
    {
      requestId: '8df96a0e-0b0b-4eb7-9f9e-64fa7798ca41',
      email: `requester+${userId}@example.org`,
      dateCreated: confirmedCreated,
      dateUpdated: confirmedUpdated,
      dateConfirmed: new Date(confirmedCreated.valueOf() + 1000 * 60 * 15),
      dateCompleted: null
    },
    {
      requestId: '34c07819-b3d1-4388-88de-96f304cfb7fa',
      email: `pending+${userId}@example.org`,
      dateCreated: pendingCreated,
      dateUpdated: pendingUpdated,
      dateConfirmed: null,
      dateCompleted: null
    },
    {
      requestId: 'b69dbf0f-c9c7-4958-9fa0-f851735fd4da',
      email: `completed+${userId}@example.org`,
      dateCreated: completedCreated,
      dateUpdated: completedUpdated,
      dateConfirmed: completedConfirmed,
      dateCompleted: completedDate
    }
  ] satisfies UserDataTaskDetail[]) {
    tasks.set(task.requestId, task);
  }

  mockTasksByUser.set(userId, tasks);
  return tasks;
}

class MockUserDataTaskAdapter implements UserDataTaskAdapter {
  async listUserDataTasksForCurrentUser(userId: number): Promise<UserDataTaskListItem[]> {
    const tasks = Array.from(ensureMockTasks(userId).values()).map(cloneTask);
    return tasks.sort(
      (a, b) => new Date(b.dateUpdated ?? 0).valueOf() - new Date(a.dateUpdated ?? 0).valueOf()
    );
  }

  async getUserDataTask(userId: number, requestId: string): Promise<UserDataTaskDetail | null> {
    const task = ensureMockTasks(userId).get(requestId);
    return task ? cloneTask(task) : null;
  }

  async markUserDataTaskComplete(
    userId: number,
    requestId: string
  ): Promise<UserDataTaskCompleteResult> {
    const tasks = ensureMockTasks(userId);
    const task = tasks.get(requestId);
    if (!task) {
      return { ok: false, status: 404 };
    }

    if (!task.dateCompleted) {
      const now = new Date();
      task.dateCompleted = now;
      task.dateUpdated = now;
    }

    return {
      ok: true,
      task: cloneTask(task)
    };
  }
}

export const userDataTaskAdapter: UserDataTaskAdapter = new MockUserDataTaskAdapter();
