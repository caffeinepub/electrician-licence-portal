import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Award,
  ChevronRight,
  ClipboardCheck,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
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
    fallbackFee: 300,
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
    fallbackFee: 300,
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
    fallbackFee: 500,
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

export default function HomePage() {
  const { data: fees } = useGetFees();

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
