import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import type { Task, TasksPage } from "@/types/task"
import { taskListService } from "@/services/task"
import { tasksKeys } from "./keys"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import TaskCard from "./taskCard"
import React, { useEffect, useState } from "react"
import useDebouncedValue from "@/lib/debounce"
import { Label } from "@/components/ui/label"
import { taskStatus } from "@/lib/constant"
import { Badge } from "@/components/ui/badge"
import { prettyStatus, statusBadgeColor } from "@/lib/utils"

type TaskListProps = {
  taskId: string,
  setTaskId: (id: string) => void,
  setOpen: () => void, 
  setReset: () => void
}

export default function TaskList({ taskId, setTaskId, setOpen, setReset }: TaskListProps) {

  const [ query, setQuery ] = useState<string>("")
  const [ status, setStatus ] = useState<string[]>([]);
  const [ page, setPages ] = useState<unknown>('')
  const debounce = useDebouncedValue(query, 300)

  let params = { query: debounce || '', status: status.length > 0 ? [...status] : [] };
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery<TasksPage>({
    queryKey: [...tasksKeys.list(), params],                 
    initialPageParam: 1,                                      
    queryFn: ({ pageParam = 1 }) => reloadData(pageParam),       
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const reloadData = async (page: unknown) => {
    setTaskId('')
    setPages(page)
    return await taskListService({...params, page})
  }

  const tasks = data?.pages.flatMap((p) => p.data) ?? []

  useEffect(() => {
    if (page == 1 && data && data.pages.flatMap((p) => p.data).length == 0) setOpen()
  }, [page])

  const scrollParentRef = React.useRef<HTMLDivElement>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!data?.pages?.length) return
    if (!bottomRef.current) return
    const root = scrollParentRef.current ?? null
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { root, rootMargin: "200px", threshold: 0 } // prefetch before bottom
    )
    io.observe(bottomRef.current)
    return () => io.disconnect()
  }, [data?.pages?.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="space-y-3">
      <Label className="text-xl font-semibold ml-8 -mt-3 mb-8 md:ml-0 md:mt-0 md:mb-2 ">My Tasks {tasks.length > 0 ? `(${tasks.length})` : ''}</Label>
      <Input placeholder="Search" value={query} onChange={(e) => {
        setQuery(e.target.value)
      }}/>
      <div ref={scrollParentRef} className="flex gap-1 cursor-pointer">
      {
          taskStatus.map(v => {
              return (
                  <Badge onClick={() => {
                      setStatus((prev) => prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v])
                  }} variant="outline" className={statusBadgeColor(v, status.some(s => s == v))}>
                      {prettyStatus(v)}
                  </Badge>
              )
          })
      }
      </div>
      {isFetchingNextPage && (
        <div className="py-3 text-center text-sm text-muted-foreground">
          Loading more…
        </div>
      )}
      {/* {!hasNextPage && !isLoading && tasks.length > 0 && (
        <div className="py-3 text-center text-xs text-muted-foreground">No more tasks</div>
      )} */}
      {
        isLoading &&
        <div className="space-y-2">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      }
      {
        (!isLoading && tasks.length == 0) &&
        <div className="text-sm text-muted-foreground border rounded-md p-4">
          No tasks yet. Create your first task
        </div>
      }
      {
        (!isLoading && tasks.length > 0) &&
        <div className="space-y-2 overflow-y-auto h-[75vh] md:h-[70vh]">    
          {tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setTaskId(t.id)}
              className="w-full text-left p-1"
            >
              <TaskCard data={t} setReset={setReset} selected={t.id === taskId}/>
            </div>
          ))}
          {hasNextPage && !isFetchingNextPage && (
            <div className="py-3 text-center">
              <button
                className="text-sm underline underline-offset-2"
                onClick={() => fetchNextPage()}
              >
                Load more
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      }
      {
        isError &&
        <div className="text-sm text-red-600">
          Failed to load tasks.{" "}
          <button className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      }
    </div>
  )
}

function TaskCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-28" />
              <div className="ml-auto">
                <Skeleton className="h-1.5 w-20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}