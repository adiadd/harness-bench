import Link from "next/link";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { mockHarnesses } from "@/lib/mock-data";

export default function HarnessesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Harnesses</h1>
        <p className="text-muted-foreground">
          Browse available coding harnesses and their capabilities.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockHarnesses.map((harness) => (
          <Card key={harness.slug} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{harness.name}</CardTitle>
                <Badge variant="outline">{harness.provider}</Badge>
              </div>
              <CardDescription>{harness.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-2">
                {harness.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary">
                    {capability}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link
                href={`/harnesses/${harness.slug}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View details
                <ArrowRight className="size-4" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
