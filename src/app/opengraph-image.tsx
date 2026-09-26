import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/site";

/*
 * The preview card shown when a link to the site is shared (WhatsApp,
 * LinkedIn, X…). Generated once at build time in the site's own palette.
 */
export const alt = "Fadhlan Bani, web developer and designer from Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAME = "Fadhlan Bani";
const LINE = "Web developer & designer from Indonesia";
const URL_TEXT = SITE_HOST;

/**
 * A Google font subset to just the characters it has to draw. Google Fonts
 * serves TrueType to a non-browser client, which is what the renderer reads.
 */
async function loadFont(family: string, weight: number, text: string) {
    try {
        const css = await (
            await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
        ).text();
        const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
        return url ? await (await fetch(url)).arrayBuffer() : null;
    } catch {
        return null;
    }
}

export default async function OpengraphImage() {
    const [serif, sans] = await Promise.all([
        loadFont("Cormorant+Garamond", 500, NAME),
        loadFont("Geist", 400, LINE + URL_TEXT),
    ]);
    /*
     * Both or neither. Each font is subset, so with only one loaded the
     * renderer would draw whichever letters it happens to contain in that
     * face and the rest in its fallback — a line of mixed type.
     */
    const custom = serif && sans;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "80px",
                    background: "radial-gradient(ellipse 70% 90% at 100% 20%, #2f5a44 0%, #14261c 45%, #0d1011 80%)",
                    color: "#e7ebed",
                    fontFamily: custom ? "Geist" : undefined,
                }}
            >
                <div style={{ display: "flex", fontSize: 30, color: "#8f999d" }}>{LINE}</div>
                <div
                    style={{
                        display: "flex",
                        marginTop: 12,
                        fontSize: 150,
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                        fontFamily: custom ? "Cormorant" : undefined,
                    }}
                >
                    {NAME}
                </div>
                <div style={{ display: "flex", alignItems: "center", marginTop: 44, gap: 20 }}>
                    <div style={{ display: "flex", width: 64, height: 2, background: "#bf9d5f" }} />
                    <div style={{ display: "flex", fontSize: 26, color: "#bf9d5f" }}>{URL_TEXT}</div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: custom
                ? [
                      { name: "Cormorant", data: serif, weight: 500, style: "normal" },
                      { name: "Geist", data: sans, weight: 400, style: "normal" },
                  ]
                : undefined,
        }
    );
}
