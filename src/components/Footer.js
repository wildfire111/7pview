"use client";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-divider bg-content1/50 backdrop-blur mt-auto">
            <div className="container mx-auto px-6 py-4">
                <div className="text-center text-sm text-foreground-500">
                    © {currentYear} Michael Leslie. Built with love for the 7PH
                    Community and released under the MIT licence.
                </div>
            </div>
        </footer>
    );
}
