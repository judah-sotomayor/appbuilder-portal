import type {
  DateLike,
  UserDataTaskListItem,
  UserDataTaskStatus,
  WorkflowTaskListItem
} from './types';

export type FrontendTaskRow =
  | {
      kind: 'workflow';
      task: WorkflowTaskListItem;
      updatedAt: DateLike;
    }
  | {
      kind: 'user-data';
      task: UserDataTaskListItem;
      updatedAt: DateLike;
    };

export function getTaskHref(task: FrontendTaskRow): string {
  return task.kind === 'workflow'
    ? `/tasks/${task.task.ProductId}`
    : `/tasks/user-data/${task.task.requestId}`;
}

export function getUserDataTaskStatus(task: UserDataTaskListItem): UserDataTaskStatus {
  if (task.dateCompleted) return 'completed';
  if (task.dateConfirmed) return 'confirmed';
  return 'pending';
}

export function buildTaskRows(
  workflowTasks: WorkflowTaskListItem[],
  userDataTasks: UserDataTaskListItem[]
): FrontendTaskRow[] {
  const workflowRows: FrontendTaskRow[] = workflowTasks.map((task) => ({
    kind: 'workflow',
    task,
    updatedAt: task.DateUpdated
  }));

  const userDataRows: FrontendTaskRow[] = userDataTasks
    .filter((task) => !task.dateCompleted)
    .map((task) => ({
      kind: 'user-data',
      task,
      updatedAt: task.dateUpdated
    }));

  return workflowRows.concat(userDataRows).sort((a, b) => dateValue(b.updatedAt) - dateValue(a.updatedAt));
}

function dateValue(value: DateLike): number {
  if (!value) return 0;
  if (value instanceof Date) return value.valueOf();
  return new Date(value).valueOf();
}

