import { PrivateKeyProvider } from "@/components/private-key-context";
import { SecurityToggle } from "./SecurityToggle";
import { UserFiles } from "./UserFiles";
import { HeaderBadge } from "./HeaderBadge";
import { RefreshButton } from "./RefreshButton";
import { DirectoryBreadcrumbs } from "./DirectoryBreadcrumbs";
import { UploadFilesButton } from "./UploadFilesButton";
import { UserDataProvider } from "@/components/user-data-context";
import { DirectoryProvider } from "@/components/directory-provider";
import { NewFolderButton } from "./NewFolderButton";
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <PrivateKeyProvider>
      <Suspense fallback={null}>
        <DirectoryProvider>
          <UserDataProvider>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Storage Dashboard</h1>
                <HeaderBadge />
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <DirectoryBreadcrumbs />
                <div className="flex items-center gap-4">
                  <RefreshButton />
                  <SecurityToggle />
                  <NewFolderButton />
                  <UploadFilesButton />
                </div>
              </div>
              <UserFiles />
            </div>
          </UserDataProvider>
        </DirectoryProvider>
      </Suspense>
    </PrivateKeyProvider>
  );
}
