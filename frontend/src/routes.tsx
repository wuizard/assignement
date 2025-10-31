import { lazy } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
const Task = lazy(() => import("./pages/task"))
const Login = lazy(() => import("./pages/auth/login"))
const Register = lazy(() => import("./pages/auth/register"))

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Task />,
    children: [
      { path: "*", element: <Navigate to="/" /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    children: [
      { path: "*", element: <Navigate to="/" /> },
    ],
  },
  {
    path: "/register",
    element: <Register />,
    children: [
      { path: "*", element: <Navigate to="/" /> },
    ],
  },
  {
    path: "/task",
    element: <Task />,
    children: [
      { path: "*", element: <Navigate to="/" /> },
    ],
  },
  { path: "*", element: <Navigate to="/" /> }
])