const mtgCardImages = [
    "https://cards.scryfall.io/normal/front/c/6/c6667e4f-f0f6-4416-940a-d03bed75f5a7.jpg?1732663805",
    "https://cards.scryfall.io/normal/front/8/5/859428e7-0795-423b-b16f-fdb4335de2b8.jpg?1673913039",
    "https://cards.scryfall.io/normal/front/b/9/b96e3f29-bb0d-49d0-9649-19c3c9b9f40d.jpg?1673914384",
    "https://cards.scryfall.io/normal/front/5/4/54cd6f28-11b0-4d69-bc2c-9050c2478b1d.jpg?1673915326",
    "https://cards.scryfall.io/normal/front/e/c/ec7d7c80-4e3c-454e-b2ed-6f0436df19c9.jpg?1562770655",
    "https://cards.scryfall.io/normal/front/5/4/54d001ca-285e-4033-9d97-0a1db3a8ec7b.jpg?1709590953",
    "https://cards.scryfall.io/normal/front/c/4/c4e30889-d245-4f20-938a-1295ddbcfac6.jpg?1583965812",
    "https://cards.scryfall.io/normal/front/6/e/6e68f012-307f-4ffb-909e-1284fb39e64f.jpg?1562799112",
    "https://cards.scryfall.io/normal/front/c/8/c8febd2c-2f6a-47c6-bebc-6f80e175ee95.jpg?1673913303",
    "https://cards.scryfall.io/normal/front/3/3/33dcfb90-8720-4a85-ab5b-169668871bb2.jpg?1673913348",
    "https://cards.scryfall.io/normal/front/a/0/a0d8c30b-15e5-44c4-8fe0-431e905f4f42.jpg?1673914463",
];

/**
 * Returns a random Magic: The Gathering card image URL for error states and not found pages
 * @returns {string} Random MTG card image URL
 */
export default function randClown() {
    return mtgCardImages[Math.floor(Math.random() * mtgCardImages.length)];
}
