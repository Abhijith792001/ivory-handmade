import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartDivider, Sprig } from "@/components/brand/botanical";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-28 text-center">
      <Sprig className="h-36 w-24 opacity-70" />
      <p className="mt-4 font-script text-6xl">Oh dear</p>
      <h1 className="mt-2 font-serif text-3xl">We couldn&apos;t find that page</h1>
      <HeartDivider className="mt-4" />
      <p className="mt-4 max-w-sm text-muted">It may have been moved, or perhaps it was too lovely and sold out.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Shop</Link>
        </Button>
      </div>
    </div>
  );
}
