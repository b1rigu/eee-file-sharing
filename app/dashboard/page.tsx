import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignOutButton } from "./SignoutButton";
import { FileUpload } from "./FileUpload";
import { db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { SecurityToggle } from "./SecurityToggle";
import { fileAccess, uploadedFiles, userKeys } from "@/lib/drizzle/schema";
import { DecryptFile } from "./DecryptFile";
import { DeleteFileButton } from "./DeleteFileButton";

export default async function Dashboard() {
  const header = await headers();
  const session = await auth.api.getSession({
    headers: header,
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const userKey = await db.query.userKeys.findFirst({
    where: eq(userKeys.userId, session.user.id),
  });

  const userAvailableFiles = await db
    .select()
    .from(fileAccess)
    .where(eq(fileAccess.userId, session.user.id))
    .leftJoin(uploadedFiles, eq(fileAccess.fileId, uploadedFiles.id));

  return (
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
      <SecurityToggle userKey={userKey} />
      <div className="space-y-2 w-full">
        <h2>Uploaded Files</h2>
        {userAvailableFiles.map((availableFile) => (
          <div
            key={availableFile.file_access.id}
            className="p-2 bg-gray-200 dark:bg-gray-900"
          >
            <h3>{availableFile.uploaded_files?.fileName}</h3>
            <p>{availableFile.uploaded_files?.fileType}</p>
            <p>{availableFile.uploaded_files?.fileSize} bytes</p>
            <div className="flex items-center gap-2">
              <DecryptFile
                fileId={availableFile.file_access.fileId}
                fileName={availableFile.uploaded_files?.fileName!}
                encryptedFileKey={availableFile.file_access.encryptedFileKey}
                iv={availableFile.file_access.iv}
              />
              <DeleteFileButton fileId={availableFile.file_access.fileId} />
            </div>
          </div>
        ))}
      </div>
      <FileUpload />
      <SignOutButton />
    </div>
  );
}
