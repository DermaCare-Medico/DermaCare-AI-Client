"use client";

import { useMemo, useState } from "react";
import { Eye, Search, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "../_components/AdminPreviewUI";
import { useGetAdminAuditLogsQuery } from "@/redux/api/adminApi";

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [result, setResult] = useState("ALL");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminAuditLogsQuery();

  const rawLogs = data?.data ?? data;
  const auditLogsList: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(rawLogs)) {
      return rawLogs.filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null);
    }
    if (rawLogs && typeof rawLogs === "object") {
      const logsProp = (rawLogs as Record<string, unknown>).logs;
      if (Array.isArray(logsProp)) {
        return logsProp.filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null);
      }
      const itemsProp = (rawLogs as Record<string, unknown>).items;
      if (Array.isArray(itemsProp)) {
        return itemsProp.filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null);
      }
    }
    return [];
  }, [rawLogs]);

  const logs = useMemo(() => {
    return auditLogsList.filter((log) => {
      const userObj = (typeof log.user === "object" && log.user !== null ? log.user : {}) as Record<string, unknown>;
      const user = String(userObj.name ?? log.userName ?? log.user ?? "System");
      const action = String(log.action ?? "");
      const resource = String(log.resource ?? "");
      const logRole = String(log.role ?? userObj.role ?? "ADMIN");
      const logResult = String(log.result ?? log.status ?? "SUCCESS");

      const term = search.toLowerCase();
      const matchesSearch = `${user} ${action} ${resource}`.toLowerCase().includes(term);
      const matchesRole = role === "ALL" || logRole === role;
      const matchesResult = result === "ALL" || logResult === result;

      return matchesSearch && matchesRole && matchesResult;
    });
  }, [auditLogsList, search, role, result]);

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Governance"
        title="Audit logs"
        description="Review security and administrative activity across the platform."
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load audit logs from backend.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="relative">
            <span className="sr-only">Search audit logs</span>
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, action, or resource"
            />
          </label>
          <label>
            <span className="sr-only">Filter by role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All roles</option>
              {["ADMIN", "DOCTOR", "PATIENT", "SYSTEM"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by result</span>
            <select
              value={result}
              onChange={(event) => setResult(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All results</option>
              {["SUCCESS", "DENIED", "FAILED"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#0F888D]" />
            Loading system audit logs...
          </div>
        </div>
      ) : logs.length === 0 ? (
        <AdminEmptyState title="No audit logs found" description="No platform log entries match your filter." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => {
                const id = String(log.id ?? log._id ?? `log-${index}`);
                const userObj = (typeof log.user === "object" && log.user !== null ? log.user : {}) as Record<string, unknown>;
                const user = String(userObj.name ?? log.userName ?? log.user ?? "System");
                const logRole = String(log.role ?? userObj.role ?? "ADMIN");
                const action = String(log.action ?? "OPERATION");
                const resource = String(log.resource ?? log.entity ?? "System");
                const timestamp = log.createdAt
                  ? new Date(String(log.createdAt)).toLocaleString()
                  : String(log.timestamp ?? "Recent");
                const logResult = String(log.result ?? log.status ?? "SUCCESS");

                return (
                  <TableRow key={id}>
                    <TableCell>
                      <p className="font-semibold text-[#163A5F]">{user}</p>
                      <p className="text-xs text-slate-500">{logRole}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{action.replaceAll("_", " ")}</TableCell>
                    <TableCell>{resource}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{timestamp}</TableCell>
                    <TableCell>
                      <StatusBadge value={logResult} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(log)}
                        aria-label={`View details for ${id}`}
                      >
                        <Eye className="size-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Details Dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Audit Event Details</DialogTitle>
            <DialogDescription>Full record details for administrative governance.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">Event Reference</p>
                  <p className="font-semibold text-[#163A5F]">
                    {String(selected.id ?? selected._id ?? "EVT-LOG")}
                  </p>
                </div>
                <StatusBadge value={String(selected.result ?? selected.status ?? "SUCCESS")} />
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Actor</dt>
                  <dd className="font-medium">
                    {String(
                      ((typeof selected.user === "object" && selected.user !== null)
                        ? (selected.user as Record<string, unknown>).name
                        : "") ??
                      selected.userName ??
                      selected.user ??
                      "System"
                    )}{" "}
                    (
                    {String(
                      selected.role ??
                      ((typeof selected.user === "object" && selected.user !== null)
                        ? (selected.user as Record<string, unknown>).role
                        : "") ??
                      "ADMIN"
                    )}
                    )
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Timestamp</dt>
                  <dd>
                    {selected.createdAt
                      ? new Date(String(selected.createdAt)).toLocaleString()
                      : String(selected.timestamp ?? "Recent")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Action</dt>
                  <dd>{String(selected.action ?? "").replaceAll("_", " ")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Resource</dt>
                  <dd>{String(selected.resource ?? selected.entity ?? "System")}</dd>
                </div>
                {Boolean(selected.details) && (
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Details</dt>
                    <dd className="rounded bg-slate-100 p-2 font-mono text-xs">
                      {typeof selected.details === "object"
                        ? JSON.stringify(selected.details, null, 2)
                        : String(selected.details)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
