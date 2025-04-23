"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { usePrivateKey } from "@/components/private-key-context";
import { Fragment } from "react";

export function DirectoryBreadcrumbs() {
  const searchParams = useSearchParams();
  const dir = searchParams.get("dir") ?? "/";
  const segments = dir.split("/").filter(Boolean);
  const { localPrivateKey } = usePrivateKey();

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className={`${
                !localPrivateKey &&
                "text-muted-foreground pointer-events-none opacity-70"
              }`}
              asChild
            >
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          {segments.map((segment, index) => {
            let path = "/";
            path += segment + "/";
            const isLast = index === segments.length - 1;

            return (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage
                      className={`font-semibold ${
                        !localPrivateKey &&
                        "text-muted-foreground pointer-events-none opacity-70"
                      }`}
                    >
                      {segment}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className={`${
                        !localPrivateKey &&
                        "text-muted-foreground pointer-events-none opacity-70"
                      }`}
                      asChild
                    >
                      <Link href={`?dir=${encodeURIComponent(path)}`}>
                        {segment}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
