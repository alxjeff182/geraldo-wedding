import type { Page } from "@playwright/test";

/** Freeze `Date` in the page (for RSVP deadline before wedding). */
export async function freezeBrowserTime(page: Page, iso: string) {
  const time = new Date(iso).getTime();
  await page.addInitScript((fixed) => {
    const RealDate = Date;
    class MockDate extends RealDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(fixed);
          return;
        }
        super(...(args as ConstructorParameters<typeof Date>));
      }
      static now() {
        return fixed;
      }
    }
    Object.assign(MockDate, RealDate);
    // @ts-expect-error test shim
    globalThis.Date = MockDate;
  }, time);
}
