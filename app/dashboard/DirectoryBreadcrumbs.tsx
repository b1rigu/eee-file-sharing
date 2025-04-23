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
import { usePrivateKey } from "@/components/private-key-context";
import { Fragment } from "react";
import { useDirectory } from "@/components/directory-provider";

export function DirectoryBreadcrumbs() {
  const { segments } = useDirectory();
  const { localPrivateKey } = usePrivateKey();

  let currentPath = "/";

  const shouldCollapse = segments.length > 4;

  const visibleSegments = shouldCollapse
    ? [segments[0], "...", ...segments.slice(-3)]
    : segments;

  const truncate = (str: string, maxLength = 12) =>
    str.length > maxLength ? str.slice(0, maxLength) + "…" : str;

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
          <BreadcrumbSeparator>/</BreadcrumbSeparator>

          {visibleSegments.map((segment, index) => {
            const isEllipsis = segment === "...";
            const isLast = index === visibleSegments.length - 1;

            if (isEllipsis) {
              return (
                <Fragment key="ellipsis">
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">...</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>/</BreadcrumbSeparator>
                </Fragment>
              );
            }

            // If we're collapsing, we need to map index back to original index
            const originalIndex = shouldCollapse
              ? index === 0
                ? 0
                : segments.length - (visibleSegments.length - index)
              : index;

            currentPath =
              "/" + segments.slice(0, originalIndex + 1).join("/") + "/";

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
                      {truncate(segment)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className={`${
                        !localPrivateKey &&
                        "text-muted-foreground pointer-events-none opacity-70"
                      }`}
                      asChild
                    >
                      <Link href={`?dir=${encodeURIComponent(currentPath)}`}>
                        {truncate(segment)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
