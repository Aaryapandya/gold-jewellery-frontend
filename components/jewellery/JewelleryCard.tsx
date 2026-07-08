import Image from "next/image";
import Link from "next/link";
import { MapPin, Scale, Star } from "lucide-react";
import { JewelleryItem } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatCurrency, JEWELLERY_STATUS_META } from "@/lib/utils";

interface JewelleryCardProps {
  item: JewelleryItem;
  showStatus?: boolean; // suppliers need status visibility
}

export default function JewelleryCard({
  item,
  showStatus = false,
}: JewelleryCardProps) {
  const statusMeta = JEWELLERY_STATUS_META[item.status];

  return (
    <Link
      href={`/jewellery/${item.id}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md hover:border-amber-200 transition-all"
    >
      {/* Image */}
      <div className="relative h-48 bg-amber-50 overflow-hidden">
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <Image
            src={item.imageUrls[0]}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Star className="h-16 w-16 text-amber-200" />
          </div>
        )}

        {/* Availability pill */}
        <div className="absolute top-2 right-2">
          {item.isAvailable ? (
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
              Available
            </span>
          ) : (
            <span className="rounded-full bg-gray-500 px-2 py-0.5 text-xs font-medium text-white">
              Booked
            </span>
          )}
        </div>

        {/* Status badge (supplier view) */}
        {showStatus && (
          <div className="absolute top-2 left-2">
            <Badge className={statusMeta.colour}>{statusMeta.label}</Badge>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <p className="mb-1 text-xs font-medium text-amber-600 uppercase tracking-wide">
          {item.category}
        </p>
        <h3 className="mb-2 font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
          {item.title}
        </h3>

        <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {item.city}
          </span>
          <span className="flex items-center gap-1">
            <Scale className="h-3.5 w-3.5" />
            {item.weightInGrams}g
          </span>
          {item.distanceKm !== undefined && (
            <span className="text-blue-600">
              {item.distanceKm.toFixed(1)} km away
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-amber-700">
              {formatCurrency(item.rentPerDay)}
            </span>
            <span className="text-xs text-gray-500"> / day</span>
          </div>
          <span className="text-xs text-gray-400">by {item.supplierName}</span>
        </div>
      </div>
    </Link>
  );
}
