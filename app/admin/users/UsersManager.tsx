"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, UserPlus } from "lucide-react";
import { Badge, Card } from "../ui";
import { fieldStyles } from "../formUi";
import { toaster } from "@/components/ui/toaster";
import {
  cancelInviteAction,
  changeUserRoleAction,
  idleInviteState,
  inviteUserAction,
  setUserActiveAction,
  type InviteState,
} from "../userActions";

type UserRow = { id: string; email: string; name: string; role: string; isActive: boolean };
type InviteRow = { id: string; email: string; role: string; expiresAt: string };

export function UsersManager({
  currentUserId,
  users,
  invites,
}: {
  currentUserId: string;
  users: UserRow[];
  invites: InviteRow[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<InviteState, FormData>(inviteUserAction, idleInviteState);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Turn the returned invite path into a full link and copy it.
  const inviteLink =
    state.status === "ok" ? `${typeof window !== "undefined" ? window.location.origin : ""}${state.path}` : "";

  async function run(fn: () => Promise<void>, id: string, ok: string) {
    setBusyId(id);
    try {
      await fn();
      toaster.create({ type: "success", title: ok });
      router.refresh();
    } catch (e) {
      toaster.create({
        type: "error",
        title: "Action failed",
        description: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap="24px" maxW="820px">
      {/* Invite form */}
      <Card p="20px">
        <Text fontSize="15px" fontWeight="700" color="var(--color-headline)" mb="4px">
          Invite someone
        </Text>
        <Text fontSize="13px" color="var(--color-muted)" mb="16px">
          They get a link to set their own password. Only you (the owner) can invite.
        </Text>

        <form action={formAction}>
          <Flex gap="12px" flexWrap="wrap" align="flex-end">
            <Box flex="1" minW="220px">
              <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="5px">Email</Text>
              <chakra.input name="email" type="email" required placeholder="person@example.com" {...fieldStyles.input} />
            </Box>
            <Box minW="150px">
              <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="5px">Role</Text>
              <chakra.select name="role" defaultValue="EDITOR" {...fieldStyles.select}>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </chakra.select>
            </Box>
            <InviteButton />
          </Flex>
        </form>

        {state.status === "error" && (
          <Text fontSize="13px" color="var(--color-danger-fg)" mt="12px">{state.message}</Text>
        )}

        {state.status === "ok" && (
          <Box mt="14px" p="12px" bg="var(--color-success-bg)" borderRadius="6px">
            <Text fontSize="13px" fontWeight="600" color="var(--color-success-fg)" mb="6px">
              Invite ready for {state.email} — send them this link:
            </Text>
            <Flex gap="8px" align="center">
              <chakra.input value={inviteLink} readOnly flex="1" {...fieldStyles.input} h="34px" fontSize="12px" />
              <chakra.button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(inviteLink);
                  toaster.create({ type: "success", title: "Link copied" });
                }}
                display="inline-flex"
                alignItems="center"
                gap="6px"
                h="34px"
                px="12px"
                bg="var(--color-brand)"
                color="white"
                border="none"
                borderRadius="6px"
                fontSize="13px"
                fontWeight="600"
                cursor="pointer"
              >
                <Copy size={14} /> Copy
              </chakra.button>
            </Flex>
            <Text fontSize="11px" color="var(--color-muted)" mt="6px">
              The link works once and expires in 7 days.
            </Text>
          </Box>
        )}
      </Card>

      {/* Pending invites */}
      {invites.length > 0 && (
        <Card p="20px">
          <Text fontSize="15px" fontWeight="700" color="var(--color-headline)" mb="12px">
            Pending invites
          </Text>
          <Flex direction="column" gap="8px">
            {invites.map((inv) => (
              <Flex key={inv.id} align="center" justify="space-between" py="8px" borderBottom="1px solid var(--color-border)">
                <Box minW="0">
                  <Text fontSize="14px" color="var(--color-body)" truncate>{inv.email}</Text>
                  <Text fontSize="12px" color="var(--color-muted)">{inv.role.toLowerCase()}</Text>
                </Box>
                <chakra.button
                  type="button"
                  disabled={busyId === inv.id}
                  onClick={() => run(() => cancelInviteAction(inv.id), inv.id, "Invite cancelled")}
                  fontSize="13px"
                  color="var(--color-danger-fg)"
                  bg="transparent"
                  border="none"
                  cursor="pointer"
                >
                  Cancel
                </chakra.button>
              </Flex>
            ))}
          </Flex>
        </Card>
      )}

      {/* Users */}
      <Card p="20px">
        <Text fontSize="15px" fontWeight="700" color="var(--color-headline)" mb="12px">
          People
        </Text>
        <Flex direction="column" gap="4px">
          {users.map((u) => {
            const isOwner = u.role === "OWNER";
            const isSelf = u.id === currentUserId;
            return (
              <Flex key={u.id} align="center" justify="space-between" gap="12px" py="10px" borderBottom="1px solid var(--color-border)">
                <Box minW="0" flex="1">
                  <Flex align="center" gap="8px">
                    <Text fontSize="14px" fontWeight="600" color="var(--color-headline)" truncate>{u.name}</Text>
                    {!u.isActive && <Badge tone="neutral">inactive</Badge>}
                    {isSelf && <Badge tone="info">you</Badge>}
                  </Flex>
                  <Text fontSize="12px" color="var(--color-muted)" truncate>{u.email}</Text>
                </Box>

                {/* Role: owner is fixed; others editable */}
                {isOwner ? (
                  <Badge tone="success">owner</Badge>
                ) : (
                  <chakra.select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => run(() => changeUserRoleAction(u.id, e.target.value), u.id, "Role updated")}
                    {...fieldStyles.select}
                    w="130px"
                    h="34px"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                  </chakra.select>
                )}

                {/* Active toggle: never for owner or self */}
                {!isOwner && !isSelf && (
                  <chakra.button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() =>
                      run(
                        () => setUserActiveAction(u.id, !u.isActive),
                        u.id,
                        u.isActive ? "User deactivated" : "User reactivated",
                      )
                    }
                    fontSize="13px"
                    fontWeight="500"
                    color={u.isActive ? "var(--color-danger-fg)" : "var(--color-brand)"}
                    bg="transparent"
                    border="none"
                    cursor="pointer"
                    whiteSpace="nowrap"
                  >
                    {u.isActive ? "Deactivate" : "Reactivate"}
                  </chakra.button>
                )}
              </Flex>
            );
          })}
        </Flex>
      </Card>
    </Box>
  );
}

function InviteButton() {
  return (
    <chakra.button
      type="submit"
      display="inline-flex"
      alignItems="center"
      gap="7px"
      h="40px"
      px="18px"
      bg="var(--color-brand)"
      color="white"
      border="none"
      borderRadius="6px"
      fontSize="14px"
      fontWeight="700"
      cursor="pointer"
    >
      <UserPlus size={16} /> Send invite
    </chakra.button>
  );
}
