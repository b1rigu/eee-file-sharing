import { UpdatePassword } from "./UpdatePassword";
import { RotateRecoveryKey } from "./RotateRecoveryKey";
import { SecurityToggle } from "../my-files/SecurityToggle";
import { LockOnSettings } from "./LockOnSettings";

export default async function SettingsPage() {
  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security settings
          </p>
        </div>
        <SecurityToggle />
      </div>

      <div className="grid gap-8">
        <UpdatePassword />
        <RotateRecoveryKey />
      </div>
      <LockOnSettings />
    </div>
  );
}
