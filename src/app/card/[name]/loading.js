export default function Loading() {
    return (
        <div className="grid min-h-[60vh] place-items-center text-white">
            <div className="flex items-center gap-3">
                <span className="animate-spin">⏳</span>
                <span>Looking up your card…</span>
            </div>
        </div>
    );
}
