/**
 * Global test setup for jsdom environment.
 * Provides stubs for browser APIs not available in jsdom.
 */

// IntersectionObserver is used by Angular's @defer (on viewport) blocks
// but is not available in jsdom.
class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '0px';
    readonly thresholds: ReadonlyArray<number> = [0];

    constructor(private callback: IntersectionObserverCallback) {}

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
}

globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
