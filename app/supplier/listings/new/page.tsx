"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import JewelleryForm from "@/components/jewellery/JewelleryForm";
import Card from "@/components/ui/Card";
import { jewelleryService } from "@/lib/services/jewellery.service";
import { CreateJewelleryRequest } from "@/types";

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateJewelleryRequest) => {
    setLoading(true);
    try {
      const item = await jewelleryService.create(data);
      toast.success("Listing created! Upload photos and bills to speed up verification.");
      router.push(`/supplier/listings/${item.id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["SUPPLIER"]}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/supplier/listings"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Listings
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your listing will be placed under verification until approved by our team.
          </p>
        </div>

        <Card>
          <JewelleryForm
            onSubmit={handleSubmit}
            submitLabel="Create Listing"
            loading={loading}
          />
        </Card>
      </div>
    </AuthGuard>
  );
}
