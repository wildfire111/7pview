"use client";

import React from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Button,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CardSearchInput from "@/components/CardSearchInput";

export default function NavigationBar() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleSubmit = (name) => {
        router.push(`/card/${encodeURIComponent(name)}`);
    };

    return (
        <Navbar
            isBlurred
            maxWidth="full"
            position="sticky"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            className="top-0 left-0 w-full bg-content1/70 backdrop-blur border-b border-divider z-50 px-0"
            style={{
                backgroundImage: 'url("/navbarbg.png")',
                backgroundSize: "auto 100%",
                backgroundRepeat: "repeat-x",
                backgroundPosition: "left center",
            }}
        >
            {/* Hamburger: visible on sm and md */}
            <NavbarContent className="lg:hidden" justify="start">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="text-black"
                />
            </NavbarContent>

            {/* Brand - visible on md+ */}
            <NavbarBrand className="hidden lg:flex ml-0 mr-auto">
                <Link href="/" className="flex items-center gap-2 h-full">
                    <img
                        src="/thoughtcast-logo.png"
                        alt="Thoughtcast"
                        className="h-full w-auto py-2"
                    />
                </Link>
            </NavbarBrand>

            {/* Center menu for lg+ */}
            <NavbarContent
                className="hidden lg:flex gap-4 items-center"
                justify="center"
            >
                <NavbarItem>
                    <Link
                        href="/"
                        className="text-black hover:text-gray-700 transition-colors font-medium"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                    >
                        Leaderboards
                    </Link>
                </NavbarItem>
                <span
                    className="text-black"
                    style={{
                        textShadow:
                            "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                    }}
                >
                    |
                </span>
                <NavbarItem>
                    <Link
                        href="/spoiler"
                        className="text-black hover:text-gray-700 transition-colors font-medium"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                    >
                        Visual Spoiler
                    </Link>
                </NavbarItem>
                <span
                    className="text-black"
                    style={{
                        textShadow:
                            "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                    }}
                >
                    |
                </span>
                <NavbarItem>
                    <Link
                        href="/about"
                        className="text-black hover:text-gray-700 transition-colors font-medium"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                    >
                        About
                    </Link>
                </NavbarItem>
            </NavbarContent>

            {/* Right side: search + button */}
            <NavbarContent justify="end" className="lg:justify-end">
                <NavbarItem className="flex items-center gap-5 sm:gap-3 md:gap-2">
                    <CardSearchInput onSubmit={handleSubmit} />
                    <Button
                        as={Link}
                        href="/search"
                        color="secondary"
                        variant="flat"
                        size="md"
                        className="text-black font-medium"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        Adv.
                    </Button>
                </NavbarItem>
            </NavbarContent>

            {/* Mobile menu panel */}
            <NavbarMenu>
                <NavbarMenuItem>
                    <Link
                        href="/"
                        className="w-full py-2 text-black hover:text-gray-700"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Leaderboards
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link
                        href="/spoiler"
                        className="w-full py-2 text-black hover:text-gray-700"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Visual Spoiler
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link
                        href="/about"
                        className="w-full py-2 text-black hover:text-gray-700"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </Link>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}
