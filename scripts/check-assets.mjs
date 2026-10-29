/*
 * Runs before every build (the "prebuild" script). Every quoted path in src/
 * to an image or PDF in public/ ("/certificates/….jpg", "/frames/still-….jpg",
 * "….pdf") must exist: a typo there would otherwise build fine and ship as a
 * broken image. Paths assembled at runtime (the portrait's frames) aren't
 * quoted whole, so they aren't checked.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PATH = /["'`](\/[\w./-]+\.(?:jpe?g|png|webp|avif|svg|pdf))["'`]/g;

const missing = [];
for (const rel of readdirSync("src", { recursive: true })) {
    if (!/\.tsx?$/.test(rel)) continue;
    const file = join("src", rel);
    for (const [, path] of readFileSync(file, "utf8").matchAll(PATH)) {
        if (!existsSync(join("public", path))) missing.push(`${file}: ${path}`);
    }
}

if (missing.length > 0) {
    console.error(`Not found in public/:\n  ${missing.join("\n  ")}`);
    process.exit(1);
}
