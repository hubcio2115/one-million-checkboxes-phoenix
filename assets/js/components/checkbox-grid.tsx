import { InfiniteScroll } from "@inertiajs/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { use, useEffect, useRef, useState } from "react";
import { base64ToBuffer, getBit, setBit } from "~/lib/binary-utils";
import { Spinner } from "./ui/spinner";

const COLUMNS = 40;
const TOTAL_BYTES = 125_000; // 1_000_000 bits / 8

export interface CheckboxPage {
  data: string[];
  meta: {
    current_page: number;
    next_page: number | null;
    previous_page: number | null;
    page_name: string;
  };
}

interface CheckboxGridProps {
  checkboxes: CheckboxPage;
  rowsPerChunk: number;
}

export function CheckboxGrid({ checkboxes, rowsPerChunk }: CheckboxGridProps) {
  const { data: chunks } = checkboxes;

  // Create the buffer promise once per component lifetime. Wrapping in Promise.resolve().then()
  // ensures it's always async so React can show the Suspense fallback for at least one frame.
  const [initPromise] = useState<Promise<Uint8Array>>(() =>
    Promise.resolve().then(() => {
      const buf = new Uint8Array(TOTAL_BYTES);
      buf.set(base64ToBuffer(chunks[0]), 0);
      return buf;
    }),
  );

  // Suspends on first render until the buffer is ready; on retry returns the resolved value.
  const initialBuffer = use(initPromise);

  // First chunk is already in the buffer from the promise above.
  const byteBuffer = useRef(initialBuffer);
  const loadedChunksRef = useRef(1);
  const parentRef = useRef<HTMLDivElement>(null);

  // Sync any subsequent chunks appended by Inertia's mergeProps.
  // Each row is exactly 5 bytes (40 cols / 8 bits), so chunk i starts at i * rowsPerChunk * 5.
  useEffect(() => {
    for (let i = loadedChunksRef.current; i < chunks.length; i++) {
      byteBuffer.current.set(base64ToBuffer(chunks[i]), i * rowsPerChunk * 5);
    }
    loadedChunksRef.current = chunks.length;
  }, [chunks.length, rowsPerChunk]);

  const loadedRows = chunks.length * rowsPerChunk;

  const gridVirtualizer = useVirtualizer({
    count: loadedRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: COLUMNS,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  return (
    <div className="relative h-125 w-full border border-[#ccc]">
      <div ref={parentRef} className="h-full w-full overflow-auto">
        <InfiniteScroll data="checkboxes" onlyNext buffer={5}>
          {({ loadingNext }) => (
            <>
              <div
                className="relative mx-auto"
                style={{
                  height: `${gridVirtualizer.getTotalSize()}px`,
                  width: `${columnVirtualizer.getTotalSize()}px`,
                }}
              >
                {gridVirtualizer.getVirtualItems().map((virtualRow) =>
                  columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                    const index = virtualRow.index * COLUMNS + virtualColumn.index;

                    return (
                      <input
                        type="checkbox"
                        onChange={(e) => setBit(byteBuffer.current, index, e.target.checked)}
                        defaultChecked={getBit(byteBuffer.current, index)}
                        key={`${virtualRow.index}-${virtualColumn.index}`}
                        className="absolute top-0 left-0 size-7.5"
                        style={{
                          transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                        }}
                      />
                    );
                  }),
                )}
              </div>

              {loadingNext && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <Spinner className="size-10" />
                </div>
              )}
            </>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}
