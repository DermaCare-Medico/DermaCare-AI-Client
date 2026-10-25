"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import Form from "@/components/Form/Form";
import NOtp from "@/components/Form/NOtp";
import { Button } from "@/components/ui/button";
import { useVerifyForgotPasswordOtpMutation } from "@/redux/api/authApi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";

function getErrorMessage(error: unknown): string {
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

  return "Unable to verify the code. Please check it and try again.";
}

export default function Otp() {
  const [notice, setNotice] = useState("");
  const [verifyOtp, { isLoading }] =
    useVerifyForgotPasswordOtpMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  async function handleSubmit(values: FieldValues): Promise<void> {
    const otp = String(values.otp ?? "").trim();

    if (!email) {
      setNotice("Email is missing. Please request a new verification code.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setNotice("Please enter the complete 6-digit verification code.");
      return;
    }

    if (isLoading) return;

    setNotice("");

    try {
      await verifyOtp({ email, otp }).unwrap();

      router.push(
        `/forgot-password/reset?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      );
    } catch (error: unknown) {
      setNotice(getErrorMessage(error));
    }
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
        {email && (
          <p className="mt-2 break-all text-sm font-medium text-[#0F888D]">
            {email}
          </p>
        )}
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="mb-5">
          <NOtp name="otp" label="Verification code" maxLength={6} />
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
          disabled={isLoading || !email}
          className="h-12 w-full rounded-lg bg-[#0F888D] text-sm font-semibold text-white shadow-md shadow-[#0F888D]/15 transition-colors hover:bg-[#0C7479] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Verifying..." : "Verify code"}
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