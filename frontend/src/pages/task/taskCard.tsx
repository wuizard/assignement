import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTaskService, updateTaskStatusService, updateTodoService } from "@/services/task"
import { tasksKeys } from "./keys"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, Trash } from "lucide-react"
import { format, isPast, parseISO } from "date-fns"
import { cn, prettyStatus, statusBadgeColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { taskStatus } from "@/lib/constant"

import type { Task } from "@/types/task"
import type { TodosForm } from "@/types/api"

type TaskCardProps = {
  data: Task,
  setReset: () => void,
  selected?: boolean
}

export default function TaskCard({ data, setReset, selected }: TaskCardProps) {
  const total = data.todos?.length ?? 0
  const done = data.todos?.filter((x) => x.done).length ?? 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const qc = useQueryClient()

  const [ deleteConfirmation, setDeleteConfirmation ] = useState<boolean>(false)
  const [ updateStatus, setUpdateStatus ] = useState<boolean>(false)

  const deadlineDate =
    typeof data.deadline === "string"
      ? parseISO(data.deadline)
      : data.deadline ?? undefined

  const overdue = deadlineDate ? isPast(deadlineDate) && pct < 100 : false


  const deleteTask = useMutation({
    mutationKey: ['task','delete'],
    mutationFn: async ({ id }: { id: string }) => deleteTaskService(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksKeys.list() })
      toast("Task deleted")
      setReset()
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "There is a server problem"
      toast.error(msg)
    },
  })

  const updateTaskStatus = useMutation({
    mutationKey: ['task','todo', 'update-status'],
    mutationFn: async ({ id, status }: {id: string, status: string}) => updateTaskStatusService({id, body: { status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksKeys.list() })
      setUpdateStatus(false)
      setReset()
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "There is a server problem"
      toast.error(msg)
    },
  })

  const updateTodo = useMutation({
    mutationKey: ['task','todo', 'update-status'],
    mutationFn: async ({ id, done }: TodosForm) => updateTodoService({id, done }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksKeys.list() })
      setReset()
      // toast("Todolist Updated")
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "There is a server problem"
      toast.error(msg)
    },
  })

  const [expanded, setExpanded] = useState(false)

  const visibleTodos = expanded ? (data.todos ?? []) : (data.todos ?? []).slice(0, 2)
  const remaining = (data.todos?.length ?? 0) - visibleTodos.length

  return (
    <Card className={cn(
      `group hover:shadow-md transition-shadow gap-0 py-0  ${selected ? "border-primary-500 ring-1 ring-primary shadow-md" : "border-gray-200 hover:shadow-sm"}` 
    )}>
      <CardContent className="p-3 sm:p-3 py-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{data.title}</div>
                {data.description ? (
                  <div className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                    {data.description}
                  </div>
                ) : null}
                <div className="flex gap-1 cursor-pointer mt-2" onClick={(e) => {
                  e.stopPropagation()
                }}>
                  {data.status ? (
                      <Badge variant="outline" onClick={() => {
                        setUpdateStatus(!updateStatus)
                      }} className={statusBadgeColor(data.status, true)}>
                          {prettyStatus(data.status)}
                      </Badge>
                  ) : null}
                  <div
                    className={`flex gap-1 transition-all duration-300 overflow-hidden ${
                      updateStatus ? "max-w-[500px] opacity-100" : "max-w-0 opacity-0"
                    }`}
                  >
                    {
                      updateStatus && taskStatus.filter(v => !(v == data.status)).map(v => {
                          return (
                              <Badge onClick={() => {
                                  updateTaskStatus.mutate({ id: data.id, status: v })
                              }} variant="outline" 
                              className={`
                                ${statusBadgeColor(v, v === data.status)}
                                transform transition-all ease-out duration-300
                                ${updateStatus ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
                              `}>
                                  {prettyStatus(v)}
                              </Badge>
                          )
                      })
                    }
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="-mr-3 -mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmation(true);
                    }}
                >
                    <Trash className="h-4 w-4 text-destructive" />
                </Button>
                {deadlineDate ? (
                    <div className={cn(
                    "inline-flex items-center gap-1 text-xs py-1",
                    overdue ? "text-destructive" : "text-muted-foreground"
                    )}>
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>{format(deadlineDate, "PP")}</span>
                    </div>
                ) : null}
                {
                  (data.todos && data.todos.length > 0) &&
                  <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                      {done}/{total}
                      </span>
                      <Progress value={pct} className="h-1.5 w-20" />
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        {data.todos && data.todos.length > 0 && (
            <div className="mt-2 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Todo List</div>

            <ul className="space-y-1.5">
                {visibleTodos.map((td) => (
                <li key={td.id} className="flex items-start gap-2">
                    <span onClick={(e) => {
                      e.stopPropagation()
                    }}>
                      <Checkbox
                        checked={td.done}
                        onCheckedChange={() => {
                          updateTodo.mutate({id: td.id, done: !td.done})
                        }}
                        className="mt-0.5"
                      />
                    </span>
                    <span
                    className={cn(
                        "text-sm leading-5",
                        td.done && "text-muted-foreground line-through"
                    )}
                    >
                    {td.title}
                    </span>
                </li>
                ))}
            </ul>

            {remaining > 0 && !expanded && (
                <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:no-underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(true)
                }}
                >
                Show {remaining} more
                </button>
            )}

            {expanded && data.todos.length > 2 && (
                <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:no-underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false)
                }}
                >
                Show less
                </button>
            )}
            </div>
        )}
      </CardContent>
      {deleteConfirmation && (
          <div
            className="mt-2 rounded-b-md border border-red-200 bg-red-50 p-3 text-red-800"
            role="alert"
            aria-live="assertive"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">
                Proceed to Delete ? This can’t be undone.
              </p>
              <div className="flex items-center gap-4">
                <span
                  role="button"
                  tabIndex={0}
                  className="text-sm underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-200 rounded"
                  onClick={(e) => {e.stopPropagation(); setDeleteConfirmation(false);}}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setDeleteConfirmation(false)}
                >
                  No
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  className="text-sm font-semibold text-red-700 underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-200 rounded"
                  onClick={(e) => {e.stopPropagation(); deleteTask.mutate({ id: data.id })}}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && deleteTask.mutate({ id: data.id })}
                >
                  Yes
                </span>
              </div>
            </div>
          </div>
        )}
    </Card>
  )
}
