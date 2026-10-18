"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, CheckCircle2, Edit } from "lucide-react";

export default function DoctorProfile() {
  // Mock data
  const doctor = {
    id: "doc_001",
    name: "Dr. Elena Rodriguez",
    email: "elena.rodriguez@example.com",
    phone: "+1 (555) 123-4567",
    specialization: "Dermatology",
    licenseNumber: "DERM-2018-4521",
    licenseStatus: "pending", // pending, approved, rejected
    experience: "8 years",
    education: [
      { degree: "MD, Dermatology", institution: "Johns Hopkins University", year: "2015" },
      { degree: "Residency in Dermatology", institution: "Mayo Clinic", year: "2018" },
    ],
  };

  const handleLicenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    alert("License submitted for review!");
  };

  return (
    <section className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Doctor Profile & License</h1>
        <p className="text-white/60 mt-1">
          Manage your professional information and medical license status
        </p>
      </div>

      {/* Doctor Info Card */}
      <Card className="bg-background mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
              {/* We removed the User icon because we are not using it; we can put placeholder or remove */}
              {/* Let's just remove the icon and keep the text */}</div>
            <div>
              <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
              <p className="text-white/60">{doctor.specialization}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-white/60">Contact Information</h3>
              <p className="text-white mt-1">{doctor.email}</p>
              <p className="text-white mt-1">{doctor.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/60">Professional Details</h3>
              <p className="text-white mt-1">{doctor.experience} experience</p>
              <p className="text-white mt-1">License: {doctor.licenseNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License Status Card */}
      <Card className="bg-background mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold text-white">Medical License Status</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center">
              {doctor.licenseStatus === "pending" ? (
                <CheckCircle2 className="h-5 w-5 text-yellow-400 animate-pulse" />
              ) : doctor.licenseStatus === "approved" ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                {doctor.licenseStatus.charAt(0).toUpperCase() + doctor.licenseStatus.slice(1)}
              </h3>
              <p className="text-white/60 mt-1">
                {doctor.licenseStatus === "pending"
                  ? "Your license is currently under review by the medical board."
                  : doctor.licenseStatus === "approved"
                  ? "Your license is active and verified."
                  : "Your license application was rejected. Please contact support."}
              </p>
            </div>
          </div>

          {/* License Upload Form (for pending/rejected) */}
          {doctor.licenseStatus !== "approved" && (
            <form onSubmit={handleLicenseSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="licenseFile" className="block text-sm font-medium text-white/60 mb-1">
                  Upload Medical License
                </label>
                <input
                  id="licenseFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-white border border-white/20 rounded bg-background/50 p-2"
                />
                <p className="text-xs text-white/60">
                  Please upload a clear scan or photo of your medical license (PDF, JPG, PNG)
                </p>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Submit License for Review
              </button>
            </form>
          )}

          {/* Education */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white/60 mb-2">Education & Training</h3>
            <div className="space-y-3">
              {doctor.education.map((edu, index) => (
                <div key={index} className="bg-background/50 p-3 rounded">
                  <h4 className="font-medium text-white">{edu.degree}</h4>
                  <p className="text-white/60">
                    {edu.institution} • {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {doctor.licenseStatus === "approved" && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-primary mb-4">Profile Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-background/50 hover:bg-background/70 text-white rounded-md border border-white/20 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </button>
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-background/50 hover:bg-background/70 text-white rounded-md border border-white/20 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Contact Support
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
