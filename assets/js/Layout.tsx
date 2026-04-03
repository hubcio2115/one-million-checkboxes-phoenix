import { type PropsWithChildren } from "react";

export default function RootLayout({ children }: PropsWithChildren) {
  return <div className="mx-auto min-h-dvh">{children}</div>;
}
