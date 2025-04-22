"use client";

import { signOutAction } from "@/actions/auth/signout";

export function SignOutButton() {
  async function signOut() {
    await signOutAction();
  }

  return (
    <button
      className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-300 dark:hover:bg-gray-800"
      onClick={signOut}
    >
      Sign Out
    </button>
  );
}
