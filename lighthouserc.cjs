/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      numberOfRuns: 3,
      settings: {
        // Desktop lab scores are stable on GH runners. Mobile UX is covered by
        // Playwright iphone-se / pixel-7 projects.
        preset: "desktop",
        chromeFlags: "--no-sandbox --headless --disable-gpu",
      },
    },
    assert: {
      // Median of 3 runs. Skip host audits that never apply to LHCI's local HTTP server.
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
        "is-on-https": "off",
        "uses-http2": "off",
        "bf-cache": "off",
        "csp-xss": "off",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
