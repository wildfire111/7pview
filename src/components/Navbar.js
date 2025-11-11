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
            <NavbarContent
                className="lg:hidden w-auto"
                justify="start"
            >
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="text-black"
                />
            </NavbarContent>

            {/* Brand - visible on md+ */}
            <NavbarBrand className="hidden md:flex flex-none ml-0 mr-auto">
                <Link
                    href="/"
                    className="flex items-center gap-2 h-full"
                >
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
                        href="/visualpoints"
                        className="text-black hover:text-gray-700 transition-colors font-medium"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                    >
                        Visual Points
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
                        href="/events"
                        className="text-black hover:text-gray-700 transition-colors font-medium"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                    >
                        Events
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
            <NavbarContent
                justify="end"
                className="lg:justify-end"
            >
                <NavbarItem>
                    <CardSearchInput
                        onSubmit={handleSubmit}
                        showAdvButton={true}
                    />
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
                        Home
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link
                        href="/search"
                        className="w-full py-2 text-black hover:text-gray-700"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Advanced Search
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link
                        href="/visualpoints"
                        className="w-full py-2 text-black hover:text-gray-700"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Visual Points
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link
                        href="/events"
                        className="w-full py-2 text-black hover:text-gray-700"
                        style={{
                            textShadow:
                                "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                        }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Events
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
