"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import AuthGuard from "@/components/layout/AuthGuard";
import JewelleryCard from "@/components/jewellery/JewelleryCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import { jewelleryService } from "@/lib/services/jewellery.service";
import { JEWELLERY_CATEGORIES, JewelleryItem, PagedResponse } from "@/types";

const DEFAULT_RADIUS_KM = 15;
const DEFAULT_PAGE_SIZE = 9;

const categoryOptions = [
  { value: "", label: "All categories" },
  ...JEWELLERY_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  })),
];

const radiusOptions = [
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
  { value: "15", label: "Within 15 km" },
  { value: "25", label: "Within 25 km" },
  { value: "50", label: "Within 50 km" },
];

export default function ExplorePage() {
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [pageData, setPageData] = useState<PagedResponse<JewelleryItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState("");
  const [radiusKm, setRadiusKm] = useState(String(DEFAULT_RADIUS_KM));
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationReady, setLocationReady] = useState(false);
  const [usedAutoLocation, setUsedAutoLocation] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);

  const parsedLatitude = useMemo(() => Number(latitude), [latitude]);
  const parsedLongitude = useMemo(() => Number(longitude), [longitude]);
  const hasValidCoordinates =
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90 &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180;

  const fetchListings = useCallback(async () => {
    if (!hasValidCoordinates) {
      setItems([]);
      setPageData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await jewelleryService.getNearby({
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        radiusKm: Number(radiusKm),
        category: category || undefined,
        page,
        size: DEFAULT_PAGE_SIZE,
      });

      setItems(response.content);
      setPageData(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load jewellery near your location right now.";
      setError(message);
      setItems([]);
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [category, hasValidCoordinates, page, parsedLatitude, parsedLongitude, radiusKm]);

  const requestCurrentLocation = useCallback((showErrorToast = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationReady(true);
      setShowManualLocation(true);
      if (showErrorToast) {
        toast.error("Geolocation is not supported on this device.");
      }
      return;
    }

    setRefreshingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setLocationReady(true);
        setUsedAutoLocation(true);
        setShowManualLocation(false);
        setRefreshingLocation(false);
      },
      () => {
        setLocationReady(true);
        setUsedAutoLocation(false);
        setShowManualLocation(true);
        setRefreshingLocation(false);
        if (showErrorToast) {
          toast.error("Location access denied. Please enter coordinates manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  useEffect(() => {
    if (!locationReady) return;
    void fetchListings();
  }, [fetchListings, locationReady]);

  const handleApplyManualLocation = async () => {
    if (!hasValidCoordinates) {
      toast.error("Please enter valid latitude and longitude values.");
      return;
    }

    setPage(0);
    setLocationReady(true);
    setUsedAutoLocation(false);
    await fetchListings();
  };

  const handleRetryAutoLocation = () => {
    requestCurrentLocation(true);
  };

  const locationSummary = usedAutoLocation
    ? "Using your current location for nearby discovery."
    : hasValidCoordinates
    ? "Using manually entered coordinates for nearby discovery."
    : "Add your coordinates to discover nearby jewellery.";

  return (
    <AuthGuard allowedRoles={["BUYER"]}>
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 px-6 py-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                <Search className="h-4 w-4" />
                Nearby discovery
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl">Explore Gold Jewellery</h1>
              <p className="mt-2 max-w-2xl text-sm text-amber-100 sm:text-base">
                Find verified gold jewellery available near you, compare rental prices,
                and request bookings with confidence.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Location-aware results</p>
                  <p className="text-amber-100">{locationSummary}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
            />

            <Select
              label="Search radius"
              options={radiusOptions}
              value={radiusKm}
              onChange={(e) => {
                setRadiusKm(e.target.value);
                setPage(0);
              }}
            />

            <Input
              label="Latitude"
              type="number"
              step="any"
              placeholder="e.g. 12.9716"
              value={latitude}
              onChange={(e) => {
                setLatitude(e.target.value);
                setPage(0);
              }}
            />

            <Input
              label="Longitude"
              type="number"
              step="any"
              placeholder="e.g. 77.5946"
              value={longitude}
              onChange={(e) => {
                setLongitude(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              {showManualLocation
                ? "Automatic location could not be used. You can search with manual coordinates."
                : "We use your location to show nearby suppliers and reduce pickup friction."}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetryAutoLocation}
                loading={refreshingLocation}
              >
                Use current location
              </Button>
              <Button type="button" onClick={handleApplyManualLocation}>
                Update search
              </Button>
            </div>
          </div>
        </section>

        {!locationReady || loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-sm text-gray-500">
                {!locationReady
                  ? "Detecting your location..."
                  : "Loading nearby jewellery..."}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800">Unable to load listings</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <div className="mt-4 flex justify-center">
              <Button type="button" onClick={() => void fetchListings()}>
                Try again
              </Button>
            </div>
          </div>
        ) : !hasValidCoordinates ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white">
            <EmptyState
              icon={MapPin}
              title="Location needed to explore nearby jewellery"
              description="Allow device location access or enter valid latitude and longitude manually to continue."
            />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white">
            <EmptyState
              icon={Search}
              title="No jewellery found nearby"
              description="Try increasing the radius, changing the category, or searching from a different location."
            />
          </div>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Available near you</h2>
                <p className="text-sm text-gray-500">
                  {pageData?.totalElements ?? items.length} listing(s) found within {radiusKm} km
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <JewelleryCard key={item.id} item={item} />
              ))}
            </div>

            {pageData && (
              <Pagination
                currentPage={pageData.pageNumber}
                totalPages={pageData.totalPages}
                onPageChange={setPage}
              />
            )}
          </section>
        )}
      </div>
    </AuthGuard>
  );
}
