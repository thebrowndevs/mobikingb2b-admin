import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

export default function LoaderButton({
    loading = false,
    children,
    className,
    variant,
    size,
    ...props
}) {
    return (
        <Button
            className={className}
            variant={variant}
            size={size}
            disabled={loading}
            aria-disabled={loading}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" />}
            {children}
        </Button>
    );
}

