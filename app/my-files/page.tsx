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
import { SelectedRowsProvider } from "@/components/selected-rows-provider";
import { DeleteSelectedButton } from "./DeleteSelectedButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DragAndDropProvider } from "@/components/drag-and-drop-provider";

export default async function MyFilesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <Suspense fallback={null}>
      <DirectoryProvider>
        <UserDataProvider>
          <SelectedRowsProvider>
            <DragAndDropProvider>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <h1 className="text-2xl lg:text-3xl font-bold">My Files</h1>
                  <HeaderBadge />
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
                  <DirectoryBreadcrumbs />
                  <div className="flex flex-row gap-2 shrink-0">
                    <RefreshButton />
                    <SecurityToggle />
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 w-full justify-center lg:justify-end">
                  <DeleteSelectedButton />
                  <NewFolderButton />
                  <UploadFilesButton />
                </div>
                <UserFiles />
              </div>
            </DragAndDropProvider>
          </SelectedRowsProvider>
        </UserDataProvider>
      </DirectoryProvider>
    </Suspense>
  );
}
