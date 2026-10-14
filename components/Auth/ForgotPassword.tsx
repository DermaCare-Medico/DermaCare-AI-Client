"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import Form from "@/components/Form/Form";
import NInput from "@/components/Form/NInput";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPassword() {
  const [notice, setNotice] = useState("");

  function handleSubmit() {
    setNotice(
      "Password recovery isn’t connected yet. No verification code has been sent.",
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#0F888D]">
          Account recovery
        </p>
        <h1 className="text-[30px] font-semibold tracking-tight text-[#0F2942]">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the email address linked to your account and we’ll help you get
          back in.
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
        </div>

        <p className="-mt-1 mb-5 text-xs leading-5 text-slate-500">
          We’ll use this address to help verify it’s really you.
        </p>

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
          Send verification code
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0F888D] hover:text-[#0B6D72] hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}