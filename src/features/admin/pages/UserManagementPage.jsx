import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Pencil, Trash2, UserPlus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { RolePermissionMatrix } from "../components/RolePermissionMatrix";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  StatCard,
  Tabs,
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { downloadCsv } from "@/common/lib/csv";
import { formatDate } from "@/common/lib/format";
import {
  useChangeUserRole,
  useChangeUserStatus,
  useDeleteUser,
  useProvisionUser,
  useUpdateUser,
  useUsers,
} from "../hooks";
import {
  ROLE_FILTERS,
  ROLE_OPTIONS,
  USER_STATUS_FILTERS,
  USER_STATUS_OPTIONS,
  USER_STATUS_TONE,
} from "../constants";
import { UserDetailModal } from "../components/UserDetailModal";

const PAGE_SIZE = 10;

export default function UserManagementPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [provisioning, setProvisioning] = useState(false);
  const [tab, setTab] = useState("users");

  const usersQuery = useUsers();
  const all = usersQuery.data ?? [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((u) => {
      if (role && u.roleCode !== role) return false;
      if (status && (u.status ?? "") !== status) return false;
      if (
        needle &&
        !`${u.fullName} ${u.email} ${u.userCode}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [all, q, role, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const activeCount = all.filter(
    (u) => (u.status ?? "").toUpperCase() === "ACTIVE",
  ).length;
  const refereeCount = all.filter((u) => u.roleCode === "RACE_REFEREE").length;

  function exportCsv() {
    if (filtered.length === 0) return toast.error("Nothing to export");
    downloadCsv(
      "users.csv",
      [
        { label: "Code", value: (u) => u.userCode },
        { label: "Name", value: (u) => u.fullName },
        { label: "Email", value: (u) => u.email },
        { label: "Role", value: (u) => u.roleName ?? u.roleCode },
        { label: "Status", value: (u) => u.status ?? "" },
        { label: "Created", value: (u) => u.createdAt ?? "" },
      ],
      filtered,
    );
    toast.success(
      `Exported ${filtered.length} user${filtered.length === 1 ? "" : "s"}`,
    );
  }

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Oversee roles, permissions, and system access for all personnel."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCsv}>
              <FileText size={16} /> Export CSV
            </Button>
            <Button onClick={() => setProvisioning(true)}>
              <UserPlus size={16} /> Provision User
            </Button>
          </div>
        }
      />

      <div className="mb-4">
        <Tabs
          tabs={[
            { key: "users", label: "Users" },
            { key: "permissions", label: "Roles & Permissions" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === "permissions" ? (
        <RolePermissionMatrix />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usersQuery.isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))
            ) : (
              <>
                <StatCard label="Total Users" value={all.length} />
                <StatCard
                  label="Active"
                  value={all.some((u) => u.status) ? activeCount : "—"}
                  hint={
                    all.some((u) => u.status) ? undefined : "status pending BE"
                  }
                />
                <StatCard label="Referees" value={refereeCount} />
                <StatCard
                  label="Active Sessions"
                  value="—"
                  hint="not tracked by BE"
                />
              </>
            )}
          </div>

          <div className="mt-4 mb-4 flex flex-wrap items-end gap-3">
            <div className="w-full flex-1 sm:min-w-56">
              <Input
                label="Search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                placeholder="Name, email, or ID…"
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label="Role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(0);
                }}
                options={ROLE_FILTERS}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                options={USER_STATUS_FILTERS}
              />
            </div>
          </div>

          <Card>
            <CardBody className="p-0">
              {usersQuery.isPending ? (
                <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : usersQuery.isError ? (
                <EmptyState
                  title="Couldn't load users"
                  description="Please reload the page."
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No users"
                  description="No users match the current filters."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Joined</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pageRows.map((u) => (
                        <tr
                          key={u.userId}
                          className="cursor-pointer hover:bg-subtle/40"
                          onClick={() => setViewing(u)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={u.fullName}
                                src={u.avatarUrl ?? undefined}
                                size={36}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink">
                                  {u.fullName}
                                </p>
                                <p className="truncate text-xs text-muted">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone="info">{u.roleName ?? u.roleCode}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {u.status ? (
                              <Badge
                                tone={
                                  USER_STATUS_TONE[u.status.toUpperCase()] ??
                                  "neutral"
                                }
                              >
                                {u.status}
                              </Badge>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted">
                            {u.createdAt ? formatDate(u.createdAt) : "—"}
                          </td>
                          <td
                            className="px-4 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditing(u)}
                              >
                                <Pencil size={15} />
                              </Button>
                              <DeleteButton
                                userId={u.userId}
                                name={u.fullName}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="text-sm text-muted">
                Page {page + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {viewing && (
        <UserDetailModal user={viewing} onClose={() => setViewing(null)} />
      )}
      {editing && (
        <EditUserModal user={editing} onClose={() => setEditing(null)} />
      )}
      {provisioning && <ProvisionModal onClose={() => setProvisioning(false)} />}
    </>
  );
}

function DeleteButton({ userId, name }) {
  const toast = useToast();
  const del = useDeleteUser();
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setConfirm(true)}>
        <Trash2 size={15} className="text-danger" />
      </Button>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete user"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirm(false)}
              disabled={del.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={() =>
                del.mutate(userId, {
                  onSuccess: () => {
                    toast.success("User deleted");
                    setConfirm(false);
                  },
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink">
          Delete <span className="font-medium">{name}</span>? This soft-deletes
          the account.
        </p>
      </Modal>
    </>
  );
}

function EditUserModal({ user, onClose }) {
  const toast = useToast();
  const update = useUpdateUser();
  const changeRole = useChangeUserRole();
  const changeStatus = useChangeUserStatus();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [role, setRole] = useState(user.roleCode);
  const [status, setStatus] = useState(user.status ?? "ACTIVE");
  const busy = update.isPending || changeRole.isPending || changeStatus.isPending;

  async function save() {
    try {
      await update.mutateAsync({ id: user.userId, fullName, phone });
      if (role !== user.roleCode)
        await changeRole.mutateAsync({ id: user.userId, roleCode: role });
      if (status !== (user.status ?? "ACTIVE"))
        await changeStatus.mutateAsync({ id: user.userId, status });
      toast.success("User updated");
      onClose();
    } catch {
      // The global MutationCache.onError toasts the BE error for the failing step.
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.fullName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button loading={busy} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={USER_STATUS_OPTIONS}
        />
        <p className="text-xs text-muted">
          Name &amp; phone save now. Role &amp; status changes require the
          backend admin endpoints (pending).
        </p>
      </div>
    </Modal>
  );
}

// Phone: optional (blank allowed), but if entered must match the BE VN
// @Pattern exactly.
const provisionSchema = z.object({
  fullName: z.string().trim().min(1, "Nhập họ tên"),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
  roleCode: z.string().min(1, "Chọn vai trò"),
  // Trim first (via preprocess) so a whitespace-only entry collapses to '' and counts as blank,
  // rather than failing both union branches.
  phone: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .regex(
        /^(0|\+84|84)[35789]\d{8}$/,
        "Số điện thoại không hợp lệ (VD: 0912345678)",
      )
      .or(z.literal("")),
  ),
});

function ProvisionModal({ onClose }) {
  const toast = useToast();
  const provision = useProvisionUser();

  // Admins cannot provision another ADMIN (BE rejects it too).
  const provisionableRoles = ROLE_OPTIONS.filter((r) => r.value !== "ADMIN");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(provisionSchema),
    defaultValues: {
      fullName: "",
      email: "",
      roleCode: "SPECTATOR",
      phone: "",
    },
  });

  function onValid(v) {
    provision.mutate(
      {
        fullName: v.fullName,
        email: v.email,
        roleCode: v.roleCode,
        phone: v.phone || undefined,
      },
      {
        onSuccess: () => {
          toast.success("User provisioned — a password was emailed to them");
          onClose();
        },
      },
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Provision User"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={provision.isPending}
          >
            Cancel
          </Button>
          <Button
            loading={provision.isPending}
            onClick={handleSubmit(onValid)}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Full name"
          {...register("fullName")}
          error={errors.fullName?.message}
        />
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Select
          label="Role"
          {...register("roleCode")}
          error={errors.roleCode?.message}
          options={provisionableRoles}
        />
        <Input
          label="Phone (optional)"
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="e.g. 0912345678"
        />
        <p className="text-xs text-muted">
          A secure password is generated and emailed to the user.
        </p>
      </div>
    </Modal>
  );
}
