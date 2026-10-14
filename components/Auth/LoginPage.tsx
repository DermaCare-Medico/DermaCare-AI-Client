"use client";

import Form from "@/components/Form/Form";
import NInput from "@/components/Form/NInput";
import NPassword from "@/components/Form/NPassword";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/Auth/AuthLayout";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [notice, setNotice] = useState("");

  function handleSubmit() {
    setNotice("Sign-in is not connected yet. Please contact your administrator.");
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#0F888D]">
          Welcome back
        </p>
        <h1 className="text-[30px] font-semibold tracking-tight text-[#0F2942]">
          Login
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter your credentials to log in to your account.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="[&_label]:mb-2 [&_label]:text-[13px] [&_label]:font-semibold [&_label]:text-[#26384A] [&_input]:h-12 [&_input]:rounded-lg [&_input]:border-[#DCE4EC] [&_input]:bg-white [&_input]:px-4 [&_input]:text-sm [&_input]:placeholder:text-slate-400 [&_input]:focus-visible:border-[#0F888D] [&_input]:focus-visible:ring-[#0F888D]/15">
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
            role="status"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"
          >
            {notice}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-lg bg-[#0F888D] text-sm font-semibold text-white shadow-md shadow-[#0F888D]/15 transition-colors hover:bg-[#0C7479]"
        >
          Sign in
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#0F888D] hover:text-[#0B6D72] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
