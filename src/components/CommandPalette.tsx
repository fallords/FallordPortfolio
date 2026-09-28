"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EMAIL, SOCIALS } from "@/lib/site";
import { hasEssays } from "@/content/writing";
import { TOGGLE_GRID_EVENT } from "./GridOverlay";

export const OPEN_PALETTE_EVENT = "open-palette";

type Command = { group: string; label: string; hint?: string; run: () => void | "keep-open" };

/**
 * ⌘K / Ctrl+K (or "/") opens a keyboard-first menu of everything the site
 * can do: jump to a section, copy the email, open a profile, show the grid.
 *
 * It is a combobox, not a pile of divs: focus stays in the input, the
 * highlighted row is announced through aria-activedescendant, and ↑ ↓ ↵ esc
 * behave the way they do in every editor.
 */
export default function CommandPalette() {
    const router = useRouter();
    const pathname = usePathname();
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [index, setIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    const close = () => {
        setOpen(false);
        setQuery("");
        setIndex(0);
        setCopied(false);
    };

    const commands = useMemo<Command[]>(() => {
        const go = (id: string) => () => {
            if (pathname === "/") document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            else router.push(`/#${id}`);
        };
        return [
            { group: "Go to", label: "Work", hint: "01", run: go("work") },
            { group: "Go to", label: "What I do", hint: "02", run: go("about") },
            { group: "Go to", label: "Certificates", hint: "03", run: go("certificates") },
            ...(hasEssays ? [{ group: "Go to", label: "Writing", hint: "04", run: go("writing") }] : []),
            { group: "Go to", label: "Contact", hint: "05", run: go("contact") },
            {
                group: "Contact",
                label: copied ? "Copied to clipboard" : "Copy email address",
                hint: EMAIL,
                run: () => {
                    navigator.clipboard?.writeText(EMAIL).then(() => {
                        setCopied(true);
                        setTimeout(close, 700);
                    });
                    return "keep-open";
                },
            },
            { group: "Contact", label: "Send an email", run: () => void (window.location.href = `mailto:${EMAIL}`) },
            ...SOCIALS.map((s) => ({
                group: "Contact",
                label: `Open ${s.label}`,
                hint: "↗",
                run: () => void window.open(s.href, "_blank", "noopener,noreferrer"),
            })),
            { group: "View", label: "Toggle layout grid", hint: "G", run: () => void window.dispatchEvent(new Event(TOGGLE_GRID_EVENT)) },
            { group: "View", label: "Back to top", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
        ];
    }, [pathname, router, copied]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q)) : commands;
    }, [commands, query]);

    // Global shortcuts.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName);
            if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            } else if (e.key === "/" && !typing && !open) {
                e.preventDefault();
                setOpen(true);
            }
        };
        const onOpen = () => setOpen(true);
        window.addEventListener("keydown", onKey);
        window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
        };
    }, [open]);

    // Focus the input on open, and hand focus back to where it was on close.
    useEffect(() => {
        if (!open) return;
        const opener = document.activeElement as HTMLElement | null;
        inputRef.current?.focus();
        return () => opener?.focus({ preventScroll: true });
    }, [open]);

    if (!open) return null;

    const run = (c: Command | undefined) => {
        if (!c) return;
        if (c.run() !== "keep-open") close();
    };

    const onInputKey = (e: React.KeyboardEvent) => {
        // The palette can sit over the certificate viewer, which listens for
        // the same keys on document. Next hydrates React onto the document
        // itself, so both listeners share a node: stopPropagation can't
        // separate them, stopImmediatePropagation (React's runs first) can.
        if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(e.key)) {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((i) => (i + 1) % Math.max(results.length, 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            run(results[index]);
        } else if (e.key === "Escape") {
            close();
        }
    };

    let lastGroup = "";

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-[var(--surface)]/70 px-4 pt-[18vh] backdrop-blur-sm" onClick={close}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Command menu"
                onClick={(e) => e.stopPropagation()}
                className="fade-in w-full max-w-lg border border-[var(--rule-strong)] bg-[var(--surface-card)] shadow-2xl shadow-black/60"
                style={{ animationDuration: "150ms" }}
            >
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIndex(0);
                    }}
                    onKeyDown={onInputKey}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="palette-list"
                    aria-activedescendant={results[index] ? `palette-${index}` : undefined}
                    placeholder="Search or jump to…"
                    className="h-14 w-full border-b border-[var(--rule)] bg-transparent px-5 text-[15px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-dim)]"
                />

                <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
                    {results.length === 0 && <li className="px-5 py-6 text-sm text-[var(--fg-dim)]">No matches.</li>}
                    {results.map((c, i) => {
                        const header = c.group !== lastGroup ? c.group : null;
                        lastGroup = c.group;
                        return (
                            <li key={`${c.group}-${c.label}`} role="presentation">
                                {header && <p className="px-5 pt-3 pb-1 text-xs text-[var(--fg-dim)]">{header}</p>}
                                <div
                                    id={`palette-${i}`}
                                    role="option"
                                    aria-selected={i === index}
                                    onMouseMove={() => setIndex(i)}
                                    onClick={() => run(c)}
                                    className={`mx-2 flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm ${
                                        i === index ? "bg-[var(--cloak)] text-[var(--fg)]" : "text-[var(--fg-soft)]"
                                    }`}
                                >
                                    <span>{c.label}</span>
                                    {c.hint && <span className="font-mono text-xs text-[var(--fg-dim)]">{c.hint}</span>}
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <p className="flex gap-4 border-t border-[var(--rule)] px-5 py-2.5 font-mono text-[11px] text-[var(--fg-dim)]">
                    <span>↑↓ move</span>
                    <span>↵ select</span>
                    <span>esc close</span>
                </p>
            </div>
        </div>
    );
}
