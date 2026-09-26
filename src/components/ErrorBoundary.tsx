"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps one broken part from taking the page down with it: whatever throws
 * inside is swapped for `fallback` (nothing, if there is none), and the rest
 * of the page keeps working. A failure outside every boundary still lands on
 * app/error.tsx.
 *
 * `fallback` can be a render function, given a `retry` that renders the
 * children again, or plain JSX: a server component can't pass a function
 * across to the client, so it passes the finished element instead.
 *
 * A class, because catching render errors is still class-only in React.
 */
export default class ErrorBoundary extends Component<
    { fallback?: ReactNode | ((retry: () => void) => ReactNode); children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        // Nothing is wired to a reporting service; at least leave a trace.
        console.error(error);
    }

    retry = () => this.setState({ failed: false });

    render() {
        if (!this.state.failed) return this.props.children;
        const { fallback } = this.props;
        return typeof fallback === "function" ? fallback(this.retry) : (fallback ?? null);
    }
}
