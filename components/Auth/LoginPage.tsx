"use client";

import Form from "@/components/Form/Form";
import NInput from "@/components/Form/NInput";
import NPassword from "@/components/Form/NPassword";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/Auth/AuthLayout";
import { useLoginMutation } from "@/redux/api/authApi";
import Navbar from "@/components/Common/Navbar/Navbar";
import Footer from "@/components/Common/Footer/Footer";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useAppDispatch } from "@/redux/hooks";
import { setSession } from "@/redux/features/authSlice";
import { baseApi } from "@/redux/api/baseApi";
import { destinationAfterLogin, sessionFromResponse } from "@/src/utils/auth";

// Demo login buttons. Put the email and password of accounts that already exist in your database.
// To remove a button, delete its object from this list.
type DemoAccount = {
  role: string;
  email: string;
  password: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
    {
    role: "Patient",
    email: "58shahnazparvin@gmail.com",
    password: "sh123456",
  },
  {
    role: "Doctor",
    email: "officialyeasin25@gmail.com",
    password: "016080yeasin",
  },
  {
    role: "Admin",
    email: "yeasinmiazi2003@gmail.com",
    password: "123456yeasin",
  },
];

// Demo buttons are visible by default.
// Set NEXT_PUBLIC_DEMO_LOGIN=false to hide them.
const SHOW_DEMO = process.env.NEXT_PUBLIC_DEMO_LOGIN !== "false";

// The button row adapts to the number of demo accounts.
const DEMO_GRID_CLASS =
  DEMO_ACCOUNTS.length === 1
    ? "grid-cols-1"
    : DEMO_ACCOUNTS.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message.replace(/\b\d{6}\b/g, "[code hidden]");
    }
  }

  return "Unable to sign in. Please check your credentials and try again.";
}

export default function LoginPage() {
  const [notice, setNotice] = useState("");
  const [demoRole, setDemoRole] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();
  const submitting = useRef(false);
  const dispatch = useAppDispatch();

  // Shared sign-in logic used by the form and by the demo buttons.
  async function signIn(email: string, password: string): Promise<void> {
    if (submitting.current || isLoading) return;

    submitting.current = true;
    setNotice("");

    try {
      const response = await login({ email, password }).unwrap();
      const session = sessionFromResponse(response);
      if (!session) throw new Error("The server did not return a complete session.");
      dispatch(baseApi.util.resetApiState());
      dispatch(setSession(session));
      const returnPath = new URLSearchParams(window.location.search).get("redirect");
      window.location.assign(destinationAfterLogin(session.user?.role, returnPath));
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : getApiErrorMessage(error));
      submitting.current = false;
      setDemoRole(null);
    }
  }

  async function handleSubmit(values: FieldValues): Promise<void> {
    const email = String(values.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(values.password ?? "");

    if (!email || !password) {
      setNotice("Please enter your email and password.");
      return;
    }

    await signIn(email, password);
  }

  async function handleDemoLogin(account: DemoAccount): Promise<void> {
    if (submitting.current || isLoading) return;
    setDemoRole(account.role);
    await signIn(account.email, account.password);
  }

  return (
    <><Navbar variant="minimal" /><AuthLayout>
      <div className="mb-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.17em] text-[#0F888D]">
          Welcome back
        </p>

        <h1 className="text-[30px] font-semibold tracking-tight text-[#0F2942]">
          Login
        </h1>

        <p className="text-sm leading-6 text-slate-500">
          Enter your credentials to log in to your account.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <div className=" [&_label]:text-[13px] [&_label]:font-semibold [&_label]:text-[#26384A] [&_input]:h-12 [&_input]:rounded-lg [&_input]:border-[#DCE4EC] [&_input]:bg-white [&_input]:px-2 [&_input]:text-sm [&_input]:placeholder:text-slate-400 [&_input]:focus-visible:border-[#0F888D] [&_input]:focus-visible:ring-[#0F888D]/15">
          <NInput
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            required
          />

          <NPassword
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="-mt-1 mb-5 flex items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-slate-300 accent-[#0F888D]"
            />
            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#0F888D] hover:text-[#0B6D72] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {notice && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"
          >
            {notice}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full"
        >
          {isLoading && !demoRole ? "Signing in..." : "Sign in"}
        </Button>
      </Form>

      {SHOW_DEMO && (
        <div className="mt-6">
          <div className="mb-4 flex items-center">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="px-3 text-xs text-slate-500">or try a demo account</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className={`grid gap-2 ${DEMO_GRID_CLASS}`}>
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.role}
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleDemoLogin(account)}
                className="h-11"
              >
                {isLoading && demoRole === account.role
                  ? "Signing in..."
                  : account.role}
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#0F888D] hover:text-[#0B6D72] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout><Footer /></>
  );
}