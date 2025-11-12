import NotFound from "@/components/NotFound";

export default function CardNotFound() {
    return (
        <div className="flex items-center justify-center">
            <NotFound
                title="Card Not Found"
                message="We couldn't find the card you're looking for. It might not be in our database yet, or there could be a typo in the card name."
                suggestions={[
                    "Check the spelling of the card name",
                    "Try searching for a similar card",
                    "Browse our card database to find what you're looking for",
                ]}
            />
        </div>
    );
}
