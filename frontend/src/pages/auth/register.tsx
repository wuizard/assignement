import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { registerService } from "@/services/auth"

import { toast } from "sonner"


const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string(),
}).refine((values) => values.password === values.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function Register() {
  const nav = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
    mode: "onTouched",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: RegisterValues) => {
      setServerError(null);
      return registerService({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.confirm,
      })
    },
    onSuccess: (data) => {
      toast(data.message)
      nav("/login");
    },
    onError: (e) => {
      const msg = e instanceof Error ? e.message : "There is problem with server connection"
      setServerError(msg)
    },
  });

  const onSubmit = (values: RegisterValues) => mutate(values);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Sign up to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Confirm */}
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" {...form.register("confirm")} />
              {form.formState.errors.confirm && (
                <p className="text-sm text-red-600">{form.formState.errors.confirm.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground">
          <span className="mr-1">Already have an account?</span>
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
