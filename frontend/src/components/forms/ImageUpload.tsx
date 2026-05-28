import { useRef, useState } from "react";
import { apiFetch, getStoredToken } from "../../lib/api";

type Props = {
    value: string | undefined;
    onChange: (url: string) => void;
};

export function ImageUpload({ value, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            // Content-Type záměrně nenastavujeme – browser doplní multipart/form-data s boundary
            const token = getStoredToken();
            const res = await fetch("/api/upload", {
                method: "POST",
                body: form,
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error ?? "Nahrávání selhalo.");
                return;
            }
            const data = await res.json();
            onChange(data.url);
        } catch {
            setError("Nahrávání selhalo.");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className="stack">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                    type="button"
                    className="btn"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? "Nahrávám…" : "Vybrat soubor"}
                </button>
                {value && (
                    <button type="button" className="btn" onClick={() => onChange("")}>
                        Odebrat
                    </button>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                    onChange={handleFile}
                />
            </div>
            {error && <p className="fieldError">{error}</p>}
            {value && (
                <div className="tripHeroWrap">
                    <img src={value} alt="Náhled" className="tripHero" loading="lazy" />
                </div>
            )}
        </div>
    );
}
