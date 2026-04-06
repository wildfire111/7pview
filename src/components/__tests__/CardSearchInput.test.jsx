// @vitest-environment happy-dom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CardSearchInput from "../CardSearchInput";

vi.mock("@heroui/react", () => ({
    Autocomplete: ({ inputValue, onInputChange, onSelectionChange, items, isLoading }) => (
        <div>
            <input
                data-testid="autocomplete-input"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                data-loading={String(isLoading)}
            />
            {items?.map((item) => (
                <div
                    key={item.id}
                    data-testid={`suggestion-${item.id}`}
                    onClick={() => onSelectionChange(item.id)}
                >
                    {item.label}
                </div>
            ))}
        </div>
    ),
    AutocompleteItem: ({ children }) => <div>{children}</div>,
    Button: ({ children, onPress, isLoading }) => (
        <button data-testid={children === "Search" ? "search-btn" : "adv-btn"} onClick={onPress} disabled={isLoading}>
            {children}
        </button>
    ),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}));

const mockFetch = vi.fn();

beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("CardSearchInput — rendering", () => {
    it("renders the autocomplete input and Search button by default", () => {
        render(<CardSearchInput />);
        expect(screen.getByTestId("autocomplete-input")).toBeInTheDocument();
        expect(screen.getByTestId("search-btn")).toBeInTheDocument();
    });

    it("hides the Search button when hideButton=true", () => {
        render(<CardSearchInput hideButton />);
        expect(screen.queryByTestId("search-btn")).not.toBeInTheDocument();
    });

    it("shows the Adv. button when showAdvButton=true", () => {
        render(<CardSearchInput showAdvButton />);
        // Rendered as a button in tests (HeroUI's `as={Link}` is not applied in the mock)
        expect(screen.getByRole("button", { name: "Adv." })).toBeInTheDocument();
    });

    it("does not show Adv. button by default", () => {
        render(<CardSearchInput />);
        expect(screen.queryByRole("link", { name: "Adv." })).not.toBeInTheDocument();
    });

    it("initialises input with the value prop", () => {
        render(<CardSearchInput value="Sol Ring" />);
        expect(screen.getByTestId("autocomplete-input").value).toBe("Sol Ring");
    });
});

// ---------------------------------------------------------------------------
// Debounced Scryfall fetch
// ---------------------------------------------------------------------------

describe("CardSearchInput — Scryfall autocomplete", () => {
    it("fetches suggestions after the debounce delay", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: ["Sol Ring", "Soltari Foot Soldier"] }),
        });

        // debounceMs=0 so the setTimeout fires in the next tick
        render(<CardSearchInput debounceMs={0} />);
        fireEvent.change(screen.getByTestId("autocomplete-input"), { target: { value: "Sol" } });

        await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
        expect(mockFetch.mock.calls[0][0]).toContain("Sol");
    });

    it("does not fetch when input is empty", async () => {
        render(<CardSearchInput debounceMs={0} />);
        fireEvent.change(screen.getByTestId("autocomplete-input"), { target: { value: "" } });

        // Give enough time for a debounce to fire if it were going to
        await new Promise((r) => setTimeout(r, 50));

        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("renders suggestions returned by Scryfall", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: ["Sol Ring"] }),
        });

        render(<CardSearchInput debounceMs={0} />);
        fireEvent.change(screen.getByTestId("autocomplete-input"), { target: { value: "Sol" } });

        await waitFor(() =>
            expect(screen.getByTestId("suggestion-Sol Ring")).toBeInTheDocument()
        );
    });

    it("clears suggestions when the Scryfall call fails", async () => {
        mockFetch.mockRejectedValue(new Error("network error"));

        render(<CardSearchInput debounceMs={0} />);
        fireEvent.change(screen.getByTestId("autocomplete-input"), { target: { value: "Sol" } });

        // Wait for the async fetch attempt to complete, then check suggestions are absent
        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        expect(screen.queryByTestId(/suggestion-/)).not.toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Submit behaviour
// ---------------------------------------------------------------------------

describe("CardSearchInput — submit", () => {
    it("calls onSubmit with the input value when Search is pressed", () => {
        const onSubmit = vi.fn();
        render(<CardSearchInput onSubmit={onSubmit} />);

        fireEvent.change(screen.getByTestId("autocomplete-input"), { target: { value: "Black Lotus" } });
        fireEvent.click(screen.getByTestId("search-btn"));

        expect(onSubmit).toHaveBeenCalledWith("Black Lotus");
    });

    it("calls onSubmit when a suggestion is selected", async () => {
        const onSubmit = vi.fn();
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: ["Sol Ring"] }),
        });

        render(<CardSearchInput debounceMs={0} onSubmit={onSubmit} />);
        fireEvent.change(screen.getByTestId("autocomplete-input"), { target: { value: "Sol" } });

        await waitFor(() => screen.getByTestId("suggestion-Sol Ring"));
        fireEvent.click(screen.getByTestId("suggestion-Sol Ring"));

        expect(onSubmit).toHaveBeenCalledWith("Sol Ring");
    });

    it("does not call onSubmit when input is empty", () => {
        const onSubmit = vi.fn();
        render(<CardSearchInput onSubmit={onSubmit} />);
        fireEvent.click(screen.getByTestId("search-btn"));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("trims whitespace before submitting", () => {
        const onSubmit = vi.fn();
        render(<CardSearchInput onSubmit={onSubmit} />);
        fireEvent.change(screen.getByTestId("autocomplete-input"), { target: { value: "  Sol Ring  " } });
        fireEvent.click(screen.getByTestId("search-btn"));
        expect(onSubmit).toHaveBeenCalledWith("Sol Ring");
    });
});
