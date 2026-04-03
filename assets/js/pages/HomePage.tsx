import { Suspense } from "react";
import { CheckboxGrid, type CheckboxPage } from "~/components/checkbox-grid";
import { Spinner } from "~/components/ui/spinner";

interface HomePageProps {
  checkboxes: CheckboxPage;
  rowsPerChunk: number;
}

export default function HomePage({ checkboxes, rowsPerChunk }: HomePageProps) {
  return (
    <>
      <h1 className="text-2xl font-bold">Million Checkboxes</h1>

      <Suspense fallback={<CheckboxGridSkeleton />}>
        <CheckboxGrid checkboxes={checkboxes} rowsPerChunk={rowsPerChunk} />
      </Suspense>
    </>
  );
}

function CheckboxGridSkeleton() {
  return (
    <div className="h-125 w-full border border-[#ccc] flex items-center justify-center">
      <Spinner className="size-10" />
    </div>
  );
}
