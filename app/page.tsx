import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p>End to End encrypted file storage</p>
      <Link
        href="/dashboard"
        className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-300 dark:hover:bg-gray-800"
      >
        Dashboard
      </Link>
    </div>
  );
}
