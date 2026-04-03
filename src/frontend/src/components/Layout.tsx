import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Layout() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: "/" as const, label: "Home" },
    { to: "/apply" as const, label: "Apply" },
    { to: "/status" as const, label: "Check Status" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shadow-md sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-0">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-3 font-heading font-bold text-lg text-black"
              data-ocid="nav.link"
            >
              <img
                src="/assets/uploads/img_20260321_231245-removebg-preview-019d3aca-8644-7043-83c1-eecbc777aafd-1.png"
                alt="All India Electrician Association Logo"
                className="h-12 w-12 object-contain"
              />
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-wide text-black">
                  Electrician Licence Portal
                </div>
                <div className="text-xs text-gray-500 font-normal">
                  Official Online Application System
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid="nav.link"
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    pathname === link.to
                      ? "text-black font-semibold"
                      : "text-gray-600 hover:text-black hover:bg-gray-100"
                  }`}
                  style={
                    pathname === link.to
                      ? { backgroundColor: "oklch(0.88 0.06 245)" }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleAuth}
                disabled={loginStatus === "logging-in"}
                data-ocid="nav.button"
                className="ml-2 px-4 py-2 rounded text-sm font-medium text-white hover:opacity-90 transition-colors disabled:opacity-50"
                style={{ backgroundColor: "oklch(0.32 0.12 252)" }}
              >
                {loginStatus === "logging-in"
                  ? "Logging in..."
                  : isAuthenticated
                    ? "Logout"
                    : "Login"}
              </button>
            </nav>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded text-gray-600 hover:text-black"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <nav className="md:hidden pb-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                  className="px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  handleAuth();
                  setMenuOpen(false);
                }}
                disabled={loginStatus === "logging-in"}
                data-ocid="nav.button"
                className="mt-1 px-3 py-2 rounded text-sm font-medium text-white text-left disabled:opacity-50"
                style={{ backgroundColor: "oklch(0.32 0.12 252)" }}
              >
                {loginStatus === "logging-in"
                  ? "Logging in..."
                  : isAuthenticated
                    ? "Logout"
                    : "Login"}
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <div
              className="font-medium"
              style={{ color: "oklch(0.2 0.09 255)" }}
            >
              Electrician Licence Portal — Official Application System
            </div>
            <div>
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
