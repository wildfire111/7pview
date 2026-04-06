// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatBox from "../StatBox";

vi.mock("@heroui/react", () => ({
    Card: ({ children, className }) => <div className={className}>{children}</div>,
    CardBody: ({ children }) => <div>{children}</div>,
}));

describe("StatBox", () => {
    it("renders topLabel", () => {
        render(<StatBox topLabel="All Time" value="5%" />);
        expect(screen.getByText("All Time")).toBeInTheDocument();
    });

    it("renders value", () => {
        render(<StatBox value="+12.34%" />);
        expect(screen.getByText("+12.34%")).toBeInTheDocument();
    });

    it("renders bottomLabel", () => {
        render(<StatBox bottomLabel="±1.23%" />);
        expect(screen.getByText("±1.23%")).toBeInTheDocument();
    });

    it("renders countLabel", () => {
        render(<StatBox countLabel="42/100 decks" />);
        expect(screen.getByText("42/100 decks")).toBeInTheDocument();
    });

    it("applies default props without crashing", () => {
        render(<StatBox />);
        expect(screen.getByText("Top label")).toBeInTheDocument();
        expect(screen.getByText("123")).toBeInTheDocument();
    });
});
