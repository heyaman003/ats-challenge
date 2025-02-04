"use client"
import Formcomponent from '@/components/ui/LoginForm';
import AnimatedResumeIllustration from "@/components/ui/Resume-illustration"
// import { ThemeToggle } from '@/components/ui/theme-toggle';


export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
        
      <div className="hidden lg:flex w-1/2 bg-gray-100 p-8">
        <div className="w-full flex flex-col items-center justify-center bg-gray-100 space-y-8">
          <AnimatedResumeIllustration />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Build Your Future</h2>
            <p className="text-gray-500">Create and manage your professional profile</p>
          </div>
        </div>
      </div>

     <Formcomponent/>
    </div>
  )
}

