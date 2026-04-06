// @vitest-environment happy-dom
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NavigationBar from "../Navbar";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}));

vi.mock("@/components/CardSearchInput", () => ({
    default: ({ onSubmit }) => (
        <input
            data-testid="card-search-input"
            onKeyDown={(e) => e.key === "Enter" && onSubmit(e.target.value)}
        />
    ),
}));

// HeroUI Navbar mock: exposes the mobile menu toggle via a button
vi.mock("@heroui/react", () => ({
    Navbar: ({ children, isMenuOpen, onMenuOpenChange }) => (
        <nav data-testid="navbar" data-menu-open={String(isMenuOpen)}>
            <button data-testid="menu-toggle-btn" onClick={() => onMenuOpenChange(!isMenuOpen)}>
                Toggle
            </button>
            {children}
        </nav>
    ),
    NavbarBrand: ({ children }) => <div>{children}</div>,
    NavbarContent: ({ children }) => <div>{children}</div>,
    NavbarItem: ({ children }) => <div>{children}</div>,
    NavbarMenu: ({ children }) => <div data-testid="mobile-menu">{children}</div>,
    NavbarMenuItem: ({ children }) => <div>{children}</div>,
    NavbarMenuToggle: ({ "aria-label": label }) => <span>{label}</span>,
    Button: ({ children }) => <button>{children}</button>,
}));

beforeEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("NavigationBar — rendering", () => {
    it("renders the Leaderboards link", () => {
        render(<NavigationBar />);
        expect(screen.getByRole("link", { name: "Leaderboards" })).toBeInTheDocument();
    });

    it("renders the Events link", () => {
        render(<NavigationBar />);
        // Events appears in both desktop nav and mobile menu
        expect(screen.getAllByRole("link", { name: "Events" }).length).toBeGreaterThan(0);
    });

    it("renders the Visual Points link", () => {
        render(<NavigationBar />);
        expect(screen.getAllByRole("link", { name: "Visual Points" }).length).toBeGreaterThan(0);
    });

    it("renders the About link", () => {
        render(<NavigationBar />);
        expect(screen.getAllByRole("link", { name: "About" }).length).toBeGreaterThan(0);
    });

    it("renders the CardSearchInput", () => {
        render(<NavigationBar />);
        expect(screen.getByTestId("card-search-input")).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Mobile menu toggle
// ---------------------------------------------------------------------------

describe("NavigationBar — mobile menu", () => {
    it("menu is closed by default", () => {
        render(<NavigationBar />);
        expect(screen.getByTestId("navbar").dataset.menuOpen).toBe("false");
    });

    it("opens the menu when the toggle is clicked", () => {
        render(<NavigationBar />);
        fireEvent.click(screen.getByTestId("menu-toggle-btn"));
        expect(screen.getByTestId("navbar").dataset.menuOpen).toBe("true");
    });

    it("closes the menu on a second toggle click", () => {
        render(<NavigationBar />);
        fireEvent.click(screen.getByTestId("menu-toggle-btn"));
        fireEvent.click(screen.getByTestId("menu-toggle-btn"));
        expect(screen.getByTestId("navbar").dataset.menuOpen).toBe("false");
    });
});

// ---------------------------------------------------------------------------
// handleSubmit routing
// ---------------------------------------------------------------------------

describe("NavigationBar — card search routing", () => {
    it("navigates to /card/{name} when a card name is submitted", () => {
        render(<NavigationBar />);
        const input = screen.getByTestId("card-search-input");
        input.value = "Sol Ring";
        fireEvent.keyDown(input, { key: "Enter", target: { value: "Sol Ring" } });
        expect(mockPush).toHaveBeenCalledWith("/card/Sol%20Ring");
    });

    it("URI-encodes special characters in the card name", () => {
        render(<NavigationBar />);
        const input = screen.getByTestId("card-search-input");
        fireEvent.keyDown(input, { key: "Enter", target: { value: "Ob Nixilis, the Adversary" } });
        expect(mockPush).toHaveBeenCalledWith(
            `/card/${encodeURIComponent("Ob Nixilis, the Adversary")}`
        );
    });
});
