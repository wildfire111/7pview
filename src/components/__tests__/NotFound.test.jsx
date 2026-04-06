// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../NotFound";

vi.mock("@heroui/react", () => ({
    Card: ({ children }) => <div>{children}</div>,
    CardBody: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/lib/utils/randClown", () => ({
    default: () => "https://example.com/clown.jpg",
}));

describe("NotFound", () => {
    it("renders default title and message", () => {
        render(<NotFound />);
        expect(screen.getByText("Not Found")).toBeInTheDocument();
        expect(screen.getByText("Nothing was found.")).toBeInTheDocument();
    });

    it("renders custom title and message", () => {
        render(<NotFound title="Card Not Found" message="That card doesn't exist." />);
        expect(screen.getByText("Card Not Found")).toBeInTheDocument();
        expect(screen.getByText("That card doesn't exist.")).toBeInTheDocument();
    });

    it("renders the clown image from randClown", () => {
        render(<NotFound />);
        const img = screen.getByAltText("Clown - nothing found");
        expect(img).toHaveAttribute("src", "https://example.com/clown.jpg");
    });

    it("does not show missing cards section when both arrays are empty", () => {
        render(<NotFound />);
        expect(screen.queryByText(/Missing cards \(includes\)/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Missing cards \(excludes\)/)).not.toBeInTheDocument();
    });

    it("shows missing includes when provided", () => {
        render(<NotFound missingIncludes={["Sol Ring", "Black Lotus"]} />);
        expect(screen.getByText(/Missing cards \(includes\)/)).toBeInTheDocument();
        expect(screen.getByText("Sol Ring")).toBeInTheDocument();
        expect(screen.getByText("Black Lotus")).toBeInTheDocument();
    });

    it("shows missing excludes when provided", () => {
        render(<NotFound missingExcludes={["Mox Ruby"]} />);
        expect(screen.getByText(/Missing cards \(excludes\)/)).toBeInTheDocument();
        expect(screen.getByText("Mox Ruby")).toBeInTheDocument();
    });

    it("shows search criteria includes and excludes", () => {
        render(
            <NotFound
                searchCriteria={{
                    includes: ["Sol Ring"],
                    excludes: ["Black Lotus"],
                }}
            />
        );
        expect(screen.getByText(/Must include/)).toBeInTheDocument();
        expect(screen.getByText(/Must exclude/)).toBeInTheDocument();
        expect(screen.getByText("Sol Ring")).toBeInTheDocument();
        expect(screen.getByText("Black Lotus")).toBeInTheDocument();
    });

    it("does not show search criteria section when criteria is null", () => {
        render(<NotFound searchCriteria={null} />);
        expect(screen.queryByText(/Must include/)).not.toBeInTheDocument();
    });

    it("shows suggestions list when provided", () => {
        render(<NotFound suggestions={["Try a different spelling", "Check the card name"]} />);
        expect(screen.getByText("Try a different spelling")).toBeInTheDocument();
        expect(screen.getByText("Check the card name")).toBeInTheDocument();
    });

    it("does not show suggestions section when empty", () => {
        render(<NotFound />);
        expect(screen.queryByText("Try:")).not.toBeInTheDocument();
    });
});
