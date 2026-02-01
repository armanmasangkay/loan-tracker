import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import { ChangePasswordForm } from "@/components/users";
import { logout } from "@/lib/actions/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* User Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Account</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Display Name</p>
              <p className="text-base font-medium text-[var(--foreground)]">
                {session?.user.displayName}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Username</p>
              <p className="text-base font-medium text-[var(--foreground)]">
                @{session?.user.username}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Role</p>
              <p className="text-base font-medium text-[var(--foreground)] capitalize">
                {session?.user.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Change Password
          </h2>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="py-6">
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
