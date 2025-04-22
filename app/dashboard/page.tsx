import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignOutButton } from "./SignoutButton";
import { PrivateKeyProvider } from "@/components/private-key-context";
import { UserFilesProvider } from "@/components/user-files-context";
import { UppyUploader } from "./UppyUploader";
import { SecurityToggle } from "./SecurityToggle";
import { UserFiles } from "./UserFiles";

export default async function Dashboard() {
  const header = await headers();
  const session = await auth.api.getSession({
    headers: header,
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <PrivateKeyProvider>
      <UserFilesProvider>
        <div className="flex flex-col items-center gap-4 w-full md:w-xl p-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <h2 className="text-xl font-semibold">Welcome {session.user.name}</h2>
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-lg"
            />
          )}
          <SignOutButton />
          <SecurityToggle />
          <UppyUploader />
          <UserFiles />
        </div>
      </UserFilesProvider>
    </PrivateKeyProvider>
  );
}
