import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Award,
  ChevronRight,
  ClipboardCheck,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LicenseType } from "../backend";
import { useGetFees } from "../hooks/useQueries";

const LICENSE_INFO = [
  {
    type: LicenseType.wireman,
    title: "Wireman Licence",
    description:
      "For electricians who perform wiring work in buildings, including installation of electrical cables, switches, and sockets under supervision.",
    requirements: [
      "Minimum Grade 8 education",
      "2+ years wiring experience",
      "Basic electrical safety certificate",
    ],
    icon: "⚡",
    fallbackFee: 100,
    fallbackCurrency: "INR",
  },
  {
    type: LicenseType.workman,
    title: "Workman Licence",
    description:
      "For skilled electricians who can independently carry out electrical installation work, repairs, and maintenance on standard electrical systems.",
    requirements: [
      "O/L qualification or equivalent",
      "3+ years field experience",
      "Electrical trade certificate",
    ],
    icon: "🔧",
    fallbackFee: 100,
    fallbackCurrency: "INR",
  },
  {
    type: LicenseType.supervisor,
    title: "Supervisor Licence",
    description:
      "For senior electricians qualified to supervise electrical work, sign off on installations, and oversee teams of wiremen and workmen.",
    requirements: [
      "A/L or technical diploma",
      "5+ years relevant experience",
      "Supervisor competency certificate",
    ],
    icon: "🏆",
    fallbackFee: 100,
    fallbackCurrency: "INR",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Select Licence Type",
    desc: "Choose the licence category that matches your qualification level.",
  },
  {
    step: "02",
    title: "Fill Personal Details",
    desc: "Provide your personal information and contact details.",
  },
  {
    step: "03",
    title: "Upload Documents",
    desc: "Upload your passport photo and qualification documents.",
  },
  {
    step: "04",
    title: "Pay & Submit",
    desc: "Review your application, pay the licence fee, and submit.",
  },
];

const CHALLAN_INSTRUCTIONS = [
  { step: 1, text: "Scan the QR code using any UPI payment app." },
  { step: 2, text: "Pay exactly ₹200 as the treasury challan fee." },
  {
    step: 3,
    text: "Note the Reference Number provided after payment (e.g. ELP-1).",
  },
  { step: 4, text: "Enter the Reference Number below and click Submit." },
];

const ELP_REF_PATTERN = /^ELP-\d+$/i;

