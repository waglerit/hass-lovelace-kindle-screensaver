const fs = require("fs");
const path = require("path");

// Load HA add-on options from /data/options.json if available
let haOptions = {};
const optionsPath = "/data/options.json";
try {
  if (fs.existsSync(optionsPath)) {
    haOptions = JSON.parse(fs.readFileSync(optionsPath, "utf8"));
    console.log("Loaded HA add-on options from /data/options.json");
  }
} catch (e) {
  console.warn("Failed to read /data/options.json:", e.message);
}

function getEnvironmentVariable(key, suffix, fallbackValue) {
  const value = process.env[key + suffix];
  if (value !== undefined) return value;
  // Fall back to HA add-on options
  const haValue = haOptions[key + suffix];
  if (haValue !== undefined) return String(haValue);
  if (fallbackValue !== undefined) return fallbackValue;
  // Fall back to base key from env, then HA options
  return process.env[key] || (haOptions[key] !== undefined ? String(haOptions[key]) : undefined);
}

function getPagesConfig() {
  const pages = [];
  let i = 0;
  while (++i) {
    const suffix = i === 1 ? "" : `_${i}`;
    const screenShotUrl = process.env[`HA_SCREENSHOT_URL${suffix}`] || haOptions[`HA_SCREENSHOT_URL${suffix}`];
    if (!screenShotUrl) return pages;
    pages.push({
      screenShotUrl,
      imageFormat: getEnvironmentVariable("IMAGE_FORMAT", suffix) || "png",
      outputPath: getEnvironmentVariable(
        "OUTPUT_PATH",
        suffix,
        `output/cover${suffix}`
      ),
      renderingDelay: getEnvironmentVariable("RENDERING_DELAY", suffix) || 0,
      renderingScreenSize: {
        height:
          getEnvironmentVariable("RENDERING_SCREEN_HEIGHT", suffix) || 800,
        width: getEnvironmentVariable("RENDERING_SCREEN_WIDTH", suffix) || 600,
      },
      grayscaleDepth: getEnvironmentVariable("GRAYSCALE_DEPTH", suffix) || 8,
      removeGamma: getEnvironmentVariable("REMOVE_GAMMA", suffix) === "true" || false,
      blackLevel: getEnvironmentVariable("BLACK_LEVEL", suffix) || "0%",
      whiteLevel: getEnvironmentVariable("WHITE_LEVEL", suffix) || "100%",
      dither: getEnvironmentVariable("DITHER", suffix) === "true" || false,
      colorMode: getEnvironmentVariable("COLOR_MODE", suffix) || "GrayScale",
      prefersColorScheme: getEnvironmentVariable("PREFERS_COLOR_SCHEME", suffix) || "light",
      rotation: getEnvironmentVariable("ROTATION", suffix) || 0,
      scaling: getEnvironmentVariable("SCALING", suffix) || 1,
      batteryWebHook: getEnvironmentVariable("HA_BATTERY_WEBHOOK", suffix) || null,
      saturation: getEnvironmentVariable("SATURATION", suffix) || 1,
      contrast: getEnvironmentVariable("CONTRAST", suffix) || 1,
    });
  }
  return pages;
}

module.exports = {
  baseUrl: process.env.HA_BASE_URL || haOptions.HA_BASE_URL,
  accessToken: process.env.HA_ACCESS_TOKEN || haOptions.HA_ACCESS_TOKEN,
  cronJob: process.env.CRON_JOB || haOptions.CRON_JOB || "* * * * *",
  useImageMagick: (process.env.USE_IMAGE_MAGICK || haOptions.USE_IMAGE_MAGICK) === "true",
  pages: getPagesConfig(),
  port: process.env.PORT || haOptions.PORT || 5000,
  renderingTimeout: process.env.RENDERING_TIMEOUT || haOptions.RENDERING_TIMEOUT || 10000,
  browserLaunchTimeout: process.env.BROWSER_LAUNCH_TIMEOUT || haOptions.BROWSER_LAUNCH_TIMEOUT || 30000,
  language: process.env.LANGUAGE || haOptions.LANGUAGE || "en",
  debug: (process.env.DEBUG || haOptions.DEBUG) === "true",
  ignoreCertificateErrors:
    (process.env.UNSAFE_IGNORE_CERTIFICATE_ERRORS || haOptions.UNSAFE_IGNORE_CERTIFICATE_ERRORS) === "true",
};
