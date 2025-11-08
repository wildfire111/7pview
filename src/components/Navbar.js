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
        >
            {/* Hamburger: visible below md */}
            <NavbarContent className="md:hidden" justify="start">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                />
            </NavbarContent>

            {/* Brand */}
            <NavbarBrand className="ml-0 mr-auto md:mr-0">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold text-foreground"
                >
                    <span>Thoughtcast</span>
                </Link>
            </NavbarBrand>

            {/* Center menu for md+ */}
            <NavbarContent
                className="hidden md:flex gap-4 items-center"
                justify="center"
            >
                <NavbarItem>
                    <Link
                        href="/"
                        className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                        Leaderboards
                    </Link>
                </NavbarItem>
                <span className="text-foreground-400">|</span>
                <NavbarItem>
                    <Link
                        href="/spoiler"
                        className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                        Visual Spoiler
                    </Link>
                </NavbarItem>
                <span className="text-foreground-400">|</span>
                <NavbarItem>
                    <Link
                        href="/about"
                        className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                        About
                    </Link>
                </NavbarItem>
            </NavbarContent>

            {/* Right side: search + button */}
            <NavbarContent justify="end" className="md:justify-end">
                <NavbarItem className="flex items-center gap-2">
                    <CardSearchInput onSubmit={handleSubmit} />
                    <Button
                        as={Link}
                        href="/search"
                        color="secondary"
                        variant="flat"
                        size="md"
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
                        className="w-full py-2 text-foreground hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Leaderboards
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link
                        href="/spoiler"
                        className="w-full py-2 text-foreground hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Visual Spoiler
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link
                        href="/about"
                        className="w-full py-2 text-foreground hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </Link>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}
