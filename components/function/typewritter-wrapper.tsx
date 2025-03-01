"use client";

import Link from "next/link";
import { TypewriterEffectSmooth } from "../ui/typewritter-effect";

export function TypewriterEffectSmoothDemo() {
  const words = [
    { text: "Upload" },
    { text: "Anonymize" },
    { text: "Reformat" },
    { text: "Optimize" },
    {
      text: "with AI.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[40rem]">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base">
        Transform your CV with AI-powered automation
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <Link href="/login">
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          Get Started
        </button>
        </Link>
        <Link href="/trial">
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black text-sm">
          Try Demo
        </button>
        </Link>
      </div>
    </div>
  );
}