export default function HomePage() {
  const { data: fees } = useGetFees();
  const [challanRef, setChallanRef] = useState("");

  const getFee = (
    type: LicenseType,
    fallback: number,
    fallbackCurrency: string,
  ) => {
    const fee = fees?.find((f) => f.licenseType === type);
    return fee
      ? `${fee.currency} ${Number(fee.amount).toLocaleString()}`
      : `${fallbackCurrency} ${fallback.toLocaleString()}`;
  };

  const handleChallanSubmit = () => {
    const trimmed = challanRef.trim();
    if (!trimmed || !ELP_REF_PATTERN.test(trimmed)) {
      toast.error("Please enter a valid reference number");
      return;
    }
    toast.success(`Challan submitted! Reference: ${trimmed}`);
    setChallanRef("");
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden text-white py-20 px-4"
        style={{ backgroundColor: "oklch(0.2 0.09 255)" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/assets/generated/hero-electrical-portal.dim_1200x400.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/20">
              Official Online Application System
            </Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              Electrician Licence
              <br />
              Application Portal
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Apply for your Wireman, Workman, or Supervisor electrical licence
              online. Fast, secure, and paperless.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white font-semibold hover:bg-white/90"
                style={{ color: "black" }}
              >
                <Link to="/apply" data-ocid="hero.primary_button">
                  Apply for Licence <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-white font-semibold hover:bg-white/90"
                style={{ color: "black" }}
              >
                <Link to="/status" data-ocid="hero.secondary_button">
                  Check Status
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notice */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-amber-800 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            All applications are reviewed within{" "}
            <strong>10 working days</strong>. Keep your reference number to
            track your application status.
          </span>
        </div>
      </div>

      {/* Payment Treasury Challan */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-2 shadow-sm"
            style={{ borderColor: "oklch(0.75 0.08 252)" }}
          >
            <CardHeader
              className="pb-4 border-b"
              style={{ borderColor: "oklch(0.88 0.06 245)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: "oklch(0.32 0.12 252)" }}
                >
                  ₹
                </div>
                <div>
                  <CardTitle className="text-xl font-heading text-black">
                    Payment Treasury Challan
                  </CardTitle>
                  <p className="text-sm text-black mt-0.5">
                    Official Online Application System — Challan Fee
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div
                    className="text-3xl font-bold font-heading"
                    style={{ color: "oklch(0.32 0.12 252)" }}
                  >
                    ₹200
                  </div>
                  <div className="text-xs text-black font-medium uppercase tracking-wide">
                    Payable Amount
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div
                    className="p-2 border-2 rounded-xl bg-white shadow-sm"
                    style={{ borderColor: "oklch(0.75 0.08 252)" }}
                  >
                    <img
                      src="/assets/screenshot_2026-04-03-23-20-12-65_b86b87620f0dd897e4c0859ecbb2d537-019d5478-c7d0-77ee-bcdf-4e31e30d38ef.jpg"
                      alt="Payment QR Code"
                      className="rounded-lg object-contain"
                      style={{ width: 180, height: 180 }}
                    />
                  </div>
                  <p className="text-xs text-black font-medium text-center">
                    Scan to Pay ₹200
                  </p>
                </div>

                {/* Instructions + Form */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-heading font-semibold text-base mb-4"
                    style={{ color: "oklch(0.32 0.12 252)" }}
                  >
                    How to Submit Your Challan
                  </h3>
                  <ol className="space-y-2 mb-6">
                    {CHALLAN_INSTRUCTIONS.map(({ step, text }) => (
                      <li
                        key={step}
                        className="flex items-start gap-3 text-sm text-black"
                      >
                        <span
                          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: "oklch(0.32 0.12 252)" }}
                        >
                          {step}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ol>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="challan-ref"
                        className="text-black font-medium"
                      >
                        Reference Number
                      </Label>
                      <Input
                        id="challan-ref"
                        data-ocid="challan.input"
                        placeholder="e.g. ELP-1"
                        value={challanRef}
                        onChange={(e) => setChallanRef(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleChallanSubmit();
                        }}
                        className="text-black max-w-xs"
                      />
                    </div>
                    <Button
                      data-ocid="challan.submit_button"
                      onClick={handleChallanSubmit}
                      style={{
                        backgroundColor: "oklch(0.32 0.12 252)",
                        color: "white",
                      }}
                      className="font-semibold"
                    >
                      Submit Challan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Licence Types & Fees */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold mb-2 text-black">
            Licence Categories &amp; Fees
          </h2>
          <p className="text-black">
            Select the category that matches your qualifications and experience.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {LICENSE_INFO.map((lic, i) => (
            <motion.div
              key={lic.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-colors shadow-xs">
                <CardHeader className="pb-3">
                  <div className="text-3xl mb-2">{lic.icon}</div>
                  <CardTitle className="font-heading text-black">
                    {lic.title}
                  </CardTitle>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "oklch(0.32 0.12 252)" }}
                  >
                    {getFee(lic.type, lic.fallbackFee, lic.fallbackCurrency)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black mb-4">{lic.description}</p>
                  <ul className="space-y-1">
                    {lic.requirements.map((req) => (
                      <li
                        key={req}
                        className="text-sm flex items-start gap-2 text-black"
                      >
                        <span className="text-green-500 mt-0.5">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button
            asChild
            size="lg"
            style={{ backgroundColor: "oklch(0.32 0.12 252)", color: "white" }}
          >
            <Link to="/apply" data-ocid="fees.primary_button">
              Start Your Application <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold mb-2 text-black">
              How to Apply
            </h2>
            <p className="text-black">
              Complete your application in 4 simple steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center p-6 h-full">
                  <div
                    className="text-3xl font-heading font-black mb-3"
                    style={{ color: "oklch(0.32 0.12 252)" }}
                  >
                    {s.step}
                  </div>
                  <h3 className="font-semibold font-heading mb-2 text-black">
                    {s.title}
                  </h3>
                  <p className="text-sm text-black">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: <ClipboardCheck className="h-8 w-8" />,
              title: "Paperless Process",
              desc: "Submit all documents digitally. No need to visit any office.",
            },
            {
              icon: <Shield className="h-8 w-8" />,
              title: "Secure & Official",
              desc: "Protected by Internet Computer blockchain technology.",
            },
            {
              icon: <Award className="h-8 w-8" />,
              title: "Track in Real-Time",
              desc: "Monitor your application status online with your reference number.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <div
                className="p-3 rounded-full"
                style={{
                  backgroundColor: "oklch(0.88 0.06 245)",
                  color: "oklch(0.32 0.12 252)",
                }}
              >
                {item.icon}
              </div>
              <h3 className="font-heading font-semibold text-lg text-black">
                {item.title}
              </h3>
              <p className="text-black text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
