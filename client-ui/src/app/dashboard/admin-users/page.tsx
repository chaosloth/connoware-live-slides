"use client";

import React, { FC, useEffect, useState, useCallback } from "react";
import {
  PageHeader,
  PageHeaderSetting,
  PageHeaderDetails,
  PageHeaderHeading,
  PageHeaderParagraph,
  PageHeaderActions,
} from "@twilio-paste/core/page-header";
import { Breadcrumb, BreadcrumbItem } from "@twilio-paste/core/breadcrumb";
import { Button } from "@twilio-paste/core/button";
import { Stack } from "@twilio-paste/core/stack";
import {
  Box,
  Modal,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  FormControl,
  Input,
  Label,
  HelpText,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  Text,
} from "@twilio-paste/core";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { useAuth } from "@/app/context/Auth";
import { ErrorMessage } from "@/components/ErrorBoundary";

interface AuthorizedUser {
  phoneNumber: string;
}

const AdminUsersPage: FC = () => {
  const { token, phoneNumber: currentUserPhone } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err : new Error("Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!token || !newPhoneNumber.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPhoneNumber: newPhoneNumber.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add user");
      }

      setAddModalOpen(false);
      setNewPhoneNumber("");
      await fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
      setError(err instanceof Error ? err : new Error("Failed to add user"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = async (phoneNumber: string) => {
    if (!token) return;

    const isCurrentUser = phoneNumber === currentUserPhone;
    const confirmMessage = isCurrentUser
      ? `Are you sure you want to remove your own access (${phoneNumber})? You will be logged out.`
      : `Are you sure you want to remove access for ${phoneNumber}?`;

    if (!confirm(confirmMessage)) return;

    setError(null);

    try {
      const response = await fetch("/api/auth/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ removePhoneNumber: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove user");
      }

      if (isCurrentUser) {
        // Log out the current user
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_phone");
        router.push("/login");
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Error removing user:", err);
      setError(err instanceof Error ? err : new Error("Failed to remove user"));
    }
  };

  return (
    <>
      <PageHeader size="default">
        <PageHeaderSetting>
          <Breadcrumb>
            <BreadcrumbItem
              href="/"
              onClick={(e) => {
                e.preventDefault();
                router.push("/");
              }}
            >
              LiveSlides
            </BreadcrumbItem>
            <BreadcrumbItem
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                router.push("/dashboard");
              }}
            >
              Dashboard
            </BreadcrumbItem>
            <BreadcrumbItem>Admin Users</BreadcrumbItem>
          </Breadcrumb>
        </PageHeaderSetting>

        <PageHeaderDetails>
          <PageHeaderHeading>Authorized Users</PageHeaderHeading>
          <PageHeaderActions>
            <Button variant="primary" onClick={() => setAddModalOpen(true)} disabled={loading}>
              <PlusIcon decorative />
              Add User
            </Button>
          </PageHeaderActions>
          <PageHeaderParagraph>
            Manage phone numbers authorized to access the admin dashboard
          </PageHeaderParagraph>
        </PageHeaderDetails>
      </PageHeader>

      <Stack orientation="vertical" spacing="space40">
        {error && <ErrorMessage error={error} onRetry={fetchUsers} />}

        {loading ? (
          <Box padding="space60">
            <Text as="p" color="colorTextWeak">
              Loading users...
            </Text>
          </Box>
        ) : (
          <Box>
            <Table>
              <THead>
                <Tr>
                  <Th>Phone Number</Th>
                  <Th width="100px" textAlign="right">
                    Actions
                  </Th>
                </Tr>
              </THead>
              <TBody>
                {users.map((user) => {
                  const isCurrentUser = user.phoneNumber === currentUserPhone;
                  return (
                    <Tr key={user.phoneNumber}>
                      <Td>
                        <Box display="flex" alignItems="center" columnGap="space30">
                          <Text as="span">{user.phoneNumber}</Text>
                          {isCurrentUser && (
                            <Text as="span" color="colorTextWeak" fontSize="fontSize30">
                              (You)
                            </Text>
                          )}
                        </Box>
                      </Td>
                      <Td textAlign="right">
                        <Button
                          variant="destructive_secondary"
                          size="icon_small"
                          onClick={() => handleRemoveUser(user.phoneNumber)}
                          title="Remove user"
                        >
                          <DeleteIcon decorative={false} title="Remove user" />
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>

            {users.length === 0 && (
              <Box padding="space60" textAlign="center">
                <Text as="p" color="colorTextWeak">
                  No authorized users found
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Stack>

      <Modal
        ariaLabelledby="add-user-modal"
        isOpen={isAddModalOpen}
        onDismiss={() => setAddModalOpen(false)}
        size="default"
      >
        <ModalHeader>
          <ModalHeading as="h3" id="add-user-modal">
            Add Authorized User
          </ModalHeading>
        </ModalHeader>
        <ModalBody>
          <FormControl>
            <Label htmlFor="new-phone-number">Phone Number</Label>
            <Input
              id="new-phone-number"
              type="tel"
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              disabled={isAdding}
            />
            <HelpText>Enter phone number in E.164 format (e.g., +1234567890)</HelpText>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
              disabled={!newPhoneNumber.trim() || isAdding}
              loading={isAdding}
            >
              Add User
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AdminUsersPage;
