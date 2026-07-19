import { useEffect, useState } from "react";
import { Info, Save } from "lucide-react";
import { Button, Card, CardBody, EmptyState, Skeleton } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { usePermissions, useRoles, useUpdateRolePermissions } from "../hooks";

/**
 * Role × permission grid.
 *
 * Honest scoping note rendered in the UI: the backend enforces access with
 * `@PreAuthorize("hasRole('X')")` against the JWT role claim and never checks
 * individual permission codes, so editing this grid changes what the app
 * advertises — not what the server lets through. Saying so on screen is better
 * than letting a reviewer assume unticking a box revokes access.
 */
export function RolePermissionMatrix() {
  const rolesQuery = useRoles();
  const permsQuery = usePermissions();
  const update = useUpdateRolePermissions();
  const toast = useToast();

  // roleId -> Set(permission codes), seeded from the server then edited locally
  // until saved
  const [draft, setDraft] = useState({});
  const [dirty, setDirty] = useState({});

  useEffect(() => {
    if (!rolesQuery.data) return;
    const next = {};
    rolesQuery.data.forEach((r) => {
      next[r.roleId] = [...r.permissionCodes];
    });
    setDraft(next);
    setDirty({});
  }, [rolesQuery.data]);

  if (rolesQuery.isPending || permsQuery.isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (rolesQuery.isError || permsQuery.isError) {
    return (
      <EmptyState
        title="Couldn't load the permission matrix"
        description="Please try again."
      />
    );
  }

  const roles = rolesQuery.data ?? [];
  const perms = permsQuery.data ?? [];

  const toggle = (roleId, code) => {
    setDraft((d) => {
      const cur = new Set(d[roleId] ?? []);
      if (cur.has(code)) cur.delete(code);
      else cur.add(code);
      return { ...d, [roleId]: [...cur] };
    });
    setDirty((x) => ({ ...x, [roleId]: true }));
  };

  const save = (roleId, roleCode) => {
    update.mutate(
      { roleId, permissionCodes: draft[roleId] ?? [] },
      {
        onSuccess: () => {
          toast.success(`Permissions updated for ${roleCode}.`);
          setDirty((x) => ({ ...x, [roleId]: false }));
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-info/40">
        <CardBody className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">
              Ma trận hiển thị quyền.
            </span>{" "}
            Hệ thống hiện cưỡng chế truy cập theo <em>vai trò</em> (JWT role
            claim), chưa theo từng mã quyền — nên thay đổi ở đây cập nhật ma
            trận và những gì giao diện hiển thị, nhưng chưa trực tiếp cấp hay
            thu hồi quyền ở phía server.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="sticky left-0 bg-surface px-4 py-3">
                    Permission
                  </th>
                  {roles.map((r) => (
                    <th key={r.roleId} className="px-3 py-3 text-center">
                      <div>{r.roleCode}</div>
                      <div className="font-normal normal-case text-muted">
                        {r.userCount} users
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr
                    key={p.permissionId}
                    className="border-b border-border last:border-0"
                  >
                    <td className="sticky left-0 bg-surface px-4 py-2">
                      <p className="font-medium text-ink">{p.code}</p>
                      {p.description && (
                        <p className="text-xs text-muted">{p.description}</p>
                      )}
                    </td>
                    {roles.map((r) => (
                      <td key={r.roleId} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${p.code} for ${r.roleCode}`}
                          checked={(draft[r.roleId] ?? []).includes(p.code)}
                          onChange={() => toggle(r.roleId, p.code)}
                          className="h-4 w-4 accent-brand-700"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="sticky left-0 bg-surface px-4 py-3" />
                  {roles.map((r) => (
                    <td key={r.roleId} className="px-3 py-3 text-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Save size={14} />}
                        disabled={!dirty[r.roleId]}
                        loading={update.isPending}
                        onClick={() => save(r.roleId, r.roleCode)}
                      >
                        Save
                      </Button>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
