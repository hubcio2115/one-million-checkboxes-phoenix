import { createInertiaApp } from "@inertiajs/react";
import { StrictMode, type ReactNode } from "react";
import ReactDOMServer from "react-dom/server";
import RootLayout from "./Layout";

export function render(page) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: async (name) => {
      const page = await import(`./pages/${name}.tsx`);

      page.default.layout =
        page.default.layout || ((page: ReactNode) => <RootLayout>{page}</RootLayout>);

      return page;
    },
    setup: ({ App, props }) => (
      <StrictMode>
        <App {...props} />
      </StrictMode>
    ),
  });
}
