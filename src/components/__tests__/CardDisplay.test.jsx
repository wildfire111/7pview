// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CardDisplay from "../CardDisplay";

describe("CardDisplay", () => {
    it("renders children content", () => {
        render(<CardDisplay card={null}><p>Child content</p></CardDisplay>);
        expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("shows image for single-faced card with image_uris", () => {
        const card = {
            name: "Sol Ring",
            image_uris: { normal: "https://example.com/sol-ring.jpg" },
        };
        render(<CardDisplay card={card}><span /></CardDisplay>);
        const img = screen.getByAltText("Sol Ring");
        expect(img).toHaveAttribute("src", "https://example.com/sol-ring.jpg");
    });

    it("shows front face image for multi-faced card", () => {
        const card = {
            name: "Delver of Secrets // Insectile Aberration",
            card_faces: [
                {
                    name: "Delver of Secrets",
                    image_uris: { normal: "https://example.com/delver.jpg" },
                },
                {
                    name: "Insectile Aberration",
                    image_uris: { normal: "https://example.com/aberration.jpg" },
                },
            ],
        };
        render(<CardDisplay card={card}><span /></CardDisplay>);
        const img = screen.getByAltText("Delver of Secrets");
        expect(img).toHaveAttribute("src", "https://example.com/delver.jpg");
    });

    it("shows 'No image available' when card is null", () => {
        render(<CardDisplay card={null}><span /></CardDisplay>);
        expect(screen.getByText("No image available")).toBeInTheDocument();
    });

    it("shows 'No image available' when card has no image data", () => {
        render(<CardDisplay card={{ name: "Mystery Card" }}><span /></CardDisplay>);
        expect(screen.getByText("No image available")).toBeInTheDocument();
    });

    it("uses card name as image alt text for single-faced card", () => {
        const card = {
            name: "Black Lotus",
            image_uris: { normal: "https://example.com/lotus.jpg" },
        };
        render(<CardDisplay card={card}><span /></CardDisplay>);
        expect(screen.getByAltText("Black Lotus")).toBeInTheDocument();
    });
});
