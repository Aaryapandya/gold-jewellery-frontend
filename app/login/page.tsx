"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Gem } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authService } from "@/lib/services/auth.service";
import { userService } from "@/lib/services/user.service";
import { useAuthStore } from "@/store/auth.store";
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

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setSession, isAuthenticated, role, isVerified } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (!isVerified) {
        // Unverified users — check which onboarding step they left off at
        userService
          .getMyProfile()
          .then((profile) => {
            const incompleteStep = getIncompleteOnboardingStep(profile);
            router.replace(incompleteStep ?? "/onboarding/verification");
          })
          .catch(() => {
            router.replace("/onboarding/address");
          });
      } else {
        router.replace(role === "SUPPLIER" ? "/supplier/listings" : "/explore");
      }
    }
  }, [isAuthenticated, role, isVerified, router]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await authService.login(values);
      setSession(res);
      toast.success(`Welcome back, ${res.name}!`);

      if (res.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (!res.isVerified) {
        // Not yet approved by admin — check which onboarding step they left off at
        try {
          const profile = await userService.getMyProfile();
          const incompleteStep = getIncompleteOnboardingStep(profile);
          router.push(incompleteStep ?? "/onboarding/verification");
        } catch {
          // If profile fetch fails, fall back to the start of onboarding
          router.push("/onboarding/address");
        }
      } else {
        router.push(res.role === "SUPPLIER" ? "/supplier/listings" : "/explore");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <Gem className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your GoldRent account</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              size="lg"
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-amber-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
