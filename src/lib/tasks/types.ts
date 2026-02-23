export type DateLike = Date | string | null;

export interface WorkflowTaskListItem {
  Status: string | null;
  Comment: string | null;
  DateUpdated: DateLike;
  ProductId: string;
  Product: {
    ProductDefinition: {
      Name: string | null;
    };
    ProjectId: number;
    Project: {
      Name: string;
    };
  };
}

export interface UserDataTaskListItem {
  requestId: string;
  email: string;
  dateCreated: DateLike;
  dateUpdated: DateLike;
  dateConfirmed: DateLike;
  dateCompleted: DateLike;
}

export interface UserDataTaskDetail extends UserDataTaskListItem {}

export type UserDataTaskStatus = 'pending' | 'confirmed' | 'completed';

export type UserDataTaskCompleteResult =
  | {
      ok: true;
      task: UserDataTaskDetail;
    }
  | {
      ok: false;
      status: 403 | 404 | 503;
      message?: string;
    };

export interface UserDataTaskAdapter {
  listUserDataTasksForCurrentUser(userId: number): Promise<UserDataTaskListItem[]>;
  getUserDataTask(userId: number, requestId: string): Promise<UserDataTaskDetail | null>;
  markUserDataTaskComplete(userId: number, requestId: string): Promise<UserDataTaskCompleteResult>;
}
