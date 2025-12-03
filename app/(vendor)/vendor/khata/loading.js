import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    // This div centers the spinner on the screen
    <div className="flex h-[80vh] w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        {/* The Icon with animate-spin class makes it rotate */}
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Loading Checkout...
        </p>
      </div>
    </div>
  );
}