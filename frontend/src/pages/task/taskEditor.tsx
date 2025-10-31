import type { Task, Todos } from "@/types/task"
import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid, parseISO } from "date-fns"
import { CalendarIcon, Plus, Trash } from "lucide-react"
import { cn, prettyStatus, statusBadgeColor } from "@/lib/utils"
import type { TaskForm } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTaskService, taskDetailService, updateTaskService } from "@/services/task"
import { tasksKeys } from "./keys"
import { toast } from "sonner"
import FullScreenLoader from "@/components/inhouse/loading"
import { taskStatus } from "@/lib/constant"
import { Badge } from "@/components/ui/badge"

type TaskEditorProps = {
    taskId: string,
    setOpen: (e: boolean) => void
    reset: string,
}

function TaskEditor ({
    taskId, setOpen, reset
} : TaskEditorProps) {

    const qc = useQueryClient()
    const [ form, setForm ] = useState<TaskForm>(
        {
            title: '',
            description: '',
            todos: [],
            deadline: undefined
        }
    )

    const [todos, setTodos] = useState<Todos[]>([])

    const addTodo = () => setTodos(prev => [...prev, { id: String(Date.now()), title: "", done: false }])
    const removeTodo = (id: string) => setTodos(prev => prev.filter(t => t.id === String(id) ? false : true))
    const updateTodo = (id: string | number, title: string) => setTodos(prev => prev.map(t => (String(t.id) === String(id) ? { ...t, title } : t)))

    const { data, isLoading, isError } = useQuery<Task>({
        queryKey: taskId ? tasksKeys.detail(taskId) : ["noop"],
        queryFn: () => taskDetailService(taskId),
        enabled: Boolean(taskId),
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
        staleTime: 0,
    })

    useEffect(() => {
        console.log('here reset', reset)
        setForm({
            title: '',
            description: '',
            todos: [],
            deadline: undefined
        })
        setTodos([])
    }, [reset])

    useEffect(() => {
        if (!data) return
        let deadline: Date | undefined = undefined
        if (typeof data.deadline === "string") {
            const d = parseISO(data.deadline)
            deadline = isValid(d) ? d : undefined
        } else if (data.deadline instanceof Date) {
            deadline = data.deadline
        }

        const normalizedTodos =
            (data.todos ?? []).map(td => ({
            id: String(td.id),
            title: td.title ?? "",
            done: Boolean(td.done),
        }))

        setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            todos: normalizedTodos ?? [],
            status: data.status || "todo",
            deadline,
        })
        setTodos(normalizedTodos ?? [])
    }, [data])

    const onChange = (e: TaskForm) => {
        console.log('here e', e)
        setForm(prev => ({
            ...prev,
            ...e
        }))
    }

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            if (taskId) {
                return updateTaskService({
                    taskId, 
                    body: {
                        ...form,
                        todos: todos
                    }
                })
            }
            return createTaskService({
                ...form,
                todos: todos
            })
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: tasksKeys.list(), refetchType: 'active' });
            toast(!taskId ? "Task created" : "Task updated")
            setForm({
                title: '',
                description: '',
                todos: [],
                deadline: undefined
            })
            setTodos([])
            setOpen(false)
        },
        onError: (e) => {
            const msg = e instanceof Error ? e.message : "There is problem with server connection"
            console.log('here msg', msg)
        },
    })

    if (isError) {
        <div>There is something wrong.</div>
    }

    if (isLoading) {
        <FullScreenLoader />
    }

    return (
        <form className="relative flex h-full flex-col" onSubmit={(e) => {
            e.preventDefault()
            mutate()
        }}>
            <Label className="text-xl font-semibold -mt-8 mb-2 md:ml-0 md:-mt-1">What's in your mind ?</Label>
            <div className="space-y-3 overflow-auto p-0 pb-28 md:pb-0">
                <div className="space-y-1 p-1 pb-0">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. Design new landing page"
                        value={form.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                    />
                </div>
                <div className="space-y-1 p-1 pb-0">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Add more details..."
                        value={form.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                    />
                </div>
                {
                    taskId &&
                    <div className="flex gap-1 cursor-pointer">
                    {
                        taskStatus.map(v => {
                            return (
                                <Badge onClick={() => {
                                    onChange({ status: v })
                                }} variant="outline" className={statusBadgeColor(v, v == form.status)}>
                                    {prettyStatus(v)}
                                </Badge>
                            )
                        })
                    }
                    </div>
                }
                <div className="space-y-2 p-1 pb-0">
                    <div className="flex items-center justify-between">
                        <Label>Todo List</Label>
                    </div>
                    <div className="space-y-2">
                        {todos.map((todo) => (
                            <div key={todo.id} className="flex items-center gap-2">
                                <Input
                                    value={todo.title}
                                    onChange={(e) => updateTodo(todo.id, e.target.value)}
                                    placeholder="Add your todolist"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => removeTodo(todo.id)}
                                >
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button className="w-full mt-4" size="sm" variant="outline" type="button" onClick={addTodo}>
                            <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                    </div>
                </div>
                <div className="space-y-1 p-1">
                    <Label>Deadline</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.deadline && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {form.deadline ? format(form.deadline, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                            <Calendar
                                mode="single"
                                selected={form.deadline}
                                onSelect={(d) => onChange({ deadline: d })}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="md:static md:border-0 md:bg-transparent md:p-0
            fixed inset-x-0 bottom-0 border-t bg-background/95 p-4
            backdrop-blur supports-backdrop-filter:bg-background/75 ">
                <div className="mx-auto max-w-6xl md:text-right">
                    <Button type="submit" disabled={isPending || isLoading} className="w-full md:w-auto md:mt-4">
                        {!taskId ? "Save Task" : "Update Task"}
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default TaskEditor