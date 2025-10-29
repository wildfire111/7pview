"use client";

import { Skeleton } from "@heroui/react";

export default function SpoilerLoading() {
    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <Skeleton className="h-8 w-64 rounded-lg mb-2" />
                <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-content1 rounded-lg p-4">
                        <Skeleton className="h-6 w-32 rounded-lg mb-4" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => (
                                <Skeleton
                                    key={j}
                                    className="w-full aspect-[5/7] rounded-lg"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
