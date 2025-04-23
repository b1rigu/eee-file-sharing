import { PrivateKeyProvider } from "@/components/private-key-context";
import { UserFilesProvider } from "@/components/user-files-context";
import { UppyUploader } from "./UppyUploader";
import { SecurityToggle } from "./SecurityToggle";
import { UserFiles } from "./UserFiles";

export default async function Dashboard() {
  return (
    <PrivateKeyProvider>
      <UserFilesProvider>
        <div className="flex flex-col items-center gap-4 w-full md:w-xl p-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <SecurityToggle />
          <UppyUploader />
          <UserFiles />
        </div>
      </UserFilesProvider>
    </PrivateKeyProvider>
  );
}
