"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DatePicker } from "@heroui/date-picker";
import { parseDate } from "@internationalized/date";

// CalendarDate -> "YYYY-MM-DD"
const toISO = (cd) => {
    const y = cd.year;
    const m = String(cd.month).padStart(2, "0");
    const d = String(cd.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export default function DateControls({
    initialStartISO,
    initialEndISO,
    minISO,
    maxISO,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // read from URL or fall back to initial bounds
    const startISO = searchParams.get("start") || initialStartISO;
    const endISO = searchParams.get("end") || initialEndISO;

    const minValue = parseDate(minISO);
    const maxValue = parseDate(maxISO);

    const updateURL = (nextStartISO, nextEndISO) => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("start", nextStartISO);
        sp.set("end", nextEndISO);
        sp.delete("page"); // reset pagination on range change
        router.push(`${pathname}?${sp.toString()}`);
    };

    const onChangeStart = (val) => {
        if (!val) return;
        const nextStart = toISO(val);
        const currentEnd = endISO;
        const nextEnd = currentEnd < nextStart ? nextStart : currentEnd;
        updateURL(nextStart, nextEnd);
    };

    const onChangeEnd = (val) => {
        if (!val) return;
        const nextEnd = toISO(val);
        const currentStart = startISO;
        const nextStart = nextEnd < currentStart ? nextEnd : currentStart;
        updateURL(nextStart, nextEnd);
    };

    return (
        <div className="flex items-end gap-3 flex-nowrap overflow-x-auto py-1">
            <DatePicker
                label="Start"
                labelPlacement="outside-left"
                value={parseDate(startISO)}
                onChange={onChangeStart}
                minValue={minValue}
                maxValue={maxValue}
                variant="bordered"
                showMonthAndYearPickers
                className="w-auto max-w-[16rem]"
                classNames={{
                    base: "w-auto",
                    inputWrapper: "w-auto",
                }}
            />
            <DatePicker
                label="End"
                labelPlacement="outside-left"
                value={parseDate(endISO)}
                onChange={onChangeEnd}
                minValue={minValue}
                maxValue={maxValue}
                variant="bordered"
                showMonthAndYearPickers
                className="w-auto max-w-[16rem]"
                classNames={{
                    base: "w-auto",
                    inputWrapper: "w-auto",
                }}
            />
        </div>
    );
}
