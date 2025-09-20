"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link as HeroLink,
  Input,
  Button
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SiteNavbar() {

  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  return (
    <Navbar
      isBlurred
      maxWidth="lg"
      position="sticky"
      className="bg-primary-900 text-white"
    >
      {/* Brand / logo */}
      <NavbarBrand>
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span>7PView</span>
        </Link>
      </NavbarBrand>

      {/* Right-side items */}
      <NavbarContent justify="end">
        <NavbarItem>
          <div className="flex items-center gap-1">
            <Input
              type="search"
              placeholder="Search card..."
              startContent={<span className="text-gray-400">🔍</span>}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              classNames={{
                input: "text-white placeholder:text-gray-400",
                inputWrapper: "bg-primary-800"
              }}
            />
            <Button color="secondary" variant="flat" onPress={handleSearch}>
              Search
            </Button>
          </div>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
