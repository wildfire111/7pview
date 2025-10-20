"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import CardSearchInput from "@/components/CardSearchInput";

export default function SearchDisplay({ children }) {
    const [inputs, setInputs] = useState([{ id: 1, value: "", include: true }]);

    const addInput = () => {
        setInputs((prev) => [
            ...prev,
            { id: prev.length + 1, value: "", include: true },
        ]);
    };

    const updateInput = (id, value) => {
        setInputs((prev) =>
            prev.map((inp) => (inp.id === id ? { ...inp, value } : inp))
        );
    };

    const toggleInclude = (id) => {
        setInputs((prev) =>
            prev.map((inp) =>
                inp.id === id ? { ...inp, include: !inp.include } : inp
            )
        );
    };

    const handleSubmit = () => {
        const includes = inputs
            .filter((i) => i.include && i.value)
            .map((i) => i.value);
        const excludes = inputs
            .filter((i) => !i.include && i.value)
            .map((i) => i.value);

        console.log("Include:", includes);
        console.log("Exclude:", excludes);
    };
    return (
        <div className="flex min-h-screen gap-6">
            <aside className="sticky top-0 h-screen w-120 shrink-0">
                <div className="py-4">
                    <div className="p-6 space-y-4">
                        <h1 className="text-xl font-semibold">
                            Multi-Card Search
                        </h1>

                        <div className="flex flex-col gap-3">
                            {inputs.map((inp, index) => {
                                const isLast = index === inputs.length - 1;
                                const label = inp.include ? "INC" : "EXC";
                                const color = inp.include
                                    ? "success"
                                    : "danger";

                                return (
                                    <div
                                        key={inp.id}
                                        className="flex items-center gap-2"
                                    >
                                        <Button
                                            color={color}
                                            variant="flat"
                                            radius="full"
                                            className="min-w-[4rem]"
                                            onPress={() =>
                                                toggleInclude(inp.id)
                                            }
                                        >
                                            {label}
                                        </Button>

                                        <CardSearchInput
                                            value={inp.value}
                                            onChange={(v) =>
                                                updateInput(inp.id, v)
                                            }
                                            hideButton={true}
                                        />

                                        {isLast && (
                                            <Button
                                                isIconOnly
                                                radius="full"
                                                variant="flat"
                                                color="primary"
                                                onPress={addInput}
                                                aria-label="Add another card"
                                            >
                                                <Plus size={18} />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-3">
                            <Button color="secondary" onPress={handleSubmit}>
                                Search All
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 py-4 overflow-auto">{children}</main>
        </div>
    );
}
