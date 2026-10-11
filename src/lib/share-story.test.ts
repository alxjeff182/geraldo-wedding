import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shareStoryTemplate } from "./share-story";

const TEMPLATE_URL = "/assets/ballroom/story-template.png";
const PNG_BYTES = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function mockFetchOk() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => new Blob([PNG_BYTES], { type: "image/png" }),
    }),
  );
}

describe("shareStoryTemplate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockFetchOk();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns error when url is empty", async () => {
    const result = await shareStoryTemplate("", "#Tag");
    expect(result).toEqual({ status: "error", message: "Template belum tersedia" });
  });

  it("returns error when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, blob: async () => new Blob() }),
    );
    const result = await shareStoryTemplate(TEMPLATE_URL, "#Tag");
    expect(result.status).toBe("error");
  });

  it("uses navigator.share with files when canShare allows it", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", {
      ...navigator,
      share,
      canShare,
      clipboard: { writeText: vi.fn() },
    });

    const result = await shareStoryTemplate(TEMPLATE_URL, "GeraldoChristin2026");

    expect(canShare).toHaveBeenCalled();
    expect(share).toHaveBeenCalledOnce();
    const payload = share.mock.calls[0][0] as ShareData;
    expect(payload.files?.[0]).toBeInstanceOf(File);
    expect(payload.text).toBe("#GeraldoChristin2026");
    expect(result).toEqual({ status: "shared" });
  });

  it("returns aborted when user cancels the share sheet", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError"));
    vi.stubGlobal("navigator", {
      ...navigator,
      share,
      canShare: () => true,
      clipboard: { writeText: vi.fn() },
    });

    const result = await shareStoryTemplate(TEMPLATE_URL, "#Tag");
    expect(result).toEqual({ status: "aborted" });
  });

  it("falls back to download + clipboard + IG deep link when files cannot be shared", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      share: undefined,
      canShare: undefined,
      clipboard: { writeText },
    });

    const createObjectURL = vi.fn().mockReturnValue("blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });

    const click = vi.fn();
    const appendChild = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    const remove = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          rel: "",
          click,
          remove,
        } as unknown as HTMLAnchorElement;
      }
      return document.createElementNS("http://www.w3.org/1999/xhtml", tag) as HTMLElement;
    });

    const hrefSetter = vi.fn();
    const original = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...original,
        get href() {
          return "http://localhost/";
        },
        set href(v: string) {
          hrefSetter(v);
        },
      },
    });

    const result = await shareStoryTemplate(
      TEMPLATE_URL,
      "#GeraldoChristin2026",
      "Custom fallback",
    );

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith("#GeraldoChristin2026");
    expect(hrefSetter).toHaveBeenCalledWith("instagram://story-camera");
    expect(result).toEqual({ status: "fallback", message: "Custom fallback" });

    appendChild.mockRestore();
    Object.defineProperty(window, "location", { configurable: true, value: original });
  });
});
