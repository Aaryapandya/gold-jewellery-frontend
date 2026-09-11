"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, Users } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { userService } from "@/lib/services/user.service";
import { FamilyMember } from "@/types";

export default function OnboardingFamilyPage() {
  const router = useRouter();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Add-member form
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    userService
      .getFamilyMembers()
      .then(setMembers)
      .catch(() => toast.error("Failed to load family members"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !relation.trim()) {
      toast.error("Please enter both name and relation");
      return;
    }
    setAdding(true);
    try {
      const member = await userService.addFamilyMember({
        name: name.trim(),
        relation: relation.trim(),
      });
      setMembers((prev) => [...prev, member]);
      setName("");
      setRelation("");
      toast.success("Family member added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (member: FamilyMember) => {
    setRemoving(member.id);
    try {
      await userService.removeFamilyMember(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`${member.name} removed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemoving(null);
    }
  };

  const handleFinish = () => {
    router.push("/onboarding/verification");
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
                    step < 3
                      ? "bg-amber-200 text-amber-700"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {step < 3 ? "✓" : step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-0.5 w-8 ${
                      step < 3 ? "bg-amber-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <Users className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
            <p className="mt-1 text-sm text-gray-500">
              Step 3 of 3 — Add family members who may use the jewellery
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {/* Add member form */}
            <form onSubmit={handleAdd} className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name"
                  required
                  placeholder="Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Relation"
                  required
                  placeholder="Spouse, Mother…"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                loading={adding}
                className="w-full"
              >
                <Plus className="h-4 w-4" /> Add Family Member
              </Button>
            </form>

            {/* Member list */}
            {loading ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Loading…
              </p>
            ) : members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">
                  No family members added yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  This step is optional — you can skip and continue
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-500">{m.relation}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(m)}
                      disabled={removing === m.id}
                      className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label={`Remove ${m.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handleFinish}
            >
              Finish Setup →
            </Button>

            <p className="mt-3 text-center text-xs text-gray-400">
              This step is optional — you can always add family members later from your profile
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
