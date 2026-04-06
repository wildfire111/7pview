// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ResultsDisplay from "../ResultsDisplay";

vi.mock("@/lib/statistics", () => ({
    calculatePerformanceDelta: vi.fn(() => ({
        delta: -0.05,
        CI: 0.02,
        inc_count: 10,
        inv_count: 90,
    })),
}));

vi.mock("@/components/StatBoxBlock", () => ({
    default: () => <div data-testid="stat-box-block" />,
}));

vi.mock("@/components/DateControls", () => ({
    default: () => <div data-testid="date-controls" />,
}));

vi.mock("@/components/DeckTable", () => ({
    default: ({ rows }) => <div data-testid="deck-table" data-rows={rows?.length ?? 0} />,
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

const mockFetch = vi.fn();

beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

const makeRow = (date = "2024-06-15T00:00:00Z") => ({
    deck_id: 1,
    event_date: date,
    event_name: "Test Event",
    player_name: "Alice",
    archetype: "Aggro",
    raw_placement: 1,
    max_players: 32,
    normalised_placement: 0.03,
});

const statsResponse = {
    lastChanged: "2024-01-01T00:00:00Z",
    commitMessage: "Update points",
    commitUrl: "https://github.com/example",
};

describe("ResultsDisplay — loading state", () => {
    it("shows loading indicator before fetch resolves", () => {
        mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
        render(
            <ResultsDisplay
                rawName="Sol Ring"
                includes={[makeRow()]}
                excludes={[]}
                searchParams={{}}
            />
        );
        expect(screen.getByText(/Loading statistics/)).toBeInTheDocument();
    });
});

describe("ResultsDisplay — empty includes", () => {
    it("shows 'No results found' when includes is empty after loading", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(statsResponse),
        });

        render(
            <ResultsDisplay
                rawName="Sol Ring"
                includes={[]}
                excludes={[]}
                searchParams={{}}
            />
        );

        await waitFor(() =>
            expect(screen.queryByText(/Loading statistics/)).not.toBeInTheDocument()
        );
        expect(screen.getByText(/No results found/)).toBeInTheDocument();
    });
});

describe("ResultsDisplay — with data", () => {
    beforeEach(() => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(statsResponse),
        });
    });

    it("renders card name as h1 after loading", async () => {
        render(
            <ResultsDisplay
                rawName="Sol Ring"
                includes={[makeRow()]}
                excludes={[]}
                searchParams={{}}
            />
        );

        await waitFor(() => expect(screen.getByText("Sol Ring")).toBeInTheDocument());
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sol Ring");
    });

    it("renders multiline card name as separate divs", async () => {
        render(
            <ResultsDisplay
                rawName={"Line One\nLine Two"}
                includes={[makeRow()]}
                excludes={[]}
                searchParams={{}}
            />
        );

        await waitFor(() => expect(screen.getByText("Line One")).toBeInTheDocument());
        expect(screen.getByText("Line Two")).toBeInTheDocument();
    });

    it("renders StatBoxBlock", async () => {
        render(
            <ResultsDisplay
                rawName="Sol Ring"
                includes={[makeRow()]}
                excludes={[]}
                searchParams={{}}
            />
        );

        await waitFor(() =>
            expect(screen.getByTestId("stat-box-block")).toBeInTheDocument()
        );
    });

    it("renders DateControls", async () => {
        render(
            <ResultsDisplay
                rawName="Sol Ring"
                includes={[makeRow()]}
                excludes={[]}
                searchParams={{}}
            />
        );

        await waitFor(() =>
            expect(screen.getByTestId("date-controls")).toBeInTheDocument()
        );
    });

    it("renders DeckTable", async () => {
        render(
            <ResultsDisplay
                rawName="Sol Ring"
                includes={[makeRow()]}
                excludes={[]}
                searchParams={{}}
            />
        );

        await waitFor(() =>
            expect(screen.getByTestId("deck-table")).toBeInTheDocument()
        );
    });

    it("falls back gracefully when fetch fails", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"));

        render(
            <ResultsDisplay
                rawName="Sol Ring"
                includes={[makeRow()]}
                excludes={[]}
                searchParams={{}}
            />
        );

        await waitFor(() => expect(screen.getByText("Sol Ring")).toBeInTheDocument());
        // Should still render with fallback pointsInfo
        expect(screen.getByTestId("stat-box-block")).toBeInTheDocument();
    });
});
