"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { JEWELLERY_CATEGORIES } from "@/types";
import type { CreateJewelleryRequest } from "@/types";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  weightInGrams: z.coerce.number().positive("Weight must be positive"),
  rentPerDay: z.coerce.number().positive("Rent per day must be positive"),
  category: z.string().min(1, "Please select a category"),
  addressLine: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  latitude: z.coerce.number().min(-90).max(90, "Valid latitude required"),
  longitude: z.coerce.number().min(-180).max(180, "Valid longitude required"),
});

type FormValues = z.infer<typeof schema>;

interface JewelleryFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: CreateJewelleryRequest) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function JewelleryForm({
  defaultValues,
  onSubmit,
  submitLabel = "Create Listing",
  loading = false,
}: JewelleryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const categoryOptions = JEWELLERY_CATEGORIES.map((c) => ({
    value: c,
    label: c,
  }));

  // Attempt to auto-detect browser geolocation
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude, { shouldValidate: true });
        setValue("longitude", pos.coords.longitude, { shouldValidate: true });
      },
      () => {}
    );
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as CreateJewelleryRequest))} className="space-y-5">
      <Input
        label="Title"
        required
        placeholder="e.g. 22K Gold Necklace Set"
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        label="Description"
        required
        placeholder="Describe the jewellery, craftsmanship, occasion suitability..."
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Weight (grams)"
          type="number"
          step="0.1"
          required
          placeholder="45.5"
          error={errors.weightInGrams?.message}
          {...register("weightInGrams")}
        />
        <Input
          label="Rent per Day (₹)"
          type="number"
          step="0.01"
          required
          placeholder="500"
          error={errors.rentPerDay?.message}
          {...register("rentPerDay")}
        />
      </div>

      <Select
        label="Category"
        required
        options={categoryOptions}
        placeholder="Select category"
        error={errors.category?.message}
        {...register("category")}
      />

      <Input
        label="Address Line"
        required
        placeholder="12, MG Road"
        error={errors.addressLine?.message}
        {...register("addressLine")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          required
          placeholder="Bangalore"
          error={errors.city?.message}
          {...register("city")}
        />
        <Input
          label="Pincode"
          required
          placeholder="560001"
          maxLength={6}
          error={errors.pincode?.message}
          {...register("pincode")}
        />
      </div>

      {/* Coordinates */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Location Coordinates <span className="text-red-500">*</span>
          </span>
          <button
            type="button"
            onClick={detectLocation}
            className="text-xs text-amber-600 hover:underline"
          >
            Auto-detect my location
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Latitude (e.g. 12.9716)"
            type="number"
            step="any"
            error={errors.latitude?.message}
            {...register("latitude")}
          />
          <Input
            placeholder="Longitude (e.g. 77.5946)"
            type="number"
            step="any"
            error={errors.longitude?.message}
            {...register("longitude")}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Used for location-based discovery by buyers nearby.
        </p>
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
