import { notFound } from "next/navigation";
import CardDisplay from "@/components/CardDisplay";
import { getCardIdByName } from "@/lib/database";

export default async function Layout({ children, params }) {
    const { name } = await params;
    const rawName = decodeURIComponent(name);

    const meta = await getCardIdByName(rawName);
    const scryfallId = meta?.card_id;
    if (!scryfallId) return notFound();

    const res = await fetch(`https://api.scryfall.com/cards/${scryfallId}`, {
        cache: "no-store",
    });

    if (!res.ok) return notFound();

    const card = await res.json();

    return (
        <div className="flex min-h-screen gap-6">
            <CardDisplay card={card} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
