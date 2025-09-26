import { notFound } from "next/navigation";
import CardDisplay from "@/components/CardDisplay";

export default async function Layout({ children, params }) {
    const { name } = await params;
    const rawName = decodeURIComponent(name);

    const url = new URL("https://api.scryfall.com/cards/named");
    url.searchParams.set("fuzzy", rawName);

    const res = await fetch(url, { cache: "no-store" });

    if (res.status === 404 || !res.ok) return notFound();

    const card = await res.json();

    return (
        <div className="flex min-h-screen gap-6">
            <CardDisplay card={card} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
