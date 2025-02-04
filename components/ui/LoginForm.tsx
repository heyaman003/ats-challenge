"use client"
// import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { ThemeToggle } from './theme-toggle';

export default function Formcomponent() {
  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
    <div className="w-full max-w-md space-y-8">
      <div className="flex flex-col items-center">

        <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
      </div>

      <form className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1"
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Sign in
        </Button>

        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80">
            Create one now
          </Link>
        </div>
      </form>
    </div>
  </div>
  )
}



