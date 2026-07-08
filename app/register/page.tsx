"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Gem } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { authService } from "@/lib/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Must contain uppercase, lowercase, number, and special character (@$!%*?&)"
      ),
    confirmPassword: z.string(),
    mobileNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    role: z.enum(["BUYER", "SUPPLIER"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, isAuthenticated } = useAuthStore();

  // Pre-fill role from query param (e.g., /register?role=SUPPLIER)
  const roleFromQuery = searchParams.get("role") as "BUYER" | "SUPPLIER" | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: roleFromQuery === "SUPPLIER" ? "SUPPLIER" : "BUYER",
    },
  });

  useEffect(() => {
    if (isAuthenticated) router.replace("/explore");
  }, [isAuthenticated, router]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        mobileNumber: values.mobileNumber,
        role: values.role,
      });
      setSession(res);
      toast.success(`Welcome, ${res.name}! Account created.`);

      const home =
        res.role === "SUPPLIER" ? "/supplier/listings" : "/explore";
      router.push(home);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <Gem className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join GoldRent as a Buyer or Supplier
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="Priya Sharma"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Mobile Number"
              type="tel"
              required
              placeholder="9876543210"
              maxLength={10}
              error={errors.mobileNumber?.message}
              hint="10-digit Indian mobile number"
              {...register("mobileNumber")}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              error={errors.password?.message}
              hint="Min 8 chars, with uppercase, digit, and @$!%*?&"
              {...register("password")}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Select
              label="I want to"
              required
              options={[
                { value: "BUYER", label: "Rent Jewellery (Buyer)" },
                { value: "SUPPLIER", label: "List Jewellery (Supplier)" },
              ]}
              error={errors.role?.message}
              {...register("role")}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              size="lg"
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
