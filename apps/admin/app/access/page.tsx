import { auth } from "@clerk/nextjs/server";
import { getUsers } from "@/lib/actions/access";
import { AccessTable } from "@/components/access-table";

export default async function AccessPage() {
  const [{ data: users, error }, { userId }] = await Promise.all([
    getUsers(),
    auth(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who can sign in to this admin app. Admins can grant and revoke the
          role; you can&apos;t revoke your own.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <AccessTable users={users ?? []} currentUserId={userId} />
      )}
    </div>
  );
}
