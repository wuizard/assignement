import { NavLink } from "react-router-dom"
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import clsx from "clsx"

const pills = (active: boolean) =>
  clsx(
    "px-3 py-2 rounded-md text-sm font-medium transition",
    active
      ? "bg-primary text-primary-foreground shadow"
      : "text-foreground/80 hover:bg-muted hover:text-foreground"
  )

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container h-14 flex items-center">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-1">
            {[
              { to: "/", label: "Task", end: true },
            ].map((l) => (
              <NavigationMenuItem key={l.to}>
                <NavLink to={l.to} end={l.end}>
                  {({ isActive }) => (
                    <NavigationMenuLink className={pills(isActive)}>
                      {l.label}
                    </NavigationMenuLink>
                  )}
                </NavLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
