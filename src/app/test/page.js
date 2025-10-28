import { getPointsData } from "@/lib/services";
export default async function Page({ searchParams }) {
    const pointsData = await getPointsData();
    return (
        <div>
            <h1>Points Data</h1>
            <pre>{JSON.stringify(pointsData, null, 2)}</pre>
        </div>
    );
}
