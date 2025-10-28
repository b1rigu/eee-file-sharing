import { HeaderBadge } from "../my-files/HeaderBadge";
import { SecurityToggle } from "../my-files/SecurityToggle";
import { SharedFilesProvider } from "@/components/shared-data-context";
import { SharedFiles } from "./SharedFiles";
import { SharedFilesRefreshButton } from "./SharedFilesRefreshButton";

export default async function SharedFilesPage() {
  return (
    <SharedFilesProvider>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <h1 className="text-2xl lg:text-3xl font-bold">Shared Files</h1>
          <HeaderBadge />
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="flex gap-2">
            <SharedFilesRefreshButton />
            <SecurityToggle />
          </div>
        </div>
        <SharedFiles />
      </div>
    </SharedFilesProvider>
  );
}
