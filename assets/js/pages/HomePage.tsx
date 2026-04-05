import { CheckboxGrid, type CheckboxPage } from "~/components/checkbox-grid";

interface HomePageProps {
  checkboxes: CheckboxPage;
  rowsPerChunk: number;
}

export default function HomePage({ checkboxes, rowsPerChunk }: HomePageProps) {
  return (
    <>
      <h1 className="text-2xl font-bold">Million Checkboxes</h1>

      <CheckboxGrid checkboxes={checkboxes} rowsPerChunk={rowsPerChunk} />
    </>
  );
}
