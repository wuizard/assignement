import type { TaskForm, TodosForm } from "@/types/api";
import { client, errorValidation } from "./service";
import type { Task, TasksPage } from "@/types/task";

export const taskListService = async function ({
    query, status, page
}: { query: string, status: string[], page: unknown}) {
    try {
        const searchParams = new URLSearchParams();
        if (query) searchParams.set('query', query);
        if (status.length > 0) { for (const s of status) searchParams.append('status[]', s) }
        if (page) searchParams.set('page', page.toString());
        const response = await client.get(`/api/tasks?${searchParams.toString()}`);
        if (response.status !== 200) { throw response.data; }
        const data : TasksPage = response.data;
        return data;
    } catch (e: unknown) {
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const taskDetailService = async function (taskId: string) {
    try {
        const response = await client.get(`/api/tasks/${taskId}`);
        if (response.status !== 200) { throw response.data; }
        const data : Task = response.data.data;
        return data;
    } catch (e: unknown) {
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const createTaskService = async function ({
    title, description, todos, deadline
}: TaskForm) {
    try {
        const response = await client.post('/api/tasks', {
            title, description, todos, deadline
        });
        if (response.status !== 200) { throw response.data; }
        const data : Task = response.data.data;
        return data;
    } catch (e: unknown) {
        console.log('here error',e)
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const updateTaskService = async function ({
    taskId, body: { title, description, todos, status, deadline }
}: {taskId: string, body: TaskForm}) {
    try {
        const response = await client.patch(`/api/tasks/${taskId}`, {
            title, description, todos, status, deadline
        });
        if (response.status !== 200) { throw response.data; }
        const data : Task = response.data.data;
        return data;
    } catch (e: unknown) {
        console.log('here error',e)
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const deleteTaskService = async function (id: unknown) {
    try {
        const response = await client.delete(`/api/tasks/${id}`);
        if (response.status !== 200) { throw response.data; }
        const data : Task = response.data.data;
        return data;
    } catch (e: unknown) {
        console.log('here error',e)
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const updateTaskStatusService = async function ({
    id, body: { status }
}: { id: string, body: TaskForm }) {
    try {
        const response = await client.patch(`/api/tasks-status/${id}`, {
            status
        });
        if (response.status !== 200) { throw response.data; }
        const data : Task = response.data.data;
        return data;
    } catch (e: unknown) {
        console.log('here error',e)
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}

export const updateTodoService = async function ({
    id, done
}: TodosForm ) {
    try {
        const response = await client.patch(`/api/todos/${id}`, {
            done
        });
        if (response.status !== 200) { throw response.data; }
        const data : Task = response.data.data;
        return data;
    } catch (e: unknown) {
        console.log('here error',e)
        const err = errorValidation(e)
        throw new Error(typeof err == "string" ? err : (err?.error ?? "There is problem with server connection"))
    }
}