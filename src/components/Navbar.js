"use client";

import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CardSearchInput from "@/components/CardSearchInput";

export default function NavigationBar() {
    const router = useRouter();

    const handleSubmit = (name) => {
        router.push(`/card/${encodeURIComponent(name)}`);
    };

    return (
        <Navbar
            isBlurred
            maxWidth="lg"
            position="sticky"
            className="bg-content1/70 backdrop-blur border-b border-divider text-foreground"
        >
            <NavbarBrand>
                <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold text-foreground"
                >
                    <span>7PView</span>
                </Link>
            </NavbarBrand>

            <NavbarContent
                className="hidden sm:flex gap-4 items-center"
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

            <NavbarContent justify="end">
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
        </Navbar>
    );
}
