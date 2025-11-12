"use client";

import { Card, CardBody } from "@heroui/react";
import randClown from "@/lib/utils/randClown";

export default function NotFound({
    title = "Not Found",
    message = "Nothing was found.",
    missingIncludes = [],
    missingExcludes = [],
    searchCriteria = null,
    suggestions = [],
}) {
    const randomImage = randClown();

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full">
                <CardBody className="text-center p-8">
                    <img
                        src={randomImage}
                        alt="Clown - nothing found"
                        className="w-48 h-auto object-cover rounded-xl mx-auto mb-6"
                    />
                    <h2 className="text-2xl font-bold mb-4 text-default-800">
                        {title}
                    </h2>
                    <p className="text-default-600 mb-4">{message}</p>

                    {/* Show missing cards if provided */}
                    {(missingIncludes.length > 0 ||
                        missingExcludes.length > 0) && (
                        <div className="mb-4 p-3 bg-default-100 rounded-lg text-left">
                            {missingIncludes.length > 0 && (
                                <div className="mb-2">
                                    <span className="text-sm font-medium text-default-700">
                                        Missing cards (includes):
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {missingIncludes.map((card, index) => (
                                            <span
                                                key={index}
                                                className="text-sm px-2 py-1 rounded"
                                            >
                                                {card}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {missingExcludes.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium text-default-700">
                                        Missing cards (excludes):
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {missingExcludes.map((card, index) => (
                                            <span
                                                key={index}
                                                className="text-sm px-2 py-1 rounded"
                                            >
                                                {card}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show search criteria if provided */}
                    {searchCriteria &&
                        (searchCriteria.includes?.length > 0 ||
                            searchCriteria.excludes?.length > 0) && (
                            <div className="mb-4 p-3 bg-default-100 rounded-lg">
                                <p className="text-sm text-default-700 font-medium mb-2">
                                    Search criteria:
                                </p>
                                {searchCriteria.includes &&
                                    searchCriteria.includes.length > 0 && (
                                        <div className="mb-2">
                                            <span className="text-xs text-success-600 font-medium">
                                                Must include:
                                            </span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {searchCriteria.includes.map(
                                                    (card, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs bg-success-100 text-success-800 px-2 py-1 rounded"
                                                        >
                                                            {card}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                {searchCriteria.excludes &&
                                    searchCriteria.excludes.length > 0 && (
                                        <div>
                                            <span className="text-xs text-danger-600 font-medium">
                                                Must exclude:
                                            </span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {searchCriteria.excludes.map(
                                                    (card, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs bg-danger-100 text-danger-800 px-2 py-1 rounded"
                                                        >
                                                            {card}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}

                    {/* Show suggestions if provided */}
                    {suggestions.length > 0 && (
                        <div className="text-sm text-default-500 space-y-2">
                            <p>Try:</p>
                            <ul className="text-left space-y-1">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index}>• {suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
