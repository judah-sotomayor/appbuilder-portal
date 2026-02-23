import { describe, expect, it } from 'vitest';
import { buildTaskRows, getTaskHref } from './list';
import type { UserDataTaskListItem, WorkflowTaskListItem } from './types';

const workflowTask: WorkflowTaskListItem = {
  Status: 'Approval Pending',
  Comment: null,
  DateUpdated: new Date('2026-02-23T10:00:00.000Z'),
  ProductId: '8f5ec0f0-cbe8-4c5f-a4a3-56dd66523a0d',
  Product: {
    ProductDefinition: {
      Name: 'Android App'
    },
    ProjectId: 15,
    Project: {
      Name: 'Luke'
    }
  }
};

const activeUserDataTask: UserDataTaskListItem = {
  requestId: '11111111-2222-4333-8abc-0123456789ab',
  email: 'person@example.org',
  dateCreated: new Date('2026-02-23T08:00:00.000Z'),
  dateUpdated: new Date('2026-02-23T11:00:00.000Z'),
  dateConfirmed: new Date('2026-02-23T08:15:00.000Z'),
  dateCompleted: null
};

const completedUserDataTask: UserDataTaskListItem = {
  requestId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
  email: 'done@example.org',
  dateCreated: new Date('2026-02-22T08:00:00.000Z'),
  dateUpdated: new Date('2026-02-22T09:00:00.000Z'),
  dateConfirmed: new Date('2026-02-22T08:15:00.000Z'),
  dateCompleted: new Date('2026-02-22T10:00:00.000Z')
};

describe('task list helpers', () => {
  it('routes workflow tasks to workflow detail paths', () => {
    const [row] = buildTaskRows([workflowTask], []);
    expect(row.kind).toBe('workflow');
    expect(getTaskHref(row)).toBe(`/tasks/${workflowTask.ProductId}`);
  });

  it('routes user-data tasks to user-data detail paths', () => {
    const [row] = buildTaskRows([], [activeUserDataTask]);
    expect(row.kind).toBe('user-data');
    expect(getTaskHref(row)).toBe(`/tasks/user-data/${activeUserDataTask.requestId}`);
  });

  it('sorts mixed tasks by most recent update', () => {
    const rows = buildTaskRows([workflowTask], [activeUserDataTask]);
    expect(rows).toHaveLength(2);
    expect(rows[0].kind).toBe('user-data');
    expect(rows[1].kind).toBe('workflow');
  });

  it('filters completed user-data tasks from the list', () => {
    const rows = buildTaskRows([], [activeUserDataTask, completedUserDataTask]);
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe('user-data');
    if (rows[0].kind === 'user-data') {
      expect(rows[0].task.requestId).toBe(activeUserDataTask.requestId);
    }
  });
});
