import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Status } from "../backend";
import {
  formatDate,
  formatRefNumber,
  useGetFullApplication,
  useUpdateApplicationStatus,
} from "../hooks/useQueries";

const STATUS_CONFIG: Record<
  Status,
  { label: string; Icon: typeof Clock; cls: string }
> = {
  [Status.pending]: {
    label: "Pending",
    Icon: Clock,
    cls: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  [Status.approved]: {
    label: "Approved",
    Icon: CheckCircle,
    cls: "bg-green-100 text-green-800 border-green-300",
  },
  [Status.rejected]: {
    label: "Rejected",
    Icon: XCircle,
    cls: "bg-red-100 text-red-800 border-red-300",
  },
};

export default function AdminApplicationDetail() {
  const { id } = useParams({ from: "/admin/application/$id" });
  const appId = id ? BigInt(id) : null;
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [newStatus, setNewStatus] = useState<Status | "">("");
  const [remarks, setRemarks] = useState("");

  const { data: app, isLoading } = useGetFullApplication(appId);
  const updateMutation = useUpdateApplicationStatus();

  const loadHtml2Canvas = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).html2canvas) {
        resolve((window as any).html2canvas);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => resolve((window as any).html2canvas);
      document.head.appendChild(script);
    });
  };

  const handleDownload = async () => {
    if (!printRef.current || !app) return;
    setDownloading(true);
    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${formatRefNumber(app.id)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Downloaded as image!");
    } catch {
      toast.error("Failed to download. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!appId || !newStatus) return;
    try {
      await updateMutation.mutateAsync({
        id: appId,
        status: newStatus as Status,
        remarks: remarks.trim() || null,
      });
      toast.success(`Status updated to ${newStatus}`);
      setNewStatus("");
      setRemarks("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update status.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-10"
        data-ocid="app-detail.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-10 text-center"
        data-ocid="app-detail.error_state"
      >
        <p className="text-muted-foreground">Application not found.</p>
        <Link to="/admin" className="text-primary underline text-sm mt-2 block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[app.status as Status];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.97 0.02 250)" }}
    >
      <header
        style={{ backgroundColor: "oklch(0.2 0.09 255)" }}
        className="text-white px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Link to="/admin" data-ocid="app-detail.link">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <div className="font-heading font-bold">
              {formatRefNumber(app.id)}
            </div>
            <div className="text-xs opacity-60">Application Detail</div>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={downloading}
          data-ocid="app-detail.primary_button"
          className="bg-white hover:bg-white/90"
          style={{ color: "oklch(0.2 0.09 255)" }}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download as Image
        </Button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div ref={printRef} className="bg-white rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold">
                Licence Application
              </h1>
              <p className="text-muted-foreground text-sm">
                Electrician Licence Portal — Official Record
              </p>
            </div>
            <div className="text-right">
              <div
                className="font-mono font-bold text-lg"
                style={{ color: "oklch(0.32 0.12 252)" }}
              >
                {formatRefNumber(app.id)}
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg.cls}`}
              >
                {statusCfg.label}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Licence Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Licence Type</p>
                <p className="font-semibold capitalize">{app.licenseType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="font-semibold">{formatDate(app.submittedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p
                  className={`font-semibold capitalize ${app.status === Status.approved ? "text-green-600" : app.status === Status.rejected ? "text-red-600" : "text-yellow-600"}`}
                >
                  {app.status}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Personal Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name</p>
                <p className="font-semibold">{app.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="font-semibold">{app.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NIC Number</p>
                <p className="font-semibold">{app.nicNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-semibold">{app.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold">{app.email}</p>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <p className="text-muted-foreground">Address</p>
                <p className="font-semibold whitespace-pre-wrap">
                  {app.address}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Uploaded Documents
            </h2>
            {app.documents.length === 0 ? (
              <p
                className="text-sm text-muted-foreground"
                data-ocid="app-detail.empty_state"
              >
                No documents uploaded.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {app.documents.map(
                  (doc: { documentType: string; blobId: any }, idx: number) => (
                    <DocumentCard key={doc.documentType} doc={doc} idx={idx} />
                  ),
                )}
              </div>
            )}
          </div>

          {app.remarks && (
            <>
              <Separator />
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Admin Remarks
                </h2>
                <p className="text-sm bg-muted rounded p-3">{app.remarks}</p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span
              className={
                app.declarationAccepted ? "text-green-600" : "text-red-600"
              }
            >
              {app.declarationAccepted ? "✅" : "❌"}
            </span>
            <span className="text-muted-foreground">
              Declaration accepted by applicant
            </span>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Update Application Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as Status)}
              >
                <SelectTrigger data-ocid="app-detail.select">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Status.pending}>Pending</SelectItem>
                  <SelectItem value={Status.approved}>Approved</SelectItem>
                  <SelectItem value={Status.rejected}>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Remarks (optional)</Label>
              <Textarea
                data-ocid="app-detail.textarea"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add remarks for the applicant..."
                rows={3}
              />
            </div>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || updateMutation.isPending}
              data-ocid="app-detail.save_button"
              style={{
                backgroundColor: "oklch(0.32 0.12 252)",
                color: "white",
              }}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DocumentCard({
  doc,
  idx,
}: { doc: { documentType: string; blobId: any }; idx: number }) {
  const url = doc.blobId?.getDirectURL?.() ?? null;
  const label = doc.documentType
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());

  return (
    <div
      className="border rounded-lg overflow-hidden"
      data-ocid={`app-detail.item.${idx + 1}`}
    >
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
            <img
              src={url}
              alt={label}
              className="object-cover w-full h-full group-hover:opacity-80 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="p-2 flex items-center justify-between">
            <span className="text-xs font-medium truncate">{label}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
          </div>
        </a>
      ) : (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No preview</span>
        </div>
      )}
    </div>
  );
}
