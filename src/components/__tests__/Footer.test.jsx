// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer", () => {
    it("renders the current year", () => {
        render(<Footer />);
        const year = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    });

    it("renders author name", () => {
        render(<Footer />);
        expect(screen.getByText(/Michael Leslie/)).toBeInTheDocument();
    });

    it("renders community name", () => {
        render(<Footer />);
        expect(screen.getByText(/7PH Community/)).toBeInTheDocument();
    });

    it("mentions the MIT licence", () => {
        render(<Footer />);
        expect(screen.getByText(/MIT licence/i)).toBeInTheDocument();
    });
});
