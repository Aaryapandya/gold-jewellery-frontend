"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  User,
  Upload,
  Trash2,
  Plus,
  ShieldCheck,
  Camera,
  FileText,
} from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { userService } from "@/lib/services/user.service";
import { DocumentType, FamilyMember, UserProfile } from "@/types";
import { formatDate, getInitials, isValidIndianMobile, isValidPincode } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

const DOC_TYPES: { type: DocumentType; label: string }[] = [
  { type: "aadhaar_front", label: "Aadhaar Front" },
  { type: "aadhaar_back", label: "Aadhaar Back" },
  { type: "pan_front", label: "PAN Front" },
  { type: "pan_back", label: "PAN Back" },
];

export default function BuyerProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Family modal
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRefs = useRef<Partial<Record<DocumentType, HTMLInputElement | null>>>({});

  // Edit form state
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    userService
      .getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          name: p.name ?? "",
          mobileNumber: p.mobileNumber ?? "",
          address: p.address ?? "",
          city: p.city ?? "",
          pincode: p.pincode ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.mobileNumber && !isValidIndianMobile(form.mobileNumber)) e.mobileNumber = "Invalid 10-digit mobile";
    if (form.pincode && !isValidPincode(form.pincode)) e.pincode = "Pincode must be 6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: form.name.trim(),
        mobileNumber: form.mobileNumber || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        pincode: form.pincode || undefined,
      });
      setProfile(updated);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const updated = await userService.uploadProfilePhoto(file);
      setProfile(updated);
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocUpload = async (docType: DocumentType, file: File) => {
    setUploadingDoc(docType);
    try {
      const updated = await userService.uploadDocument(docType, file);
      setProfile(updated);
      toast.success("Document uploaded successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!familyName.trim() || !familyRelation.trim()) {
      toast.error("Name and relation are required");
      return;
    }
    setAddingMember(true);
    try {
      const member = await userService.addFamilyMember({
        name: familyName.trim(),
        relation: familyRelation.trim(),
      });
      setProfile((p) => p ? { ...p, familyMembers: [...(p.familyMembers ?? []), member] } : p);
      setFamilyModalOpen(false);
      setFamilyName("");
      setFamilyRelation("");
      toast.success("Family member added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveFamilyMember = async (member: FamilyMember) => {
    try {
      await userService.removeFamilyMember(member.id);
      setProfile((p) =>
        p ? { ...p, familyMembers: p.familyMembers.filter((m) => m.id !== member.id) } : p
      );
      toast.success(`${member.name} removed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={["BUYER"]}>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </AuthGuard>
    );
  }

  if (!profile) return null;

  const docUrl: Record<DocumentType, string | null> = {
    aadhaar_front: profile.aadhaarFrontUrl,
    aadhaar_back: profile.aadhaarBackUrl,
    pan_front: profile.panFrontUrl,
    pan_back: profile.panBackUrl,
  };

  const allDocsUploaded = DOC_TYPES.every((d) => docUrl[d.type]);

  return (
    <AuthGuard allowedRoles={["BUYER"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal details and identity documents
          </p>
        </div>

        {/* Verification status banner */}
        {!profile.emailVerified || !profile.mobileVerified ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            ⚠️ Your account is pending verification. An admin will verify your identity documents.
          </div>
        ) : (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-2 text-sm text-green-800">
            <ShieldCheck className="h-4 w-4" /> Your identity is verified. You can place bookings.
          </div>
        )}

        {/* Profile photo + basic info */}
        <Card>
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center">
                {profile.profilePhotoUrl ? (
                  <Image
                    src={profile.profilePhotoUrl}
                    alt={profile.name}
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-amber-700">
                    {getInitials(profile.name)}
                  </span>
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-lg">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className={profile.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  {profile.emailVerified ? "Email Verified" : "Email Unverified"}
                </Badge>
                <Badge className={profile.mobileVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  {profile.mobileVerified ? "Mobile Verified" : "Mobile Unverified"}
                </Badge>
                <Badge className={profile.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {profile.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-gray-400">Member since {formatDate(profile.createdAt)}</p>
            </div>
          </div>
        </Card>

        {/* Edit personal details */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">Personal Details</h2>
          <div className="space-y-4">
            <Input label="Full Name" required value={form.name} error={errors.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Mobile Number" type="tel" maxLength={10} value={form.mobileNumber} error={errors.mobileNumber}
              onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))} />
            <Input label="Address" value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              <Input label="Pincode" maxLength={6} value={form.pincode} error={errors.pincode}
                onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </Card>

        {/* Identity Documents */}
        <Card>
          <h2 className="mb-1 font-semibold text-gray-900">Identity Documents</h2>
          <p className="mb-4 text-sm text-gray-500">
            Upload Aadhaar and PAN for identity verification. Required to activate booking.
          </p>

          {allDocsUploaded && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
              <ShieldCheck className="h-4 w-4" /> All documents uploaded. Pending admin review.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {DOC_TYPES.map(({ type, label }) => {
              const url = docUrl[type];
              const isUploading = uploadingDoc === type;
              return (
                <div key={type} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {url ? (
                      <Badge className="bg-green-100 text-green-700">Uploaded</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500">Missing</Badge>
                    )}
                  </div>
                  {url ? (
                    <div className="flex items-center gap-2">
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <FileText className="h-3.5 w-3.5" /> View
                      </a>
                      <button onClick={() => docInputRefs.current[type]?.click()}
                        className="text-xs text-gray-400 hover:text-gray-600">Re-upload</button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm"
                      loading={isUploading}
                      onClick={() => docInputRefs.current[type]?.click()}>
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    ref={(el) => { docInputRefs.current[type] = el; }}
                    onChange={(e) => e.target.files?.[0] && handleDocUpload(type, e.target.files[0])}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Family Members */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Family Members</h2>
              <p className="text-sm text-gray-500">Optional — add family info for event rentals</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setFamilyModalOpen(true)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {(!profile.familyMembers || profile.familyMembers.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-4">No family members added yet.</p>
          ) : (
            <ul className="space-y-2">
              {profile.familyMembers.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.relation}</p>
                  </div>
                  <button onClick={() => handleRemoveFamilyMember(m)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Add family member modal */}
      <Modal isOpen={familyModalOpen} onClose={() => setFamilyModalOpen(false)} title="Add Family Member" size="sm">
        <div className="space-y-4">
          <Input label="Name" required placeholder="Ravi Sharma" value={familyName}
            onChange={(e) => setFamilyName(e.target.value)} />
          <Input label="Relation" required placeholder="Brother, Mother, Spouse..." value={familyRelation}
            onChange={(e) => setFamilyRelation(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setFamilyModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFamilyMember} loading={addingMember}>Add Member</Button>
          </div>
        </div>
      </Modal>
    </AuthGuard>
  );
}
