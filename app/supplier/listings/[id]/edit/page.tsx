"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ChevronLeft, Upload, Trash2, FileText } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import JewelleryForm from "@/components/jewellery/JewelleryForm";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { jewelleryService } from "@/lib/services/jewellery.service";
import { CreateJewelleryRequest, JewelleryItem } from "@/types";
import { JEWELLERY_STATUS_META } from "@/lib/utils";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<JewelleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingBills, setUploadingBills] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const billInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) { router.replace("/supplier/listings"); return; }
    jewelleryService
      .getById(id)
      .then(setItem)
      .catch(() => { toast.error("Listing not found"); router.replace("/supplier/listings"); })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleUpdate = async (data: CreateJewelleryRequest) => {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await jewelleryService.update(item.id, data);
      setItem(updated);
      toast.success("Listing updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!item || files.length === 0) return;
    setUploadingImages(true);
    try {
      const updated = await jewelleryService.uploadImages(item.id, files);
      setItem(updated);
      toast.success(`${files.length} image(s) uploaded!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleBillUpload = async (files: File[]) => {
    if (!item || files.length === 0) return;
    setUploadingBills(true);
    try {
      const updated = await jewelleryService.uploadBills(item.id, files);
      setItem(updated);
      toast.success(`${files.length} bill(s) uploaded!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bill upload failed");
    } finally {
      setUploadingBills(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={["SUPPLIER"]}>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </AuthGuard>
    );
  }

  if (!item) return null;

  const statusMeta = JEWELLERY_STATUS_META[item.status];

  return (
    <AuthGuard allowedRoles={["SUPPLIER"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/supplier/listings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Listings
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
            <p className="text-sm text-gray-500 mt-1">{item.title}</p>
          </div>
          <Badge className={statusMeta.colour}>{statusMeta.label}</Badge>
        </div>

        {item.status === "UNDER_VERIFICATION" && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            ⏳ This listing is under verification. Upload purchase bills below to help our team review faster.
          </div>
        )}

        {/* Edit form */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">Item Details</h2>
          <JewelleryForm
            defaultValues={{
              title: item.title,
              description: item.description,
              weightInGrams: item.weightInGrams,
              rentPerDay: item.rentPerDay,
              category: item.category,
              addressLine: item.addressLine,
              city: item.city,
              pincode: item.pincode,
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            loading={saving}
          />
        </Card>

        {/* Images section */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">📷 Photos</h2>

          {item.imageUrls?.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {item.imageUrls.map((url, i) => (
                <div key={i} className="relative h-24 rounded-xl overflow-hidden bg-gray-100">
                  <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-4 hover:border-amber-400 hover:bg-amber-50 transition-colors">
            <Upload className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {uploadingImages ? "Uploading..." : "Upload Photos"}
              </p>
              <p className="text-xs text-gray-400">JPEG, PNG · Multiple files allowed</p>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleImageUpload(Array.from(e.target.files ?? []))}
            />
          </label>
          {uploadingImages && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
              <Spinner size="sm" /> Uploading images...
            </div>
          )}
        </Card>

        {/* Bills section */}
        <Card>
          <h2 className="mb-2 font-semibold text-gray-900">📄 Purchase Bills</h2>
          <p className="mb-4 text-xs text-gray-500">
            Required for admin verification. Upload original purchase receipts/invoices.
          </p>

          {item.billUrls?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {item.billUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-blue-600 hover:bg-gray-50"
                >
                  <FileText className="h-3.5 w-3.5" /> Bill {i + 1}
                </a>
              ))}
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-4 hover:border-amber-400 hover:bg-amber-50 transition-colors">
            <Upload className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {uploadingBills ? "Uploading..." : "Upload Bills"}
              </p>
              <p className="text-xs text-gray-400">PDF, JPEG, PNG · Multiple files allowed</p>
            </div>
            <input
              ref={billInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => handleBillUpload(Array.from(e.target.files ?? []))}
            />
          </label>
          {uploadingBills && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
              <Spinner size="sm" /> Uploading bills...
            </div>
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}
