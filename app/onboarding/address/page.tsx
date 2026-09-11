"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { userService } from "@/lib/services/user.service";
import { isValidPincode } from "@/lib/utils";

export default function OnboardingAddressPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Pre-fill if the user already has address data
  useEffect(() => {
    userService
      .getMyProfile()
      .then((p) => {
        setForm({
          address: p.address ?? "",
          city: p.city ?? "",
          pincode: p.pincode ?? "",
        });
      })
      .catch(() => {
        // Non-critical — user can fill manually
      });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!isValidPincode(form.pincode)) e.pincode = "Pincode must be 6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await userService.updateProfile({
        address: form.address.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
      });
      toast.success("Address saved!");
      router.push("/onboarding/documents");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard requireVerified={false}>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-8">
        <div className="w-full max-w-md">
          {/* Progress indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    step === 1
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && <div className="h-0.5 w-8 bg-gray-200" />}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <MapPin className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Your Address</h1>
            <p className="mt-1 text-sm text-gray-500">
              Step 1 of 3 — Tell us where you are located
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Address"
                required
                placeholder="House no., Street, Area"
                value={form.address}
                error={errors.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  placeholder="Mumbai"
                  value={form.city}
                  error={errors.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
                <Input
                  label="Pincode"
                  required
                  placeholder="400001"
                  maxLength={6}
                  value={form.pincode}
                  error={errors.pincode}
                  hint="6-digit pincode"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pincode: e.target.value }))
                  }
                />
              </div>

              <Button
                type="submit"
                loading={saving}
                size="lg"
                className="mt-2 w-full"
              >
                Save & Continue →
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
