import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@dfinity/principal";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, LicenseType, Status } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  FALLBACK_FEES,
  formatRefNumber,
  useGetFees,
  useSubmitApplication,
} from "../hooks/useQueries";

const LICENCE_OPTIONS = [
  {
    type: LicenseType.wireman,
    title: "Wireman",
    desc: "For electricians who perform wiring work under supervision.",
    icon: "⚡",
  },
  {
    type: LicenseType.workman,
    title: "Workman",
    desc: "For skilled electricians working independently on standard systems.",
    icon: "🔧",
  },
  {
    type: LicenseType.supervisor,
    title: "Supervisor",
    desc: "For senior electricians qualified to supervise teams and sign off installations.",
    icon: "🏆",
  },
];

const DOCUMENT_FIELDS = [
  {
    key: "passportPhoto",
    label: "Passport Photo",
    required: true,
    hint: "Recent passport-size photo",
  },
  {
    key: "experienceLetter",
    label: "Experience Letter",
    required: false,
    hint: "Letter from previous employer",
  },
];

type FormData = {
  licenseType: LicenseType | null;
  fullName: string;
  dateOfBirth: string;
  nicNumber: string;
  phone: string;
  email: string;
  address: string;
  documents: Record<string, File | null>;
  declaration: boolean;
  paymentScreenshot: File | null;
};

