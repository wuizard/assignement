export const tasksKeys = {
  all: ['tasks'] as const,
  list: () => [...tasksKeys.all, 'list'] as const,
  detail: (id: string) => [...tasksKeys.all, 'detail', id] as const,
};