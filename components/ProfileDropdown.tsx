"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { signOutAction } from "@/actions/auth/signout";

export default function ProfileDropdown({
  email,
  name,
  profileImage,
}: {
  email: string;
  name: string;
  profileImage?: string;
}) {
  async function handleSignOut() {
    toast.info("Signing out...");
    await signOutAction();
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Avatar aria-label="Миний мэдээлэл">
          <AvatarImage src={profileImage ?? undefined} alt="avatar" />
          <AvatarFallback>{email.substring(0, 1)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuLabel>
          <div className="max-w-[10rem]">
            <p className="font-bold text-lg">{name}</p>
            <p className="text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
