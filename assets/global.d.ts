// global.d.ts
import "@inertiajs/core";

declare module "@inertiajs/core" {
  export interface InertiaConfig {
    sharedPageProps: {};
    flashDataType: {};
    errorValueType: string[];
  }
}
