import { Toaster } from "@/components/ui/sonner"

function Layout ({
    children
} : Readonly<{children: React.ReactNode}>) {
    return (
        <div>
            {/* <Navbar /> */}
            <div className="md:p-4 h-screen">{children}</div>
            <Toaster /> {/* must be mounted once, after children */}
        </div>
    )
}

export default Layout