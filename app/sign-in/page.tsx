"use client";

import { signInWithGoogleAction } from "@/actions/auth/signin";

export default function SignIn() {
  const signIn = async () => {
    await signInWithGoogleAction();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">Sign In</h1>
      <button
        className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-300 dark:hover:bg-gray-800"
        onClick={signIn}
      >
        Sign In with Google
      </button>
    </div>
  );
}
