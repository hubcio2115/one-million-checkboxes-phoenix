import { createInertiaApp } from "@inertiajs/react";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import RootLayout from "./Layout";

export function render(page) {
  return createInertiaApp({
    layout: () => RootLayout,
    page,
    render: renderToString,
    resolve: async (name) => {
      const page = await import(`./pages/${name}.tsx`);
      return page;
    },
    setup: ({ App, props }) => (
      <StrictMode>
        <App {...props} />
      </StrictMode>
    ),
  });
}
