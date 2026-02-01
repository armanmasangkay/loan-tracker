import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsers } from "@/lib/actions/users";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { UserCard, UserForm } from "@/components/users";

export default async function UsersPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="flex flex-col gap-10">
      {/* Create User Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Create New User
          </h2>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>

      {/* Users List */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          All Users ({users.length})
        </h2>

        {users.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)] py-8">No users found</p>
        ) : (
          <div className="flex flex-col gap-4">
            {users.map((user) => (
              <div key={user.id}>
                <UserCard user={user} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
