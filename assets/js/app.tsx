import axios from "axios";

import { createInertiaApp } from "@inertiajs/react";
import { StrictMode, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import RootLayout from "./Layout";

axios.defaults.xsrfHeaderName = "x-csrf-token";

createInertiaApp({
  resolve: async (name) => {
    const page = await import(`./pages/${name}.tsx`);
    page.default.layout =
      page.default.layout || ((page: ReactNode) => <RootLayout>{page}</RootLayout>);

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
