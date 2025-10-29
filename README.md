# 7pview

A powerful web application for analysing Magic: The Gathering deck statistics and card performance data. Built with Next.js and featuring comprehensive deck analysis, visual spoiler previews, and advanced search capabilities.

## Features

-   **Deck Performance Analytics** - View detailed statistics and confidence intervals for card performance
-   **Advanced Card Search** - Search for decks that include or exclude specific cards
-   **Visual Spoiler Gallery** - Browse cards organized by point values with Scryfall images
-   **Statistical Analysis** - Delta calculations, confidence intervals, and performance metrics
-   **Individual Card Analysis** - Deep dive into specific card performance across decks
-   **Responsive Design** - Optimized for desktop and mobile viewing

## Quick Start

### Prerequisites

-   Node.js 18+
-   PostgreSQL database
-   npm or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/wildfire111/7pview.git
    cd 7pview
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    ```bash
    cp .env.example .env
    ```

    Edit `.env` with your database connection:

    ```env
    DATABASE_URL=postgresql://username:password@localhost:5432/7pview_database
    NODE_ENV=development
    ```

4. **Set up your database**

    - Build your DB using the included python files. See moxfield_scraper readme for details.

5. **Run the development server**

    ```bash
    npm run dev
    ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── stats/         # Points/statistics endpoint
│   │   └── search/        # Card search endpoint
│   ├── card/[name]/       # Individual card pages
│   ├── search/            # Advanced search interface
│   ├── spoiler/           # Visual spoiler gallery
│   └── about/             # About page with methodology
├── components/            # Reusable UI components
│   ├── CardDisplay.js     # Card image display
│   ├── DeckTable.js       # Deck listing tables
│   ├── LeaderboardsDisplay.js
│   ├── ResultsDisplay.js  # Statistical results
│   └── StatBox.js         # Performance metrics display
├── lib/                   # Business logic and utilities
│   ├── database/          # Database operations
│   ├── services/          # Business logic services
│   ├── statistics/        # Statistical calculations
│   └── api-client/        # API client utilities
└── styles/                # Global styles
```

## API Endpoints

### GET `/api/stats`

Retrieve points data and card statistics from GitHub integration.

**Response:**

```json
{
  "cards": [...],
  "lastChanged": "2025-10-29T...",
  "commitMessage": "Update points data",
  "totalCards": 150
}
```

### POST `/api/search`

Advanced search for decks containing specific cards.

**Request:**

```json
{
    "includes": ["Lightning Bolt", "Counterspell"],
    "excludes": ["Black Lotus"]
}
```

**Response:**

```json
{
  "includes": [...deck_data...],
  "excludes": [...inverse_deck_data...],
  "hasResults": true
}
```

## Built With

-   **[Next.js 15](https://nextjs.org/)** - React framework with App Router
-   **[React 19](https://react.dev/)** - UI library
-   **[HeroUI](https://heroui.com/)** - Modern React UI components
-   **[PostgreSQL](https://postgresql.org/)** - Database with `pg` driver
-   **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
-   **[Lucide React](https://lucide.dev/)** - Icons
-   **[jStat](https://github.com/jstat/jstat)** - Statistical calculations

## Deployment

### Environment Variables (Production)

```env
DATABASE_URL=postgresql://user:pass@host:5432/prod_db
NODE_ENV=production
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   [Scryfall](https://scryfall.com/) for comprehensive MTG card data and images
-   [HeroUI](https://heroui.com/) for beautiful, accessible React components
-   The Magic: The Gathering community for inspiration and feedback
