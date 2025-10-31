import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Menu } from "lucide-react";
import { getMeService, logoutService } from "@/services/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { User } from "@/types/user";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

export default function Sidebar() {
  const nav = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => logoutService(),
    onSuccess: () => {
      toast("You have been logged out.");
      nav("/login", { replace: true });
    },
    onError: () => {
      nav("/login", { replace: true });
    },
  });

  const { data } = useQuery<User>({
    queryKey: ["me"],
    queryFn: getMeService,
  });

  const user = data;
  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
        <aside
            className="
            hidden md:flex
            md:w-[20%]
            flex-col
            shrink-0 grow-0
            rounded-md border bg-card
            p-4
            h-full"
            aria-label="User sidebar"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
            <Avatar className="size-10">
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <Label className="text-lg font-semibold leading-none">
                {user?.name ?? "-"}
                </Label>
                <p className="text-sm text-muted-foreground truncate">
                {user?.email ?? "—"}
                </p>
            </div>
            </div>

            <Separator className="my-4" />

            <div className="mt-auto pt-4">
            <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => mutate()}
                disabled={isPending}
                aria-busy={isPending}
            >
                <LogOut className="size-4" />
                {isPending ? "Logging out…" : "Logout"}
            </Button>
            </div>
        </aside>

        <div className="md:hidden fixed top-3 left-3 z-50">
            <Sheet>
                <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-md border bg-background shadow-sm"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
                </SheetTrigger>

                
                <SheetContent
                    side="left"
                    className="w-[85%] sm:w-[360px] p-0"
                    aria-label="Mobile sidebar"
                >

                <div className="flex items-center gap-3 p-4 border-b">
                    <Avatar className="size-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                    {/* <AvatarImage src={user?.avatarUrl ?? ""} /> */}
                    </Avatar>
                    <div className="min-w-0">
                    <Label className="text-base font-semibold leading-none">
                        {user?.name ?? "-"}
                    </Label>
                    <p className="text-xs text-muted-foreground truncate">
                        {user?.email ?? "—"}
                    </p>
                    </div>
                </div>

                {/* <nav className="p-2">
                    <button
                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => nav("/task")}
                    >
                    My Tasks
                    </button>
                    <button
                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => nav("/")}
                    >
                    Home
                    </button>
                </nav> */}

                {/* <Separator className="my-2" /> */}

                <div className="p-4 mt-auto">
                    <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => mutate()}
                    disabled={isPending}
                    aria-busy={isPending}
                    >
                    <LogOut className="size-4" />
                    {isPending ? "Logging out…" : "Logout"}
                    </Button>
                </div>
                </SheetContent>
            </Sheet>
        </div>
    </>
  );
}
