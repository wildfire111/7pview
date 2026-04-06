// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeaderboardsDisplay from "../LeaderboardsDisplay";

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
    Info: () => null,
}));

const emptyPeriod = { top_cards: [] };

const makeLeaderboardData = () => ({
    allTime: emptyPeriod,
    lastYear: emptyPeriod,
    sinceUpdate: emptyPeriod,
});

describe("LeaderboardsDisplay", () => {
    it("shows error message when error and no data", () => {
        render(<LeaderboardsDisplay error="Service unavailable" leaderboardData={null} />);
        expect(screen.getByText("Failed to Load Leaderboards")).toBeInTheDocument();
        expect(screen.getByText("Service unavailable")).toBeInTheDocument();
    });

    it("shows 'Pointed Card Leaderboards' heading in loading state", () => {
        render(<LeaderboardsDisplay leaderboardData={null} />);
        expect(screen.getByText("Pointed Card Leaderboards")).toBeInTheDocument();
    });

    it("renders loading skeletons when data is null", () => {
        render(<LeaderboardsDisplay leaderboardData={null} />);
        expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    });

    it("renders three leaderboard titles when data is provided", () => {
        render(<LeaderboardsDisplay leaderboardData={makeLeaderboardData()} />);
        expect(screen.getByText("All Time")).toBeInTheDocument();
        expect(screen.getByText("Last Year")).toBeInTheDocument();
        expect(screen.getByText("Since Last Update")).toBeInTheDocument();
    });

    it("shows 'Pointed Card Leaderboards' heading when data is provided", () => {
        render(<LeaderboardsDisplay leaderboardData={makeLeaderboardData()} />);
        expect(screen.getByText("Pointed Card Leaderboards")).toBeInTheDocument();
    });

    it("does not show error when error is present but data also exists", () => {
        render(
            <LeaderboardsDisplay
                leaderboardData={makeLeaderboardData()}
                error="Some error"
            />
        );
        expect(screen.queryByText("Failed to Load Leaderboards")).not.toBeInTheDocument();
    });
});
