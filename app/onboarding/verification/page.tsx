"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock, ShieldCheck, FileText, Users, MapPin } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { userService } from "@/lib/services/user.service";
import { UserProfile } from "@/types";

/** Returns the first incomplete onboarding step URL, or null if all done. */
function getIncompleteOnboardingStep(profile: UserProfile): string | null {
  if (!profile.address || !profile.city || !profile.pincode) {
    return "/onboarding/address";
  }
  if (
    !profile.aadhaarFrontUrl ||
    !profile.aadhaarBackUrl ||
    !profile.panFrontUrl ||
    !profile.panBackUrl
  ) {
    return "/onboarding/documents";
  }
  if (profile.familyMembers.length === 0) {
    return "/onboarding/family";
  }
  return null;
}

export default function OnboardingVerificationPage() {
  const router = useRouter();
  const { isVerified, role, clearSession, setVerified } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // If the admin has already verified this user since last login, redirect them home
  useEffect(() => {
    if (isVerified) {
      const home = role === "SUPPLIER" ? "/supplier/listings" : "/explore";
      router.replace(home);
    }
  }, [isVerified, role, router]);

  // Fetch profile to derive actual step completion.
  // Also detects if the admin approved the user since their last login
  // (profile.isActive = true) and syncs the store so they get redirected home.
  useEffect(() => {
    userService
      .getMyProfile()
      .then((p) => {
        setProfile(p);
        if (p.active) {
          // Admin has approved — update stale cookie/store and redirect home
          setVerified(true);
          const home = role === "SUPPLIER" ? "/supplier/listings" : "/explore";
          router.replace(home);
        }
      })
      .catch(() => {});
  }, [role, router, setVerified]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  // Derive step states from real profile data
  const hasAddress = !!(
    profile?.address &&
    profile?.city &&
    profile?.pincode
  );
  const hasDocuments = !!(
    profile?.aadhaarFrontUrl &&
    profile?.aadhaarBackUrl &&
    profile?.panFrontUrl &&
    profile?.panBackUrl
  );
  const hasFamily = (profile?.familyMembers?.length ?? 0) > 0;

  const STEPS = [
    {
      icon: MapPin,
      label: "Address details",
      description: hasAddress
        ? "Your location information"
        : "Address not yet added",
      done: hasAddress,
    },
    {
      icon: FileText,
      label: "Identity documents",
      description: hasDocuments
        ? "Aadhaar & PAN uploaded"
        : "Documents not yet uploaded",
      done: hasDocuments,
    },
    {
      icon: Users,
      label: "Family members",
      description: hasFamily
        ? "Added to your profile"
        : "No family members added (optional)",
      done: hasFamily,
      optional: true,
    },
    {
      icon: ShieldCheck,
      label: "Admin verification",
      description: "Under review — usually within 24 hrs",
      done: false,
      pending: true,
    },
  ];

  const incompleteStep = profile ? getIncompleteOnboardingStep(profile) : null;
  // All required steps done = address + documents (family is optional)
  const allRequiredDone = hasAddress && hasDocuments;

  return (
    <AuthGuard requireVerified={false}>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-8">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900">
            Verification Pending
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {allRequiredDone
              ? "Your account registration is complete. Our admin team will review your documents and activate your account — usually within 24 hours."
              : "Please complete the remaining steps below before your account can be reviewed."}
          </p>

          {/* Steps checklist */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-left">
            <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Registration Progress
            </h2>
            <ul className="space-y-4">
              {STEPS.map(({ label, description, done, pending, optional }) => (
                <li key={label} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      pending
                        ? "bg-amber-100 text-amber-600"
                        : done || optional
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {pending ? (
                      <Clock className="h-4 w-4" />
                    ) : done || optional ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        pending
                          ? "text-amber-700"
                          : done || optional
                          ? "text-gray-900"
                          : "text-red-600"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Info box */}
          {allRequiredDone ? (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              💡 You will gain full access to{" "}
              <strong>GoldRent</strong> as soon as an admin approves your
              identity documents. Please log back in after receiving confirmation.
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              ⚠️ Your profile is incomplete. Please finish the required steps so
              an admin can review and approve your account.
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {incompleteStep ? (
              <Button onClick={() => router.push(incompleteStep)}>
                Complete Setup →
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push("/onboarding/address")}
              >
                Review my details
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
