import { PrivateKeyProvider } from "@/components/private-key-context";
import { UserFilesProvider } from "@/components/user-files-context";
import { SecurityToggle } from "./SecurityToggle";
import { UserFiles } from "./UserFiles";
import { HeaderBadge } from "./HeaderBadge";
import { RefreshButton } from "./RefreshButton";
import { DirectoryBreadcrumbs } from "./DirectoryBreadcrumbs";
import { Suspense } from "react";
import { UploadFilesButton } from "./UploadFilesButton";

export default async function Dashboard() {
  return (
    <PrivateKeyProvider>
      <UserFilesProvider>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Storage Dashboard</h1>
            <HeaderBadge />
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Suspense fallback={null}>
              <DirectoryBreadcrumbs />
            </Suspense>
            <div className="flex items-center gap-4">
              <RefreshButton />
              <SecurityToggle />
              <UploadFilesButton />
            </div>
          </div>
          <UserFiles />
        </div>
      </UserFilesProvider>
    </PrivateKeyProvider>
  );
}
