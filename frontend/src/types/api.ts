import type { Todos } from "./task"

export type LoginResponse = {
    token: string
}

export type RegisterResponse = {
    message: string
}

export type LogoutResponse = {
    message: string
}

export type TaskForm = {
    title?: string,
    description?: string,
    todos?: Todos[]
    status?: string,
    deadline?: Date | undefined
}

export type TodosForm = {
    id: string,
    done: boolean
}

export type ApiError = { message?: string; };