// @vitest-environment happy-dom
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DateControls from "../DateControls";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => new URLSearchParams("start=2024-01-01&end=2024-12-31"),
    usePathname: () => "/results",
}));

// Minimal parseDate: returns an object with year/month/day and comparison support
vi.mock("@internationalized/date", () => ({
    parseDate: (iso) => {
        const [y, m, d] = iso.split("-").map(Number);
        return { year: y, month: m, day: d };
    },
}));

// DatePicker mock: exposes onChange via a button for each date field
vi.mock("@heroui/date-picker", () => ({
    DatePicker: ({ label, onChange }) => {
        // Expose a helper that tests call to simulate user changing the date
        return (
            <div
                data-testid={`picker-${label.toLowerCase()}`}
                data-onchange="exposed"
                ref={(el) => {
                    if (el) el.__onChange = onChange;
                }}
            >
                {label}
            </div>
        );
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

// Helper: trigger the onChange of a specific DatePicker by its label
function changePicker(label, isoDate) {
    const el = screen.getByTestId(`picker-${label.toLowerCase()}`);
    const [y, m, d] = isoDate.split("-").map(Number);
    el.__onChange({ year: y, month: m, day: d });
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("DateControls — rendering", () => {
    it("renders Start and End date pickers", () => {
        render(<DateControls initialStartISO="2024-01-01" initialEndISO="2024-12-31" minISO="2020-01-01" maxISO="2025-12-31" />);
        expect(screen.getByTestId("picker-start")).toBeInTheDocument();
        expect(screen.getByTestId("picker-end")).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// URL updates
// ---------------------------------------------------------------------------

describe("DateControls — URL updates", () => {
    beforeEach(() => {
        render(<DateControls initialStartISO="2024-01-01" initialEndISO="2024-12-31" minISO="2020-01-01" maxISO="2025-12-31" />);
    });

    it("pushes updated start param to router when start date changes", () => {
        changePicker("start", "2024-03-01");
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("start=2024-03-01"));
    });

    it("pushes updated end param to router when end date changes", () => {
        changePicker("end", "2024-09-30");
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("end=2024-09-30"));
    });

    it("removes the page param when the date changes", () => {
        changePicker("start", "2024-03-01");
        const url = mockPush.mock.calls[0][0];
        expect(url).not.toMatch(/page=/);
    });
});

// ---------------------------------------------------------------------------
// Date range validation
// ---------------------------------------------------------------------------

describe("DateControls — date range validation", () => {
    beforeEach(() => {
        // Start = 2024-01-01, End = 2024-12-31 (from mocked useSearchParams)
        render(<DateControls initialStartISO="2024-01-01" initialEndISO="2024-12-31" minISO="2020-01-01" maxISO="2025-12-31" />);
    });

    it("bumps end forward when new start is after current end", () => {
        // New start = 2025-03-01, current end = 2024-12-31 → end should become 2025-03-01
        changePicker("start", "2025-03-01");
        const url = mockPush.mock.calls[0][0];
        expect(url).toContain("start=2025-03-01");
        expect(url).toContain("end=2025-03-01");
    });

    it("keeps end unchanged when new start is before current end", () => {
        // New start = 2024-06-01, current end = 2024-12-31 → end stays
        changePicker("start", "2024-06-01");
        const url = mockPush.mock.calls[0][0];
        expect(url).toContain("start=2024-06-01");
        expect(url).toContain("end=2024-12-31");
    });

    it("brings start back when new end is before current start", () => {
        // New end = 2023-06-01, current start = 2024-01-01 → start should become 2023-06-01
        changePicker("end", "2023-06-01");
        const url = mockPush.mock.calls[0][0];
        expect(url).toContain("start=2023-06-01");
        expect(url).toContain("end=2023-06-01");
    });

    it("keeps start unchanged when new end is after current start", () => {
        // New end = 2024-09-30, current start = 2024-01-01 → start stays
        changePicker("end", "2024-09-30");
        const url = mockPush.mock.calls[0][0];
        expect(url).toContain("start=2024-01-01");
        expect(url).toContain("end=2024-09-30");
    });

    it("does not call router when a null value is passed to onChangeStart", () => {
        const el = screen.getByTestId("picker-start");
        el.__onChange(null);
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("does not call router when a null value is passed to onChangeEnd", () => {
        const el = screen.getByTestId("picker-end");
        el.__onChange(null);
        expect(mockPush).not.toHaveBeenCalled();
    });
});
