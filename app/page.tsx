import Link from "next/link";

export default async function Home() {
  return (
    <div>
      <p>Home</p>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/sign-in">Sign In</Link>
    </div>
  );
}
