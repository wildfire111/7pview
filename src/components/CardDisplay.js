// components/CardDisplay.js
export default function CardDisplay({ card, children }) {
    const front = getFront(card);

    return (
        <div className="flex min-h-screen gap-6">
            <aside className="sticky top-0 h-screen w-80 shrink-0">
                <div className="py-4">
                    <h1 className="mb-3 text-xl font-bold">{front.title}</h1>

                    {front.url ? (
                        <img
                            src={front.url}
                            alt={front.title}
                            className="w-full h-auto rounded-2xl  shadow"
                        />
                    ) : (
                        <div className="grid h-64 place-items-center rounded-lg bg-primary-800 text-primary-300">
                            No image available
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 py-4 overflow-auto">{children}</main>
        </div>
    );
}

function getFront(card) {
    if (!card) return { title: "Unknown Card", url: null };

    // single-faced
    if (card.image_uris) {
        return {
            title: card.name || "Unknown Card",
            url: card.image_uris.normal || null,
        };
    }

    // multi-faced, front is index 0
    if (Array.isArray(card.card_faces) && card.card_faces.length > 0) {
        const face = card.card_faces[0] || {};
        const uris = face.image_uris || {};
        return {
            title: face.name || card.name || "Unknown Card",
            url: uris.normal || null,
        };
    }

    return { title: card.name || "Unknown Card", url: null };
}
