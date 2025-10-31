import TaskEditor from "./taskEditor";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import TaskList from "./taskList";
import { getCookie } from "@/lib/cookie";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/inhouse/sidebar";
import { useIsMobile } from "@/components/ui/hooks/use-mobile";

function Task () {

    const [ open, setOpen ] = useState<boolean>(false)
    const [ taskId, setTaskId ] = useState<string>('')
    const nav = useNavigate()
    const isMobile = useIsMobile()

    useEffect(() => {
        const cookie = getCookie('XSRF-TOKEN')
        if (!cookie) { nav('/login',  { replace: true }) }
    }, [])

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 p-4 h-full">
                <Sidebar />
                <div className="flex-1 md:basis-1/3 md:grow-0 md:shrink-0 space-y-2
                    rounded-md md:border bg-card p-4 h-full">
                    <TaskList setTaskId={(id) => {
                        setTaskId(id)
                        if (isMobile) { setOpen(true) }
                    }} setOpen={() => {
                        if (isMobile) { setOpen(true) }
                    }}/>
                </div>
                <div className="hidden md:block flex-1 rounded-md p-4">
                    <TaskEditor taskId={taskId} setOpen={setOpen} />
                </div>
                <div className="md:hidden fixed bottom-5 right-5">
                    <Sheet open={open} onOpenChange={() => {
                        setTaskId('')
                        setOpen(!open)
                    }}>
                        <SheetTrigger asChild>
                            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
                                <Plus className="h-6 w-6"/>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="overflow-auto h-[80%] p-4 rounded-t-2xl pt-12">
                            <TaskEditor taskId={taskId} setOpen={setOpen}/>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    )
}

export default Task