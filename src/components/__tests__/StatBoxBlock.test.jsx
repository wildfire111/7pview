// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatBoxBlock from "../StatBoxBlock";

vi.mock("@heroui/react", () => ({
    Card: ({ children }) => <div>{children}</div>,
    CardBody: ({ children }) => <div>{children}</div>,
}));

const makeStats = (delta, CI, inc_count, inv_count) => ({
    delta,
    CI,
    inc_count,
    inv_count,
});

describe("StatBoxBlock", () => {
    const props = {
        block1stats: makeStats(-0.05, 0.02, 10, 90),
        block2stats: makeStats(-0.10, 0.03, 8, 80),
        block3stats: makeStats(-0.03, 0.01, 5, 50),
        block4stats: makeStats(-0.07, 0.025, 12, 60),
    };

    it("renders all four period labels", () => {
        render(<StatBoxBlock {...props} />);
        expect(screen.getByText("All Time")).toBeInTheDocument();
        expect(screen.getByText("Last Year")).toBeInTheDocument();
        expect(screen.getByText("Since Last Update")).toBeInTheDocument();
        expect(screen.getByText("Date Range")).toBeInTheDocument();
    });

    it("formats delta correctly (inverted sign, 2 decimal places)", () => {
        // delta = -0.05 → -0.05 * 100 = -5 → * -1 = 5 → "5%"
        render(<StatBoxBlock {...props} />);
        expect(screen.getByText("5%")).toBeInTheDocument();
    });

    it("formats CI as ± percentage", () => {
        // CI = 0.02 → ±2.00%
        render(<StatBoxBlock {...props} />);
        expect(screen.getByText("±2.00%")).toBeInTheDocument();
    });

    it("formats count as inc/(inc+inv) decks", () => {
        // inc_count=10, inv_count=90 → "10/100 decks"
        render(<StatBoxBlock {...props} />);
        expect(screen.getByText("10/100 decks")).toBeInTheDocument();
    });
});
