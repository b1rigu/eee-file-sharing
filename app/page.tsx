import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p>End to End encrypted file storage</p>
      <div className="flex gap-2 items-center">
        <Button asChild>
          <Link href="/my-files">My Files</Link>
        </Button>
        <Button variant={"outline"} asChild>
          <Link href="/shared-files">Shared Files</Link>
        </Button>
      </div>
    </div>
  );
}
