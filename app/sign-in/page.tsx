"use client";

import { signInWithGoogleAction } from "@/actions/auth/signin";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const signIn = async () => {
    await signInWithGoogleAction();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">Sign In</h1>
      <Button onClick={signIn}>Sign In with Google</Button>
    </div>
  );
}
