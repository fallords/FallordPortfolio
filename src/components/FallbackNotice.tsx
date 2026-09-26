"use client";

/**
 * What stands in for a part of the page that failed: a line saying so and a
 * way to try again. `onRetry` re-renders just that part (an ErrorBoundary's
 * retry); without it the button reloads the page.
 */
export default function FallbackNotice({
    message,
    onRetry,
    className = "",
}: {
    message: string;
    onRetry?: () => void;
    className?: string;
}) {
    return (
        <div role="alert" className={`flex flex-col items-start gap-3 ${className}`}>
            <p className="font-mono text-xs text-[var(--gold)]">Error</p>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--fg-muted)]">{message}</p>
            <button
                type="button"
                onClick={onRetry ?? (() => window.location.reload())}
                className="mt-1 inline-flex h-10 items-center border border-[var(--rule-strong)] px-4 text-sm text-[var(--fg)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
                Try again
            </button>
        </div>
    );
}
