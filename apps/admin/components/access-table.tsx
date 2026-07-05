"use client";

import { useState, useTransition } from "react";
import type { AccessUser } from "@/lib/actions/access";
import { setAdminRole } from "@/lib/actions/access";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function UserRow({ user, isSelf }: { user: AccessUser; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(makeAdmin: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setAdminRole(user.id, makeAdmin);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmRevoke(false);
      }
    });
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          <span className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.imageUrl}
              alt=""
              className="size-6 shrink-0 rounded-full"
            />
            {user.name}
            {isSelf && (
              <span className="text-xs text-muted-foreground">(you)</span>
            )}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground">{user.email}</TableCell>
        <TableCell className="text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString("en-GB")}
        </TableCell>
        <TableCell>
          {user.isAdmin ? (
            <StatusBadge tone="info">Admin</StatusBadge>
          ) : (
            <StatusBadge tone="neutral">User</StatusBadge>
          )}
        </TableCell>
        <TableCell className="text-right">
          {user.isAdmin ? (
            isSelf ? null : confirmRevoke ? (
              <span className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="xs"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => update(false)}
                >
                  {isPending ? "…" : "Confirm revoke"}
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => setConfirmRevoke(false)}
                >
                  Cancel
                </Button>
              </span>
            ) : (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={isPending}
                onClick={() => setConfirmRevoke(true)}
              >
                Revoke admin
              </Button>
            )
          ) : (
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={isPending}
              onClick={() => update(true)}
            >
              {isPending ? "…" : "Grant admin"}
            </Button>
          )}
        </TableCell>
      </TableRow>
      {error && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="bg-muted/30 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function AccessTable({
  users,
  currentUserId,
}: {
  users: AccessUser[];
  currentUserId: string | null;
}) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users found.</p>;
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
