export const metadata = {
    title: "Visual Points Spoiler - 7PView",
    description:
        "Browse all pointed cards organized by their point values with visual spoiler images from Scryfall.",
};

export default function SpoilerLayout({ children }) {
    return <div className="min-h-screen bg-background">{children}</div>;
}