const STEPS = [
  "Licence Type",
  "Personal Details",
  "Documents",
  "Review & Submit",
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    licenseType: null,
    fullName: "",
    dateOfBirth: "",
    nicNumber: "",
    phone: "",
    email: "",
    address: "",
    documents: {},
    declaration: false,
    paymentScreenshot: null,
  });
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const paymentScreenshotRef = useRef<HTMLInputElement>(null);

  const { data: fees } = useGetFees();
  const submitMutation = useSubmitApplication();
  const { identity } = useInternetIdentity();

  const getFee = (type: LicenseType) => {
    if (fees) {
      const fee = fees.find((f) => f.licenseType === type);
      if (fee) return { amount: Number(fee.amount), currency: fee.currency };
    }
    return FALLBACK_FEES[type];
  };

  const canNext = () => {
    if (step === 0) return form.licenseType !== null;
    if (step === 1)
      return !!(
        form.fullName &&
        form.dateOfBirth &&
        form.phone &&
        form.email &&
        form.address
      );
    if (step === 2) return !!form.documents.passportPhoto;
    if (step === 3) return form.declaration && !!form.paymentScreenshot;
    return false;
  };

  const handleFileChange = (key: string, file: File | null) => {
    setForm((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: file },
    }));
  };

  const handleSubmit = async () => {
    if (!form.licenseType) return;

    try {
      const uploadedDocs: { documentType: string; blobId: ExternalBlob }[] = [];
      for (const [key, file] of Object.entries(form.documents)) {
        if (!file) continue;
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress((prev) => ({ ...prev, [key]: pct }));
        });
        uploadedDocs.push({ documentType: key, blobId: blob });
      }

      // Upload payment screenshot as a document
      if (form.paymentScreenshot) {
        const bytes = new Uint8Array(
          await form.paymentScreenshot.arrayBuffer(),
        );
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress((prev) => ({ ...prev, paymentScreenshot: pct }));
        });
        uploadedDocs.push({ documentType: "paymentScreenshot", blobId: blob });
      }

      const principal = identity?.getPrincipal() ?? Principal.anonymous();

      const appId = await submitMutation.mutateAsync({
        id: BigInt(0),
        nicNumber: form.nicNumber,
        status: Status.pending,
        applicant: principal,
        documents: uploadedDocs,
        dateOfBirth: form.dateOfBirth,
        fullName: form.fullName,
        submittedAt: BigInt(Date.now()) * BigInt(1_000_000),
        email: form.email,
        licenseType: form.licenseType,
        address: form.address,
        phone: form.phone,
        declarationAccepted: form.declaration,
      });

      setReferenceNumber(formatRefNumber(appId));
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(
        err?.message ?? "Failed to submit application. Please try again.",
      );
    }
  };

  if (referenceNumber) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        data-ocid="apply.success_state"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              backgroundColor: "oklch(0.88 0.06 245)",
              color: "oklch(0.32 0.12 252)",
            }}
          >
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2 text-black">
            Application Submitted!
          </h1>
          <p className="text-black mb-6">
            Your application has been received. Use the reference number below
            to track your status.
          </p>
          <div
            className="rounded-xl p-6 mb-6 border-2"
            style={{
              borderColor: "oklch(0.32 0.12 252)",
              backgroundColor: "oklch(0.95 0.03 250)",
            }}
          >
            <p className="text-sm text-black mb-1">Your Reference Number</p>
            <p
              className="text-4xl font-heading font-black"
              style={{ color: "oklch(0.32 0.12 252)" }}
            >
              {referenceNumber}
            </p>
          </div>
          <p className="text-sm text-black mb-8">
            ⚠️ Please note this reference number. You will need it to check your
            application status.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = "/status";
              }}
            >
              Check Status
            </Button>
            <Button
              onClick={() => {
                setReferenceNumber(null);
                setStep(0);
                setForm({
                  licenseType: null,
                  fullName: "",
                  dateOfBirth: "",
                  nicNumber: "",
                  phone: "",
                  email: "",
                  address: "",
                  documents: {},
                  declaration: false,
                  paymentScreenshot: null,
                });
              }}
              style={{
                backgroundColor: "oklch(0.32 0.12 252)",
                color: "white",
              }}
            >
              New Application
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-1 text-black">
          Licence Application
        </h1>
        <p className="text-black">
          Complete all steps to submit your electrician licence application.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i <= step ? "text-white" : "bg-muted text-black"
                  }`}
                  style={
                    i <= step ? { backgroundColor: "oklch(0.32 0.12 252)" } : {}
                  }
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs mt-1 hidden sm:block ${i === step ? "font-semibold text-black" : "text-black"}`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 transition-colors"
                  style={
                    i < step
                      ? { backgroundColor: "oklch(0.32 0.12 252)" }
                      : { backgroundColor: "oklch(0.88 0.03 245)" }
                  }
                />
              )}
            </div>
          ))}
        </div>
        <Progress
          value={(step / (STEPS.length - 1)) * 100}
          className="mt-4 h-1"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 1: Licence Type */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-heading font-semibold mb-4 text-black">
                Select Licence Type
              </h2>
              <div className="grid gap-4">
                {LICENCE_OPTIONS.map((opt) => {
                  const fee = getFee(opt.type);
                  const selected = form.licenseType === opt.type;
                  return (
                    <button
                      type="button"
                      key={opt.type}
                      data-ocid="apply.toggle"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, licenseType: opt.type }))
                      }
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{opt.icon}</span>
                          <div>
                            <div className="font-semibold font-heading text-black">
                              {opt.title}
                            </div>
                            <div className="text-sm text-black">{opt.desc}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div
                            className="font-bold text-lg"
                            style={{ color: "oklch(0.32 0.12 252)" }}
                          >
                            {fee.currency} {fee.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-black">
                            Application Fee
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <div
                          className="mt-2 flex items-center gap-1 text-sm"
                          style={{ color: "oklch(0.32 0.12 252)" }}
                        >
                          <Check className="h-4 w-4" /> Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-heading font-semibold mb-4 text-black">
                Personal Details
              </h2>
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-black">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      data-ocid="apply.input"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dob" className="text-black">
                      Date of Birth *
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      data-ocid="apply.input"
                      value={form.dateOfBirth}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, dateOfBirth: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-black">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      data-ocid="apply.input"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-black">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      data-ocid="apply.input"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-black">
                    Residential Address *
                  </Label>
                  <Textarea
                    id="address"
                    data-ocid="apply.textarea"
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="Full postal address"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-heading font-semibold mb-1 text-black">
                Upload Documents
              </h2>
              <p className="text-sm text-black mb-4">
                Passport photo is required. Experience letter is recommended for
                faster processing.
              </p>
              <div className="grid gap-4">
                {DOCUMENT_FIELDS.map((field) => (
                  <DocumentUploadField
                    key={field.key}
                    field={field}
                    file={form.documents[field.key] ?? null}
                    progress={uploadProgress[field.key]}
                    onChange={(f) => handleFileChange(field.key, f)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 3 && form.licenseType && (
            <div>
              <h2 className="text-xl font-heading font-semibold mb-4 text-black">
                Review &amp; Submit
              </h2>

              {/* Payment QR Code */}
              <Card
                className="mb-4 border-2"
                style={{ borderColor: "oklch(0.32 0.12 252)" }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading text-black flex items-center gap-2">
                    💳 Pay Application Fee via QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black mb-3">
                    Scan the QR code below to pay your application fee. After
                    payment, upload the payment screenshot at the bottom of this
                    page.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src="/assets/uploads/screenshot_2026-03-24-23-43-54-22_b86b87620f0dd897e4c0859ecbb2d537-019d3aec-0d39-708f-91ba-ee7a98bd1660-1.jpg"
                      alt="Payment QR Code"
                      className="w-48 h-48 object-contain rounded-lg border"
                    />
                    <div className="text-sm text-black space-y-1">
                      <p className="font-semibold text-base">
                        Amount to Pay:{" "}
                        <span style={{ color: "oklch(0.32 0.12 252)" }}>
                          {(() => {
                            const f = getFee(form.licenseType!);
                            return `${f.currency} ${f.amount.toLocaleString()}`;
                          })()}
                        </span>
                      </p>
                      <p>1. Open your UPI / payment app</p>
                      <p>2. Scan the QR code above</p>
                      <p>3. Pay the exact application fee amount</p>
                      <p>4. Take a screenshot of the payment confirmation</p>
                      <p>5. Upload the screenshot below</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading text-black">
                    Application Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-black">Licence Type</span>
                    <span className="font-medium capitalize text-black">
                      {form.licenseType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Full Name</span>
                    <span className="font-medium text-black">
                      {form.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Phone</span>
                    <span className="font-medium text-black">{form.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Email</span>
                    <span className="font-medium text-black">{form.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Documents</span>
                    <span className="font-medium text-black">
                      {Object.values(form.documents).filter(Boolean).length}{" "}
                      uploaded
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-black">Application Fee</span>
                    <span style={{ color: "oklch(0.32 0.12 252)" }}>
                      {(() => {
                        const f = getFee(form.licenseType!);
                        return `${f.currency} ${f.amount.toLocaleString()}`;
                      })()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start gap-3 p-4 border rounded-lg mb-4">
                <Checkbox
                  id="declaration"
                  data-ocid="apply.checkbox"
                  checked={form.declaration}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, declaration: !!v }))
                  }
                />
                <Label
                  htmlFor="declaration"
                  className="text-sm leading-relaxed cursor-pointer text-black"
                >
                  I declare that all information provided in this application is
                  true and correct to the best of my knowledge. I understand
                  that providing false information may result in rejection or
                  cancellation of my licence.
                </Label>
              </div>

              {/* Payment Screenshot Upload */}
              <div
                className="rounded-lg border-2 border-dashed p-4 transition-colors"
                style={
                  form.paymentScreenshot
                    ? { borderColor: "#22c55e", backgroundColor: "#f0fdf4" }
                    : { borderColor: "oklch(0.32 0.12 252 / 0.4)" }
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm text-black">
                        Payment Screenshot
                      </span>
                      <Badge
                        variant="destructive"
                        className="text-xs px-1.5 py-0"
                      >
                        Required
                      </Badge>
                    </div>
                    <p className="text-xs text-black">
                      Upload a screenshot of your payment confirmation
                    </p>
                    {form.paymentScreenshot && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        ✓ {form.paymentScreenshot.name}
                      </p>
                    )}
                    {uploadProgress.paymentScreenshot !== undefined &&
                      uploadProgress.paymentScreenshot < 100 && (
                        <Progress
                          value={uploadProgress.paymentScreenshot}
                          className="mt-2 h-1"
                        />
                      )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid="apply.upload_button"
                      onClick={() => paymentScreenshotRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      {form.paymentScreenshot ? "Change" : "Upload"}
                    </Button>
                    {form.paymentScreenshot && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm((p) => ({ ...p, paymentScreenshot: null }))
                        }
                        className="text-red-500 hover:text-red-600"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={paymentScreenshotRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      paymentScreenshot: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          data-ocid="apply.secondary_button"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            data-ocid="apply.primary_button"
            style={{ backgroundColor: "oklch(0.32 0.12 252)", color: "white" }}
          >
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canNext() || submitMutation.isPending}
            data-ocid="apply.submit_button"
            style={{ backgroundColor: "oklch(0.32 0.12 252)", color: "white" }}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit Application <Check className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function DocumentUploadField({
  field,
  file,
  progress,
  onChange,
}: {
  field: { key: string; label: string; required: boolean; hint: string };
  file: File | null;
  progress?: number;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`rounded-lg border-2 p-4 transition-colors ${file ? "border-green-400 bg-green-50" : "border-dashed border-border hover:border-primary/50"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-sm text-black">
              {field.label}
            </span>
            {field.required && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Required
              </Badge>
            )}
          </div>
          <p className="text-xs text-black">{field.hint}</p>
          {file && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✓ {file.name}
            </p>
          )}
          {progress !== undefined && progress < 100 && (
            <Progress value={progress} className="mt-2 h-1" />
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="apply.upload_button"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1" /> {file ? "Change" : "Upload"}
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              className="text-red-500 hover:text-red-600"
            >
              ✕
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
