import { useParams } from "react-router-dom";

export function TripDetailPage() {
    const { tripId } = useParams();

    return (
        <div className="container stack">
            <h1>Trip detail</h1>
            <p className="muted">tripId: <b>{tripId}</b></p>

            <div className="card">
                <p>
                    Sem přepíšeme detail z <code>detail_plavby.html</code> a napojíme na data.
                </p>
            </div>
        </div>
    );
}
