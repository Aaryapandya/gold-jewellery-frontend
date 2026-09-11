"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FileText, ShieldCheck, Upload } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { userService } from "@/lib/services/user.service";
import { DocumentType, UserProfile } from "@/types";

const DOC_TYPES: { type: DocumentType; label: string; description: string }[] = [
  {
    type: "aadhaar_front",
    label: "Aadhaar Card — Front",
    description: "Clear photo of the front side of your Aadhaar card",
  },
  {
    type: "aadhaar_back",
    label: "Aadhaar Card — Back",
    description: "Clear photo of the back side of your Aadhaar card",
  },
  {
    type: "pan_front",
    label: "PAN Card — Front",
    description: "Clear photo of your PAN card",
  },
  {
    type: "pan_back",
    label: "PAN Card — Back",
    description: "Clear photo of the back of your PAN card",
  },
];

export default function OnboardingDocumentsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);

  const docInputRefs = useRef<Partial<Record<DocumentType, HTMLInputElement | null>>>({});

  useEffect(() => {
    userService
      .getMyProfile()
      .then(setProfile)
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const docUrl = (type: DocumentType): string | null => {
    if (!profile) return null;
    const map: Record<DocumentType, string | null> = {
      aadhaar_front: profile.aadhaarFrontUrl,
      aadhaar_back: profile.aadhaarBackUrl,
      pan_front: profile.panFrontUrl,
      pan_back: profile.panBackUrl,
    };
    return map[type];
  };

  const handleDocUpload = async (type: DocumentType, file: File) => {
    setUploadingDoc(type);
    try {
      const updated = await userService.uploadDocument(type, file);
      setProfile(updated);
      toast.success("Document uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingDoc(null);
    }
  };

  const allUploaded = DOC_TYPES.every((d) => !!docUrl(d.type));
  const uploadedCount = DOC_TYPES.filter((d) => !!docUrl(d.type)).length;

  const handleContinue = () => {
    if (!allUploaded) {
      toast.error("Please upload all 4 documents before continuing.");
      return;
    }
    router.push("/onboarding/family");
  };

  return (
    <AuthGuard requireVerified={false}>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-8">
        <div className="w-full max-w-lg">
          {/* Progress indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    step < 2
                      ? "bg-amber-200 text-amber-700"
                      : step === 2
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < 2 ? "✓" : step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-0.5 w-8 ${
                      step < 2 ? "bg-amber-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <FileText className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Identity Documents
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Step 2 of 3 — Upload your Aadhaar and PAN for verification
            </p>
          </div>

          {/* Upload card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {/* Progress summary */}
            <div className="mb-6 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm">
              <span className="font-medium text-amber-800">
                {uploadedCount} / {DOC_TYPES.length} documents uploaded
              </span>
              {allUploaded && (
                <span className="flex items-center gap-1 text-green-700">
                  <ShieldCheck className="h-4 w-4" /> All uploaded
                </span>
              )}
            </div>

            <div className="space-y-3">
              {DOC_TYPES.map(({ type, label, description }) => {
                const url = docUrl(type);
                const isUploading = uploadingDoc === type;

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {label}
                        </p>
                        {url ? (
                          <Badge className="bg-green-100 text-green-700">
                            Uploaded
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-600">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {description}
                      </p>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <FileText className="h-3 w-3" /> View uploaded
                        </a>
                      )}
                    </div>

                    <div className="ml-4 shrink-0">
                      <Button
                        variant={url ? "outline" : "secondary"}
                        size="sm"
                        loading={isUploading}
                        onClick={() => docInputRefs.current[type]?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {url ? "Replace" : "Upload"}
                      </Button>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        ref={(el) => {
                          docInputRefs.current[type] = el;
                        }}
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleDocUpload(type, e.target.files[0])
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              size="lg"
              className="mt-6 w-full"
              disabled={!allUploaded}
              onClick={handleContinue}
            >
              Continue →
            </Button>

            {!allUploaded && (
              <p className="mt-3 text-center text-xs text-gray-400">
                All 4 documents must be uploaded to proceed
              </p>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
