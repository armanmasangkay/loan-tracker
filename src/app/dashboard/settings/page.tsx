import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import { ChangePasswordForm } from "@/components/users";
import { logout } from "@/lib/actions/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Account</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Display Name</p>
              <p className="text-base font-medium text-slate-900">
                {session?.user.displayName}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Username</p>
              <p className="text-base font-medium text-slate-900">
                @{session?.user.username}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Role</p>
              <p className="text-base font-medium text-slate-900 capitalize">
                {session?.user.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">
            Change Password
          </h2>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
