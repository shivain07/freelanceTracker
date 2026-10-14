import React, { useEffect, useRef, useState } from "react";
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
import { GoogleLogin, useGoogleOAuth } from "@react-oauth/google";
import api from "../api/axiosClient";
import API_ROUTES from "../api/apiRoutes";
import { notifyUser } from "../utils/notifications";
import { isIosBrowser, prefersRedirectGoogleLogin } from "../utils/iosBrowser";
import { saveToken } from "../utils/secureToken";

const OAUTH_STATE_KEY = "ft_google_oauth_state";
const REDIRECT_TOKEN_KEY = "ft_google_redirect_token";

let sessionRequest = null;
let memoryRedirectToken = null;

const readOauthHash = () => {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
};

const clearGoogleOauthHash = () => {
  const params = readOauthHash();
  if (!params.has("access_token") && !params.has("error") && !params.has("state")) {
    return;
  }
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
};

const createOauthState = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const takeStoredOauthState = () => {
  try {
    const value = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    return value;
  } catch {
    return null;
  }
};

const rememberRedirectToken = (token) => {
  memoryRedirectToken = token;
  try {
    sessionStorage.setItem(REDIRECT_TOKEN_KEY, token);
  } catch {
    // Private mode can block storage. The in-memory copy still covers this page load.
  }
};

const readRedirectToken = () => {
  if (memoryRedirectToken) return memoryRedirectToken;
  try {
    return sessionStorage.getItem(REDIRECT_TOKEN_KEY);
  } catch {
    return null;
  }
};

const clearRedirectToken = () => {
  memoryRedirectToken = null;
  try {
    sessionStorage.removeItem(REDIRECT_TOKEN_KEY);
  } catch {
    // Ignore storage failures; the in-memory copy is already cleared.
  }
};

const requestAppSession = async (googleToken) => {
  const useBearer = isIosBrowser();
  const response = await api.post(
    API_ROUTES.auth.google,
    {
      token: googleToken,
      ...(useBearer ? { authMode: "bearer" } : {}),
    },
    { withCredentials: true, skipAuthRedirect: true },
  );

  if (useBearer) {
    if (!response?.token) {
      throw new Error("Sign-in did not return a session token.");
    }
    await saveToken(response.token);
  }

  return response;
};

const requestSessionOnce = (googleToken) => {
  if (!sessionRequest) {
    sessionRequest = requestAppSession(googleToken).finally(() => {
      sessionRequest = null;
    });
  }
  return sessionRequest;
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.1l6.3 5.3C37.4 38.4 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
    />
  </svg>
);

const LoginPage = () => {
  const { authenticated, loading, verifyUser, setLoading } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useGoogleOAuth();
  const useRedirectLogin = prefersRedirectGoogleLogin();
  const loginInFlight = useRef(false);
  const [signingIn, setSigningIn] = useState(() => {
    const params = readOauthHash();
    return params.has("access_token") || params.has("error");
  });

  useEffect(() => {
    if (authenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authenticated, navigate]);

  const completeLogin = async (googleToken) => {
    if (!googleToken || loginInFlight.current) return;
    loginInFlight.current = true;
    setSigningIn(true);

    let succeeded = false;
    try {
      setLoading(true);
      verifyUser(await requestAppSession(googleToken));
      succeeded = true;
    } catch (error) {
      console.error(
        "Backend login verification failed:",
        error.response?.data || error.message,
      );
      if (!error.response) {
        notifyUser(
          error.message || "Sign-in could not be completed. Please try again.",
        );
      }
    } finally {
      loginInFlight.current = false;
      setLoading(false);
      if (!succeeded) setSigningIn(false);
    }
  };

  const startRedirectLogin = () => {
    if (!clientId) {
      notifyUser("Google sign-in is not configured. Please try again later.");
      return;
    }

    const state = createOauthState();
    try {
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
    } catch {
      // Private mode can block storage. Sign-in can still finish without the check.
    }

    const redirectUri = `${window.location.origin}/`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: "openid email profile",
      include_granted_scopes: "true",
      prompt: "select_account",
      state,
    });

    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  };

  useEffect(() => {
    const params = readOauthHash();
    const hashToken = params.get("access_token");
    const hashError = params.get("error");

    if (hashToken || hashError) {
      const returnedState = params.get("state");
      const expectedState = takeStoredOauthState();
      clearGoogleOauthHash();

      if (hashError || !hashToken || (expectedState && returnedState !== expectedState)) {
        setSigningIn(false);
        notifyUser("Google sign-in could not be completed. Please try again.");
        return undefined;
      }

      rememberRedirectToken(hashToken);
    }

    const googleToken = readRedirectToken();
    if (!googleToken) return undefined;

    let active = true;
    setSigningIn(true);

    requestSessionOnce(googleToken)
      .then((response) => {
        if (!active) return;
        clearRedirectToken();
        verifyUser(response);
      })
      .catch((error) => {
        if (!active) return;
        clearRedirectToken();
        console.error(
          "Backend login verification failed:",
          error.response?.data || error.message,
        );
        if (!error.response) {
          notifyUser(
            error.message || "Sign-in could not be completed. Please try again.",
          );
        }
        setSigningIn(false);
      });

    return () => {
      active = false;
    };
  }, [verifyUser]);

  if (loading || signingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner
          message={signingIn ? "Signing you in..." : "Checking authentication..."}
        />
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
          {useRedirectLogin ? (
            <button
              type="button"
              onClick={startRedirectLogin}
              disabled={!clientId}
              className="inline-flex h-11 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-800 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) =>
                completeLogin(credentialResponse.credential)
              }
              onError={() =>
                notifyUser(
                  "Google sign-in could not be completed. Please try again.",
                )
              }
              shape="circle"
              size="large"
            />
          )}
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
