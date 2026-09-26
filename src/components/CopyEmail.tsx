"use client";

import { useEffect, useState } from "react";
import { EMAIL } from "@/lib/site";

/**
 * A mailto link does nothing useful on a phone with no mail app set up, and
 * many people would rather paste the address into the app they already use.
 */
export default function CopyEmail() {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(t);
    }, [copied]);

    return (
        <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(EMAIL).then(() => setCopied(true), () => {})}
            className="link text-[var(--fg-muted)]"
        >
            <span aria-live="polite">{copied ? "Copied ✓" : "Copy address"}</span>
        </button>
    );
}
