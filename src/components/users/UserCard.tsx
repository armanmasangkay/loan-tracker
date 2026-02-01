"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Card, Button, Badge, Modal } from "@/components/ui";
import { resetUserPassword, toggleUserStatus } from "@/lib/actions/users";

interface UserCardProps {
  user: {
    id: number;
    username: string;
    displayName: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt: Date | null;
  };
}

export function UserCard({ user }: UserCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);

  const handleResetPassword = () => {
    startTransition(async () => {
      await resetUserPassword(user.id);
      setShowResetModal(false);
    });
  };

  const handleToggleStatus = () => {
    startTransition(async () => {
      await toggleUserStatus(user.id);
      setShowToggleModal(false);
    });
  };

  return (
    <>
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {user.displayName}
              </h3>
              <Badge variant={user.role === "admin" ? "info" : "default"}>
                {user.role}
              </Badge>
              {!user.isActive && (
                <Badge variant="danger">Disabled</Badge>
              )}
            </div>

            <p className="text-sm text-[var(--muted-foreground)] mt-1">@{user.username}</p>

            <div className="mt-2 text-xs text-[var(--muted-foreground)] space-y-0.5">
              <p>
                Created: {format(new Date(user.createdAt), "MMM d, yyyy")}
              </p>
              {user.lastLoginAt && (
                <p>
                  Last login:{" "}
                  {format(new Date(user.lastLoginAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetModal(true)}
              disabled={isPending}
            >
              Reset Password
            </Button>
            <Button
              variant={user.isActive ? "ghost" : "secondary"}
              size="sm"
              onClick={() => setShowToggleModal(true)}
              disabled={isPending}
            >
              {user.isActive ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Password"
      >
        <div className="space-y-4">
          <p className="text-[var(--secondary-foreground)]">
            Reset password for <strong>{user.displayName}</strong> to the default
            password &quot;password&quot;?
          </p>
          <p className="text-sm text-[var(--status-warning-text)]">
            This will also log out the user from all sessions.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowResetModal(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              isLoading={isPending}
              loadingText="Resetting..."
              className="flex-1"
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toggle Status Modal */}
      <Modal
        isOpen={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        title={user.isActive ? "Disable User" : "Enable User"}
      >
        <div className="space-y-4">
          <p className="text-[var(--secondary-foreground)]">
            {user.isActive ? (
              <>
                Disable <strong>{user.displayName}</strong>? They will not be
                able to log in.
              </>
            ) : (
              <>
                Enable <strong>{user.displayName}</strong>? They will be able to
                log in again.
              </>
            )}
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowToggleModal(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={user.isActive ? "danger" : "primary"}
              onClick={handleToggleStatus}
              isLoading={isPending}
              loadingText={user.isActive ? "Disabling..." : "Enabling..."}
              className="flex-1"
            >
              {user.isActive ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
