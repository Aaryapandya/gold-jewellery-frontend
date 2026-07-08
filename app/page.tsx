import Link from "next/link";
import { Gem, MapPin, Shield, Star } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Authentic Gold",
    description:
      "Every listing is verified by our team with purchase bills and identity checks.",
  },
  {
    icon: MapPin,
    title: "Near You",
    description:
      "Discover jewellery within kilometres of your location for easy pickup and return.",
  },
  {
    icon: Shield,
    title: "Secure Booking",
    description:
      "Supplier-approved bookings, identity verification, and full booking lifecycle management.",
  },
  {
    icon: Star,
    title: "Special Occasions",
    description:
      "Wedding, engagement, puja — rent for the exact days you need at a fraction of the price.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400 px-6 py-20 text-center shadow-xl mb-16">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle,_#fff_1px,_transparent_1px)] [background-size:24px_24px]" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
            <Gem className="h-4 w-4" />
            India&apos;s Gold Jewellery Rental Platform
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Wear Gold.
            <br />
            Don&apos;t Buy It.
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-amber-100 sm:text-lg">
            Rent authentic 22K gold jewellery for weddings and celebrations.
            List yours and earn. No ownership required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="rounded-full bg-white px-7 py-3 font-semibold text-amber-700 shadow-md hover:bg-amber-50 transition-colors"
            >
              Explore Jewellery
            </Link>
            <Link
              href="/register"
              className="rounded-full border-2 border-white px-7 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              List Your Jewellery
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Why GoldRent?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <Icon className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gray-900 px-6 py-14 text-center mb-8">
        <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
          Ready to get started?
        </h2>
        <p className="mb-6 text-gray-400">
          Join thousands of buyers and suppliers already on GoldRent.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-amber-500 px-7 py-3 font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Register as Buyer
          </Link>
          <Link
            href="/register?role=SUPPLIER"
            className="rounded-full border border-gray-600 px-7 py-3 font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Become a Supplier
          </Link>
        </div>
      </section>
    </div>
  );
}
