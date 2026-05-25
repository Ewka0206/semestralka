import type { FieldError } from "react-hook-form";

type Props = {
    error?: FieldError;
};

export function FormError({ error }: Props) {
    if (!error?.message) return null;
    return <div className="fieldError">{error.message}</div>;
}
