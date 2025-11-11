"use client";

import { Spinner } from "@heroui/react";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" label="Loading event details..." />
            </div>
        </div>
    );
}
