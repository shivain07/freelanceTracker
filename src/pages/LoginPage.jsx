import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock,
  Users,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axiosClient";
import API_ROUTES from "../api/apiRoutes";
import { notifyUser } from "../utils/notifications";

const LoginPage = () => {
  const { authenticated, loading, verifyUser, setLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authenticated, navigate]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      // credentialResponse.credential is the Google JWT ID token
      const response = await api.post(
        API_ROUTES.auth.google,
        {
          token: credentialResponse.credential,
        },
        { withCredentials: true, skipAuthRedirect: true },
      );

      verifyUser(response);
      // Store your app's session/JWT token, update state, and redirect user
    } catch (error) {
      console.error(
        "Backend login verification failed:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  const features = [
    {
      icon: Briefcase,
      title: "Project & Milestone Tracking",
      description:
        "Organize client deliverables with deep recursive task trees, subtasks, and progress checkpoints.",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      icon: Clock,
      title: "Precise Time Logging",
      description:
        "Log hours against specific subtasks to ensure every minute spent is accounted for and billable.",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Users,
      title: "Client & Rate Management",
      description:
        "Store client hourly rates, calculate project revenues automatically, and streamline client invoicing.",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background radial gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            FreeLance<span className="text-indigo-400">Tracker</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Secure Google Authentication</span>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-medium mb-8">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Complete Freelance & Project Billing Solution</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          Track projects, manage tasks, and invoice clients —{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            all in one place.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          The unified workspace built specifically for independent contractors,
          freelancers, and consultants who need accurate time tracking and
          effortless revenue accounting.
        </p>

        {/* CTA Login Button */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() =>
              notifyUser(
                "Google sign-in could not be completed. Please try again.",
              )
            }
            shape="circle"
            size="large"
          />
          {/* <LoginButton className="px-8 py-4 text-base shadow-xl hover:shadow-indigo-500/10" /> */}
          <p className="text-xs text-slate-500">
            No passwords needed. Instant sign-in with your Google account.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 backdrop-blur-xs border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${feature.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                {/* <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group cursor-default">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div> */}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <p>
            &copy; {new Date().getFullYear()} FreeLance Tracker. Built for
            professionals.
          </p>
          <a
            href="https://www.linkedin.com/in/shivain-gusain-bab76020a/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Contact on LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
