import { createInertiaApp, router } from "@inertiajs/react";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import RootLayout from "./Layout";

router.on("before", (event) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  if (token) {
    event.detail.visit.headers["x-csrf-token"] = token;
  }
});

createInertiaApp({
  layout: () => RootLayout,
  resolve: async (name) => {
    const page = await import(`./pages/${name}.tsx`);
    return page;
  },
  setup({ App, el, props }) {
    hydrateRoot(
      el,
      <StrictMode>
        <App {...props} />
      </StrictMode>,
    );
  },
});
