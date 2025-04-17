"use client";

import { signOutAction } from "@/actions/auth/signout";

export function SignOutButton() {
  async function signOut() {
    localStorage.removeItem("privateKey");
    await signOutAction();
  }

  return <button onClick={signOut}>Sign Out</button>;
}
