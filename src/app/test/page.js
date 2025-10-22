import { getPoints } from "@/lib/api_helpers";
export default async function Page({ searchParams }) {
    const pointsData = await getPoints();
    return (
        <div>
            <h1>Points Data</h1>
            <pre>{JSON.stringify(pointsData, null, 2)}</pre>
        </div>
    );
}
