import Link from "next/link";
import { Gem } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
        <Gem className="h-10 w-10 text-amber-300" />
      </div>
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-full bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
