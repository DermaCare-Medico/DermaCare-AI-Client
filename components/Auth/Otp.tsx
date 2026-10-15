"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import Form from "@/components/Form/Form";
import NOtp from "@/components/Form/NOtp";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function Otp() {
  const [notice, setNotice] = useState("");

  function handleSubmit() {
    setNotice("OTP verification isn’t connected yet. The code was not verified.");
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#0F888D]">
          Account recovery · Step 2 of 3
        </p>
        <h1 className="text-[30px] font-semibold tracking-tight text-[#0F2942]">
          Verify your email
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the 6-digit verification code sent to your email address.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <NOtp name="otp" label="Verification code" maxLength={6} />

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
          Verify code
        </Button>
      </Form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-slate-600">
          Didn’t receive a code?{" "}
          <Link
            href="/forgot-password"
            className="font-semibold text-[#0F888D] hover:text-[#0B6D72] hover:underline"
          >
            Request a new one
          </Link>
        </p>
        <Link
          href="/login"
          className="inline-block text-slate-500 hover:text-[#163A5F]"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}