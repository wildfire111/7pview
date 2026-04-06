// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DeckTable from "../DeckTable";

vi.mock("@heroui/react", () => ({
    Table: ({ children, "aria-label": label }) => <table aria-label={label}>{children}</table>,
    TableHeader: ({ children }) => <thead><tr>{children}</tr></thead>,
    TableColumn: ({ children }) => <th>{children}</th>,
    TableBody: ({ children, emptyContent }) => (
        <tbody>{children || <tr><td>{emptyContent}</td></tr>}</tbody>
    ),
    TableRow: ({ children }) => <tr>{children}</tr>,
    TableCell: ({ children }) => <td>{children}</td>,
    Button: ({ children, isDisabled, href }) => (
        <button disabled={isDisabled}>{children}</button>
    ),
    Link: ({ children, href }) => <a href={href}>{children}</a>,
    Chip: ({ children }) => <span>{children}</span>,
    Tooltip: ({ children }) => <>{children}</>,
    Pagination: ({ total, page }) => (
        <div data-testid="pagination" data-total={total} data-page={page} />
    ),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => "/card/Sol%20Ring",
    useSearchParams: () => new URLSearchParams(),
}));

const makeRow = (overrides = {}) => ({
    deck_id: 1,
    event_date: "2024-06-15T00:00:00Z",
    event_name: "Summer Championship",
    player_name: "Alice",
    archetype: "Aggro",
    raw_placement: 3,
    max_players: 32,
    normalised_placement: 0.09375,
    moxfield_id: "abc123",
    ...overrides,
});

describe("DeckTable — empty state", () => {
    it("shows 'No decks found' message when rows is empty", () => {
        render(<DeckTable rows={[]} />);
        expect(screen.getByText(/No decks found/)).toBeInTheDocument();
    });

    it("shows 'No decks found' message when rows is null", () => {
        render(<DeckTable rows={null} />);
        expect(screen.getByText(/No decks found/)).toBeInTheDocument();
    });
});

describe("DeckTable — data rendering", () => {
    it("renders event name", () => {
        render(<DeckTable rows={[makeRow()]} page={1} totalPages={1} />);
        expect(screen.getAllByText("Summer Championship").length).toBeGreaterThan(0);
    });

    it("renders player name", () => {
        render(<DeckTable rows={[makeRow()]} page={1} totalPages={1} />);
        expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("renders archetype", () => {
        render(<DeckTable rows={[makeRow()]} page={1} totalPages={1} />);
        expect(screen.getByText("Aggro")).toBeInTheDocument();
    });

    it("defaults archetype to 'Unknown' when missing", () => {
        render(<DeckTable rows={[makeRow({ archetype: null })]} page={1} totalPages={1} />);
        expect(screen.getByText("Unknown")).toBeInTheDocument();
    });

    it("renders placement as raw/max", () => {
        render(<DeckTable rows={[makeRow()]} page={1} totalPages={1} />);
        expect(screen.getByText("3/32")).toBeInTheDocument();
    });

    it("renders normalised placement as percentage string", () => {
        // 0.09375 * 100 = 9.375 → toFixed(1) = "9.4"
        render(<DeckTable rows={[makeRow()]} page={1} totalPages={1} />);
        expect(screen.getByText("9.4")).toBeInTheDocument();
    });

    it("renders 'Go' button for rows with moxfield_id", () => {
        render(<DeckTable rows={[makeRow({ moxfield_id: "abc" })]} page={1} totalPages={1} />);
        const buttons = screen.getAllByText("Go");
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("renders disabled 'Go' button when moxfield_id is missing", () => {
        render(<DeckTable rows={[makeRow({ moxfield_id: null })]} page={1} totalPages={1} />);
        const buttons = screen.getAllByRole("button", { name: "Go" });
        expect(buttons.some((b) => b.disabled)).toBe(true);
    });

    it("renders multiple rows", () => {
        const rows = [
            makeRow({ deck_id: 1, player_name: "Alice" }),
            makeRow({ deck_id: 2, player_name: "Bob" }),
        ];
        render(<DeckTable rows={rows} page={1} totalPages={1} />);
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
    });
});

describe("DeckTable — pagination", () => {
    it("renders pagination with correct total and page", () => {
        render(<DeckTable rows={[makeRow()]} page={3} totalPages={5} />);
        const paginators = screen.getAllByTestId("pagination");
        expect(paginators[0]).toHaveAttribute("data-total", "5");
        expect(paginators[0]).toHaveAttribute("data-page", "3");
    });
});
