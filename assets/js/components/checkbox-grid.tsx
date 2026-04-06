import { InfiniteScroll } from "@inertiajs/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, type ChangeEvent } from "react";
import { base64ToBuffer, getBit, setBit } from "~/lib/binary-utils";
import { useCheckboxChannel } from "~/lib/useCheckboxChannel";
import { Spinner } from "./ui/spinner";

/** 1_000_000 / 8 bits  */
const TOTAL_BYTES = 125_000;
const COLUMNS = 40;

export interface CheckboxPage {
  data: string[];
  meta: {
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    pageName: string;
  };
}

interface CheckboxGridProps {
  checkboxes: CheckboxPage;
  rowsPerChunk: number;
}

export function CheckboxGrid({ checkboxes, rowsPerChunk }: CheckboxGridProps) {
  const { data: chunks } = checkboxes;

  const socket = useCheckboxChannel([
    "checked",
    (resp: { index: number; checked: boolean }) => {
      setBit(byteBuffer.current, resp.index, resp.checked);
      const el = parentRef.current?.querySelector<HTMLInputElement>(`[data-index="${resp.index}"]`);
      if (el) el.checked = resp.checked;
    },
  ]);

  function onChecked(e: ChangeEvent<HTMLInputElement>, index: number) {
    setBit(byteBuffer.current, index, e.target.checked);

    socket.current?.push("checked", { index, checked: e.target.checked });
  }

  const initialBuffer = useMemo(() => {
    const buf = new Uint8Array(TOTAL_BYTES);
    buf.set(base64ToBuffer(chunks[0]), 0);
    return buf;
  }, []);

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
    <div className="relative h-125 w-full">
      <div ref={parentRef} className="h-full w-full overflow-auto">
        <InfiniteScroll data="checkboxes" onlyNext buffer={5}>
          {({ loading }) => (
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
                        onChange={(e) => onChecked(e, index)}
                        defaultChecked={getBit(byteBuffer.current, index)}
                        key={`${virtualRow.index}-${virtualColumn.index}`}
                        data-index={index}
                        className="absolute top-0 left-0 size-7.5 accent-pink-500"
                        style={{
                          transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                        }}
                      />
                    );
                  }),
                )}
              </div>

              {loading && (
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
