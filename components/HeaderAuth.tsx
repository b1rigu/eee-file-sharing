import Link from "next/link";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import ProfileDropdown from "./ProfileDropdown";

export async function HeaderAuth() {
  const header = await headers();
  const session = await auth.api.getSession({
    headers: header,
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  return session.user ? (
    <div className="flex gap-4 items-center">
      <ProfileDropdown
        email={session.user.email}
        name={session.user.name}
        profileImage={session.user.image!}
      />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild aria-label="Нэвтрэх">
        <Link href="/sign-in">Нэвтрэх</Link>
      </Button>
    </div>
  );
}
