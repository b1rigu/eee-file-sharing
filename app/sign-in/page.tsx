"use client";

import { signInWithGoogleAction } from "@/actions/auth/signin";

export default function SignIn() {
  const signIn = async () => {
    await signInWithGoogleAction();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Sign In</h1>
      <button onClick={signIn}>Sign In with Google</button>
    </div>
  );
}
