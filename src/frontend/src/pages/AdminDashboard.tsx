import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { LicenseType, Status } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  formatDate,
  formatRefNumber,
  useGetAllApplications,
  useGetStatistics,
  useIsCallerAdmin,
} from "../hooks/useQueries";

const NAVY = "oklch(0.25 0.10 255)";

const STATUS_BADGE: Record<Status, string> = {
  [Status.pending]: "bg-yellow-100 text-yellow-800 border-yellow-300",
  [Status.approved]: "bg-green-100 text-green-800 border-green-300",
  [Status.rejected]: "bg-red-100 text-red-800 border-red-300",
};

function AdminLoginCard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);

  const isLoggingIn = loginStatus === "logging-in";
  const isBusy = isLoggingIn || verifying || pendingPassword !== null;

  // When identity and actor are both updated after II login, verify the pending password
  useEffect(() => {
    if (!identity || pendingPassword === null || !actor) return;
    if (identity.getPrincipal().isAnonymous()) return;

    const pwd = pendingPassword;
    setPendingPassword(null);
    setVerifying(true);
    setError("");

    actor
      .setupAdminWithPassword(pwd)
      .then((ok) => {
        if (ok) {
          queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
        } else {
          setError("Incorrect admin password. Please try again.");
        }
      })
      .catch((e: any) => {
        setError(e?.message ?? "An error occurred. Please try again.");
      })
      .finally(() => setVerifying(false));
  }, [identity, actor, pendingPassword, queryClient]);

  const handleSubmit = () => {
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }
    setError("");

    if (identity && !identity.getPrincipal().isAnonymous()) {
      // Already authenticated — verify password directly
      if (!actor) return;
      setVerifying(true);
      actor
        .setupAdminWithPassword(password)
        .then((ok) => {
          if (ok) {
            queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
          } else {
            setError("Incorrect admin password. Please try again.");
          }
        })
        .catch((e: any) => setError(e?.message ?? "An error occurred."))
        .finally(() => setVerifying(false));
    } else {
      // Need II login first — store password and trigger login
      setPendingPassword(password);
      login();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "oklch(0.97 0.02 250)" }}
    >
      <div
        className="w-full px-6 py-4 flex items-center gap-3"
        style={{ backgroundColor: NAVY }}
      >
        <Shield className="h-5 w-5 text-white" />
        <span className="text-white font-semibold tracking-wide text-sm">
          AEIA Admin Portal
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-4">
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "oklch(0.88 0.06 245)" }}
              >
                <Shield className="h-7 w-7" style={{ color: NAVY }} />
              </div>
              <CardTitle className="text-xl font-bold" style={{ color: NAVY }}>
                Admin Login
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                All India Electrician Association
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Admin Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isBusy && handleSubmit()
                  }
                  disabled={isBusy}
                  data-ocid="admin.input"
                  className="text-black"
                />
              </div>

              {error && (
                <p
                  className="text-sm text-red-600 font-medium"
                  data-ocid="admin.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                className="w-full text-white"
                onClick={handleSubmit}
                disabled={isBusy}
                data-ocid="admin.primary_button"
                style={{ backgroundColor: NAVY }}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLoggingIn || pendingPassword !== null
                      ? "Authenticating..."
                      : "Verifying..."}
                  </>
                ) : (
                  "Login to Admin Panel"
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Default password:{" "}
                <span className="font-mono font-medium text-gray-600">
                  AEIA@Admin2024
                </span>
              </p>

              <p className="text-center text-xs text-gray-400">
                <Link to="/" className="underline hover:text-gray-600">
                  ← Back to Home
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: applications, isLoading: appsLoading } =
    useGetAllApplications();
  const { data: statistics } = useGetStatistics();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const totalStats = statistics?.reduce(
    (acc, [, s]) => ({
      total: acc.total + Number(s.total),
      pending: acc.pending + Number(s.pending),
      approved: acc.approved + Number(s.approved),
      rejected: acc.rejected + Number(s.rejected),
    }),
    { total: 0, pending: 0, approved: 0, rejected: 0 },
  ) ?? { total: 0, pending: 0, approved: 0, rejected: 0 };

  const filtered = (applications ?? []).filter((app) => {
    const matchSearch =
      !search ||
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      `ELP-${app.id}`.includes(search.toUpperCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchType = typeFilter === "all" || app.licenseType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: NAVY }} />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginCard />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.97 0.02 250)" }}
    >
      <header
        style={{ backgroundColor: NAVY }}
        className="text-white px-6 py-4 flex items-center justify-between"
      >
        <div>
          <div className="font-heading font-bold text-lg">Admin Dashboard</div>
          <div className="text-xs opacity-60">Electrician Licence Portal</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-70 hidden sm:block">
            {identity?.getPrincipal().toString().slice(0, 16)}...
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={() => {
              clear();
              queryClient.clear();
            }}
            data-ocid="admin.secondary_button"
          >
            Logout
          </Button>
          <Link
            to="/"
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            ← Public Site
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total",
              value: totalStats.total,
              Icon: Users,
              color: NAVY,
            },
            {
              label: "Pending",
              value: totalStats.pending,
              Icon: Clock,
              color: "oklch(0.7 0.15 80)",
            },
            {
              label: "Approved",
              value: totalStats.approved,
              Icon: CheckCircle,
              color: "oklch(0.55 0.18 145)",
            },
            {
              label: "Rejected",
              value: totalStats.rejected,
              Icon: XCircle,
              color: "oklch(0.55 0.22 25)",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p
                        className="text-3xl font-heading font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <stat.Icon
                      className="h-8 w-8 opacity-20"
                      style={{ color: stat.color }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search by name or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="admin.search_input"
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  data-ocid="admin.select"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={Status.pending}>Pending</SelectItem>
                  <SelectItem value={Status.approved}>Approved</SelectItem>
                  <SelectItem value={Status.rejected}>Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  data-ocid="admin.select"
                >
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={LicenseType.wireman}>Wireman</SelectItem>
                  <SelectItem value={LicenseType.workman}>Workman</SelectItem>
                  <SelectItem value={LicenseType.supervisor}>
                    Supervisor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">
              Applications ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {appsLoading ? (
              <div className="p-4 space-y-3" data-ocid="admin.loading_state">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-10 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="p-8 text-center text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                No applications found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Licence Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((app, idx) => (
                      <TableRow
                        key={app.id.toString()}
                        data-ocid={`admin.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono font-semibold text-xs">
                          {formatRefNumber(app.id)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {app.fullName}
                        </TableCell>
                        <TableCell className="capitalize">
                          {app.licenseType}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(app.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGE[app.status as Status]}`}
                          >
                            {app.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/admin/application/$id"
                            params={{ id: app.id.toString() }}
                            data-ocid={`admin.edit_button.${idx + 1}`}
                          >
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
