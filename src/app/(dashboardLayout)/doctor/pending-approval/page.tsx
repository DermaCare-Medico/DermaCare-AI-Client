import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Edit } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function DoctorPendingApproval() {
  // Mock data - in a real app, this would come from the backend
  const submission = {
    id: "sub_001",
    submittedAt: "Oct 10, 2026",
    status: "pending",
    licenseNumber: "DERM-2018-4521",
    notes: "Under review by the medical board. Expected response within 5-7 business days.",
  };

  return (
    <section className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Pending Approval</h1>
        <p className="text-white/60 mt-1">
          Your license submission is currently under review
        </p>
      </div>

      <Card className="bg-background">
        <CardHeader>
          <h2 className="text-lg font-bold text-white">Submission Status</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Pending Review</h3>
              <p className="text-white/60">
                Your medical license submission is awaiting approval from the
                medical board.
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="grid gap-2">
              <p className="text-white/60">Submitted:</p>
              <p className="text-white">{submission.submittedAt}</p>
            </div>
            <div className="grid gap-2">
              <p className="text-white/60">License Number:</p>
              <p className="text-white">{submission.licenseNumber}</p>
            </div>
            <div className="grid gap-2">
              <p className="text-white/60">Current Status:</p>
              <p className="text-white">
                <span className="px-3 py-1 rounded bg-yellow-900/20 text-yellow-300">
                  {submission.status}
                </span>
              </p>
            </div>
          </div>

          <p className="text-white/60 mt-4">{submission.notes}</p>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-primary mb-4">Next Steps</h3>
            <p className="text-white/60 mb-4">
              You will receive an email notification once your license has been
              reviewed. Please ensure your contact information is up to date.
            </p>
            <Link
              href="/doctor/profile"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" /> Update Profile & License
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Empty state for when approved - redirect or show different message */}
      {/* This would be handled by routing in a real app, but for mock we show a note */}
      <div className="mt-8 text-center text-white/60">
        <p>
          <em>
            Note: This page is only visible when your license is pending approval.
            Once approved, you will be redirected to your doctor dashboard.
          </em>
        </p>
      </div>
    </section>
  );
}
