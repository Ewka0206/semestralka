import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Trip, TripType } from "../features/trips/types";
import { addUserTrip } from "../features/trips/repo";

function uid(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const types: TripType[] = ["Training", "Adventure", "Relax", "Delivery"];

export function CreateOfferPage() {
    const nav = useNavigate();

    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [country, setCountry] = useState(""); // ✅
    const [type, setType] = useState<TripType>("Training");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [priceCzk, setPriceCzk] = useState<number>(17000);
    const [capacity, setCapacity] = useState<number>(8);
    const [description, setDescription] = useState("");
    const [highlightsText, setHighlightsText] = useState(""); // ✅

    function submit() {
        if (!title.trim()) return alert("Vyplň title.");
        if (!location.trim()) return alert("Vyplň location.");
        if (!startDate) return alert("Vyplň start date.");
        if (!endDate) return alert("Vyplň end date.");
        if (endDate < startDate) return alert("End date musí být po start date.");
        if (priceCzk <= 0) return alert("Cena musí být > 0.");
        if (capacity < 1) return alert("Capacity musí být >= 1.");

        const parsedHighlights = highlightsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

        const highlights =
            parsedHighlights.length > 0
                ? parsedHighlights
                : ["New offer", "Custom route", "Friendly crew"];

        const trip: Trip = {
            id: uid(),
            title: title.trim(),
            location: location.trim(),
            country: country.trim() || "—",
            type,
            startDate,
            endDate,
            priceCzk,
            capacity,

            // ✅ kvůli TripCard
            booked: 0,
            skipperIncluded: true,
            highlights,

            // pokud máš v Trip typu description, nech
            description: description.trim() || "—",
        };

        addUserTrip(trip);
        nav(`/trips/${trip.id}`);
    }

    return (
        <div className="container stack">
            <h1>Create offer</h1>

            <section className="card stack">
                <label className="field">
                    <span>Title</span>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>

                <div className="grid2">
                    <label className="field">
                        <span>Location</span>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} />
                    </label>

                    <label className="field">
                        <span>Country</span>
                        <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Greece" />
                    </label>
                </div>

                <label className="field">
                    <span>Type</span>
                    <select value={type} onChange={(e) => setType(e.target.value as TripType)}>
                        {types.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="grid2">
                    <label className="field">
                        <span>Start date</span>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </label>

                    <label className="field">
                        <span>End date</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </label>
                </div>

                <div className="grid2">
                    <label className="field">
                        <span>Price (CZK)</span>
                        <input
                            type="number"
                            min={0}
                            value={priceCzk}
                            onChange={(e) => setPriceCzk(Number(e.target.value))}
                        />
                    </label>

                    <label className="field">
                        <span>Capacity</span>
                        <input
                            type="number"
                            min={1}
                            value={capacity}
                            onChange={(e) => setCapacity(Number(e.target.value))}
                        />
                    </label>
                </div>

                <label className="field">
                    <span>Highlights (1 per line)</span>
                    <textarea
                        value={highlightsText}
                        onChange={(e) => setHighlightsText(e.target.value)}
                        rows={4}
                        placeholder={"Azurové zátoky\nPohodové tempo\nIdeální pro začátečníky"}
                    />
                </label>

                <label className="field">
                    <span>Description</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </label>

                <button className="btn" type="button" onClick={submit}>
                    Save offer
                </button>
            </section>
        </div>
    );
}
