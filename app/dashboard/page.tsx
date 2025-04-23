import { PrivateKeyProvider } from "@/components/private-key-context";
import { UserFilesProvider } from "@/components/user-files-context";
import { UppyUploader } from "./UppyUploader";
import { SecurityToggle } from "./SecurityToggle";
import { UserFiles } from "./UserFiles";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Slash } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import React from "react";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const dir = (await searchParams).dir || "";

  const segments = dir.split("/").filter(Boolean);

  let path = "/";

  return (
    <PrivateKeyProvider>
      <UserFilesProvider>
        <div className="flex flex-col gap-4 w-full">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`?dir=${encodeURIComponent(path)}`}>Root</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>

                {segments.map((segment, index) => {
                  path += segment + "/";
                  const isLast = index === segments.length - 1;

                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{segment}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={`?dir=${encodeURIComponent(path)}`}>
                            {segment}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>
                        <Slash />
                      </BreadcrumbSeparator>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <RefreshButton />
              <SecurityToggle />
            </div>
          </div>
          {/* <UppyUploader /> */}
          <UserFiles />
        </div>
      </UserFilesProvider>
    </PrivateKeyProvider>
  );
}
