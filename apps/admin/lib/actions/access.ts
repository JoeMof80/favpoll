"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";

export type AccessUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isAdmin: boolean;
  createdAt: string;
};

export async function getUsers(): Promise<{
  data: AccessUser[] | null;
  error: string | null;
}> {
  try {
    const client = await clerkClient();
    const { data } = await client.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    });

    const rows = data.map((u) => ({
      id: u.id,
      name:
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        "—",
      email:
        u.primaryEmailAddress?.emailAddress ??
        u.emailAddresses[0]?.emailAddress ??
        "—",
      imageUrl: u.imageUrl,
      isAdmin:
        (u.publicMetadata as { role?: string } | undefined)?.role === "admin",
      createdAt: new Date(u.createdAt).toISOString(),
    }));
    return { data: rows, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load users",
    };
  }
}

export async function setAdminRole(
  userId: string,
  makeAdmin: boolean,
): Promise<{ error: string | null }> {
  const { userId: me } = await auth();
  if (!me) return { error: "Not authenticated" };

  // Lockout guard: the last thing an admin should be able to do here is
  // strip their own access mid-session.
  if (!makeAdmin && userId === me) {
    return { error: "You can't remove your own admin access." };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: makeAdmin ? "admin" : null },
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update role",
    };
  }

  revalidatePath("/access");
  return { error: null };
}
