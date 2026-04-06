// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Leaderboard from "../Leaderboard";

vi.mock("@heroui/react", () => ({
    Card: ({ children }) => <div>{children}</div>,
    CardBody: ({ children }) => <div>{children}</div>,
    CardHeader: ({ children }) => <div>{children}</div>,
    Chip: ({ children }) => <span>{children}</span>,
    Divider: () => <hr />,
    Table: ({ children, "aria-label": label }) => <table aria-label={label}>{children}</table>,
    TableHeader: ({ children }) => <thead><tr>{children}</tr></thead>,
    TableColumn: ({ children }) => <th>{children}</th>,
    TableBody: ({ children }) => <tbody>{children}</tbody>,
    TableRow: ({ children }) => <tr>{children}</tr>,
    TableCell: ({ children }) => <td>{children}</td>,
    Skeleton: () => <div data-testid="skeleton" />,
    Tooltip: ({ children }) => <>{children}</>,
}));

vi.mock("next/link", () => ({
    default: ({ href, children }) => <a href={href}>{children}</a>,
}));

vi.mock("lucide-react", () => ({
    Info: () => <span data-testid="info-icon" />,
}));

const makeCard = (name, rank, delta, CI) => ({
    scryfall_id: `id-${name}`,
    name,
    rank,
    delta,
    CI,
});

const makeData = (cards) => ({ top_cards: cards });

describe("Leaderboard — loading state", () => {
    it("renders skeletons when isLoading is true", () => {
        render(<Leaderboard title="All Time" isLoading={true} />);
        expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    });

    it("does not render a table when loading", () => {
        render(<Leaderboard title="All Time" isLoading={true} />);
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
});

describe("Leaderboard — empty/null data", () => {
    it("shows 'No data' when data is null", () => {
        render(<Leaderboard title="All Time" data={null} />);
        expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("shows 'No cards found' when top_cards is empty", () => {
        render(<Leaderboard title="All Time" data={makeData([])} />);
        expect(screen.getByText(/No cards found/)).toBeInTheDocument();
    });

    it("renders title even when no data", () => {
        render(<Leaderboard title="Last Year" data={null} />);
        expect(screen.getByText("Last Year")).toBeInTheDocument();
    });
});

describe("Leaderboard — with data", () => {
    const cards = [
        makeCard("Sol Ring", 1, -0.05, 0.02),
        makeCard("Black Lotus", 2, -0.08, 0.03),
    ];

    it("renders card names as links", () => {
        render(<Leaderboard title="All Time" data={makeData(cards)} />);
        expect(screen.getByText("Sol Ring")).toBeInTheDocument();
        expect(screen.getByText("Black Lotus")).toBeInTheDocument();
    });

    it("links to correct /card/ URL", () => {
        render(<Leaderboard title="All Time" data={makeData(cards)} />);
        const link = screen.getByText("Sol Ring").closest("a");
        expect(link).toHaveAttribute("href", "/card/Sol%20Ring");
    });

    it("renders rank numbers", () => {
        render(<Leaderboard title="All Time" data={makeData(cards)} />);
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("renders delta as positive when delta is negative (inverted display)", () => {
        // delta = -0.05 → (delta * 100).toFixed(2) * -1 = 5 → "+5%"
        render(<Leaderboard title="All Time" data={makeData(cards)} />);
        expect(screen.getByText(/\+5/)).toBeInTheDocument();
    });

    it("renders CI as ± percentage", () => {
        render(<Leaderboard title="All Time" data={makeData(cards)} />);
        expect(screen.getByText("±2.00%")).toBeInTheDocument();
    });

    it("shows 'Top N' chip", () => {
        render(<Leaderboard title="All Time" data={makeData(cards)} showCount={10} />);
        expect(screen.getByText("Top 10")).toBeInTheDocument();
    });

    it("respects showCount — only renders up to that many rows", () => {
        const manyCards = Array.from({ length: 20 }, (_, i) =>
            makeCard(`Card ${i}`, i + 1, -0.01, 0.01)
        );
        render(<Leaderboard title="All Time" data={makeData(manyCards)} showCount={5} />);
        // Rows 1–5 rendered, not 6+
        expect(screen.getByText("Card 0")).toBeInTheDocument();
        expect(screen.queryByText("Card 5")).not.toBeInTheDocument();
    });
});
