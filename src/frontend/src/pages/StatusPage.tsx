import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, Loader2, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { Status } from "../backend";
import { useActor } from "../hooks/useActor";
import { formatDate } from "../hooks/useQueries";

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; Icon: typeof Clock }
> = {
  [Status.pending]: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Icon: Clock,
  },
  [Status.approved]: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-300",
    Icon: CheckCircle,
  },
  [Status.rejected]: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-300",
    Icon: XCircle,
  },
};

export default function StatusPage() {
  const [refInput, setRefInput] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { actor } = useActor();

  const handleCheck = async () => {
    const clean = refInput.trim().toUpperCase().replace(/^ELP-/, "");
    const id = Number.parseInt(clean, 10);
    if (Number.isNaN(id)) {
      setError("Invalid reference number. Format: ELP-1001 or just 1001");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      if (!actor) throw new Error("Not connected to backend");
      const app = await actor.getFullApplication(BigInt(id));
      setResult(app);
    } catch {
      setError("Application not found. Please check your reference number.");
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = result ? STATUS_CONFIG[result.status as Status] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-heading font-bold mb-2">
          Check Application Status
        </h1>
        <p className="text-muted-foreground">
          Enter your reference number to check the status of your licence
          application.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Label htmlFor="refNum">Reference Number</Label>
            <div className="flex gap-2">
              <Input
                id="refNum"
                data-ocid="status.search_input"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="ELP-1001 or 1001"
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
              <Button
                onClick={handleCheck}
                disabled={!refInput.trim() || loading}
                data-ocid="status.primary_button"
                style={{
                  backgroundColor: "oklch(0.32 0.12 252)",
                  color: "white",
                }}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && (
              <p
                className="text-sm text-red-600"
                data-ocid="status.error_state"
              >
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {result && statusCfg && (
        <Card className="mt-6" data-ocid="status.card">
          <CardHeader>
            <CardTitle className="font-heading flex items-center justify-between">
              Application Details
              <span
                className={`text-sm font-normal px-3 py-1 rounded-full border ${statusCfg.color}`}
              >
                {statusCfg.label}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-muted-foreground">Reference</span>
                <p className="font-semibold">ELP-{result.id.toString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Licence Type</span>
                <p className="font-semibold capitalize">{result.licenseType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Applicant</span>
                <p className="font-semibold">{result.fullName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted</span>
                <p className="font-semibold">
                  {formatDate(result.submittedAt)}
                </p>
              </div>
            </div>
            {result.remarks && (
              <div className="mt-3 p-3 bg-muted rounded text-muted-foreground">
                <strong className="text-foreground">Remarks:</strong>{" "}
                {result.remarks}
              </div>
            )}
            <div className="flex items-center gap-2 pt-2">
              {result.status === Status.pending && (
                <p className="text-sm text-amber-700">
                  ⏳ Your application is under review. Processing typically
                  takes 10 working days.
                </p>
              )}
              {result.status === Status.approved && (
                <p className="text-sm text-green-700">
                  ✅ Congratulations! Your licence has been approved. Please
                  collect it from the office.
                </p>
              )}
              {result.status === Status.rejected && (
                <p className="text-sm text-red-700">
                  ❌ Your application was not successful. Please see remarks
                  above and reapply.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
