"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Gem, Plus, Trash2, Edit2, Upload } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import JewelleryCard from "@/components/jewellery/JewelleryCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { jewelleryService } from "@/lib/services/jewellery.service";
import { JewelleryItem, PagedResponse } from "@/types";

export default function SupplierListingsPage() {
  const [result, setResult] = useState<PagedResponse<JewelleryItem> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<JewelleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Image upload modal
  const [uploadTarget, setUploadTarget] = useState<JewelleryItem | null>(null);
  const [uploadType, setUploadType] = useState<"images" | "bills">("images");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fetchListings = () => {
    setLoading(true);
    jewelleryService
      .getMine({ page, size: 9, sortBy: "createdAt", sortDir: "desc" })
      .then(setResult)
      .catch(() => toast.error("Failed to load listings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jewelleryService.delete(deleteTarget.id);
      toast.success("Listing deleted.");
      setDeleteTarget(null);
      fetchListings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cannot delete — active or approved booking exists.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadTarget || selectedFiles.length === 0) return;
    setUploading(true);
    try {
      if (uploadType === "images") {
        await jewelleryService.uploadImages(uploadTarget.id, selectedFiles);
        toast.success("Images uploaded!");
      } else {
        await jewelleryService.uploadBills(uploadTarget.id, selectedFiles);
        toast.success("Bills uploaded!");
      }
      setUploadTarget(null);
      setSelectedFiles([]);
      fetchListings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["SUPPLIER"]}>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your jewellery items for rent</p>
          </div>
          <Link href="/supplier/listings/new">
            <Button>
              <Plus className="h-4 w-4" /> New Listing
            </Button>
          </Link>
        </div>

        {/* Under-verification notice */}
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          💡 New listings start in <strong>Under Verification</strong> status. Upload purchase bills so our team can approve them quickly.
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : !result || result.content.length === 0 ? (
          <EmptyState
            icon={Gem}
            title="No listings yet"
            description="Create your first jewellery listing to start earning from your gold."
            action={
              <Link href="/supplier/listings/new">
                <Button><Plus className="h-4 w-4" /> Create Listing</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.content.map((item) => (
                <div key={item.id} className="group relative">
                  <JewelleryCard item={item} showStatus />
                  {/* Action overlay */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/supplier/listings/${item.id}/edit`}>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md text-gray-600 hover:text-amber-600 hover:shadow-lg transition-all">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => { setUploadTarget(item); setUploadType("images"); setSelectedFiles([]); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md text-gray-600 hover:text-blue-600 hover:shadow-lg transition-all"
                      title="Upload images"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md text-gray-600 hover:text-red-600 hover:shadow-lg transition-all"
                      title="Delete listing"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={result.pageNumber}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Listing"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-2">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <p className="text-xs text-red-600 mb-6">
          Note: Deletion is blocked if an active or approved booking exists.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>

      {/* Upload modal */}
      <Modal
        isOpen={!!uploadTarget}
        onClose={() => { setUploadTarget(null); setSelectedFiles([]); }}
        title={`Upload ${uploadType === "images" ? "Photos" : "Purchase Bills"}`}
        size="sm"
      >
        <p className="mb-3 text-sm text-gray-600">
          For: <strong>{uploadTarget?.title}</strong>
        </p>

        {/* Type toggle */}
        <div className="mb-4 flex rounded-lg border border-gray-200 overflow-hidden">
          {(["images", "bills"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setUploadType(t)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                uploadType === t ? "bg-amber-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "images" ? "📷 Photos" : "📄 Bills"}
            </button>
          ))}
        </div>

        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-amber-400 hover:bg-amber-50 transition-colors">
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} file(s) selected`
              : "Click to select files"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {uploadType === "images" ? "JPEG, PNG accepted" : "PDF, JPEG, PNG accepted"}
          </p>
          <input
            type="file"
            multiple
            accept={uploadType === "images" ? "image/jpeg,image/png" : "image/jpeg,image/png,application/pdf"}
            className="hidden"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
          />
        </label>

        {selectedFiles.length > 0 && (
          <ul className="mt-3 space-y-1">
            {selectedFiles.map((f, i) => (
              <li key={i} className="text-xs text-gray-600 truncate">• {f.name}</li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setUploadTarget(null); setSelectedFiles([]); }}>
            Cancel
          </Button>
          <Button onClick={handleUpload} loading={uploading} disabled={selectedFiles.length === 0}>
            Upload
          </Button>
        </div>
      </Modal>
    </AuthGuard>
  );
}
