"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import Form from "@/components/Form/Form";
import NPassword from "@/components/Form/NPassword";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";

export default function ChangePassword() {
  const [notice, setNotice] = useState("");

  function handleSubmit(values: FieldValues) {
    if (values.password !== values.confirmPassword) {
      setNotice("Your passwords don’t match. Please check both fields.");
      return;
    }

    setNotice(
      "Password reset isn’t connected yet. Your password has not been changed.",
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#0F888D]">
          Account recovery · Step 3 of 3
        </p>
        <h1 className="text-[30px] font-semibold tracking-tight text-[#0F2942]">
          Create a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Choose a strong password you haven’t used for this account before.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="[&_label]:mb-2 [&_label]:text-[13px] [&_label]:font-semibold [&_label]:text-[#26384A] [&_input]:h-12 [&_input]:rounded-lg [&_input]:border-[#DCE4EC] [&_input]:bg-white [&_input]:px-4 [&_input]:text-sm [&_input]:placeholder:text-slate-400 [&_input]:focus-visible:border-[#0F888D] [&_input]:focus-visible:ring-[#0F888D]/15">
          <NPassword
            name="password"
            label="New password"
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
          <NPassword
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Enter your new password again"
            required
            minLength={8}
          />
        </div>

        <p className="-mt-1 mb-5 text-xs leading-5 text-slate-500">
          Use at least 8 characters for a stronger password.
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
          Reset password
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/forgot-password/otp"
          className="font-semibold text-[#0F888D] hover:text-[#0B6D72] hover:underline"
        >
          Back to verification
        </Link>
      </p>
    </AuthLayout>
  );
}