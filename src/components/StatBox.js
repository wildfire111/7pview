"use client";

import { Card, CardBody } from "@heroui/react";

export default function StatBox({
    topLabel = "Top label",
    value = "123",
    bottomLabel = "Bottom label",
    countLabel = "Count Label",
    color = "primary",
    className = "",
}) {
    return (
        <Card
            shadow="md"
            className={`w-41 h-41 flex items-center justify-center rounded-2xl 
        bg-content1 text-foreground border border-divider 
        ${className}`}
        >
            <CardBody className="flex flex-col items-center justify-center p-2 text-center">
                <span className="text-sm text-foreground-500 font-medium tracking-wide">
                    {topLabel}
                </span>
                <span
                    className={`text-4xl font-extrabold leading-tight text-${color}`}
                    style={{ color: `hsl(var(--${color}))` }}
                >
                    {value}
                </span>
                <span className="text-sm text-foreground-500 font-medium tracking-wide">
                    {bottomLabel}
                </span>
                <span className="text-sm text-foreground-500 font-medium tracking-wide">
                    {countLabel}
                </span>
            </CardBody>
        </Card>
    );
}
