import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignOutButton } from "./SignoutButton";
import { FileUpload } from "./FileUpload";
import { SecurityToggle } from "./SecurityToggle";
import { UserFiles } from "./UserFiles";
import { PrivateKeyProvider } from "@/components/private-key-context";
import { db } from "@/lib/drizzle";
import { count, eq } from "drizzle-orm";
import { fileAccess } from "@/lib/drizzle/schema";
import { Suspense } from "react";

export default async function Dashboard() {
  const header = await headers();
  const session = await auth.api.getSession({
    headers: header,
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const userAvailableFilesCount = await db
    .select({ count: count() })
    .from(fileAccess)
    .where(eq(fileAccess.userId, session.user.id));

  return (
    <PrivateKeyProvider>
      <div className="flex flex-col items-center gap-4">
        <h1>Dashboard</h1>
        <h2>Welcome {session.user.name}</h2>
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-lg"
          />
        )}
        <SecurityToggle />
        <div className="space-y-2 w-full">
          <h2>Uploaded Files</h2>
          <Suspense key={userAvailableFilesCount[0].count}>
            <UserFiles />
          </Suspense>
        </div>
        <FileUpload />
        <SignOutButton />
      </div>
    </PrivateKeyProvider>
  );
}
