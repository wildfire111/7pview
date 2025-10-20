import { notFound } from "next/navigation";
import SearchDisplay from "@/components/SearchDisplay";

export default async function Layout({ children, params }) {
    const { searchedCards } = await params;
    const searchedCardList = decodeURIComponent(searchedCards).split(",");

    return (
        <div className="flex min-h-screen gap-6">
            <SearchDisplay cardList={searchedCardList} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
