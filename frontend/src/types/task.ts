import type { User } from "./user"

export type TasksPage = {
  data: Task[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
};

export type Task = {
    id: string,
    title: string,
    description: string,
    status: string,
    deadline?: Date,
    todos: Todos[],
    logs?: TaskLog,
    comment?: TaskComment,
    createdAt: Date,
    updatedAt: Date
}

export type TaskLog = {
    id: string,
    log: string,
    createdAt: Date
}

export type Todos = {
    id: string,
    title: string,
    done: boolean,
    updatedAt?: Date
}

export type TaskComment = {
    id: string,
    comment: string,
    user: User,
    createdAt: Date
}