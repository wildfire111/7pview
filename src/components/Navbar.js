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

            <NavbarContent justify="end">
                <NavbarItem>
                    <CardSearchInput onSubmit={handleSubmit} />
                </NavbarItem>
                <NavbarItem>
                    <Button
                        as={Link}
                        href="/search"
                        color="secondary"
                        variant="flat"
                    >
                        Adv.
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
