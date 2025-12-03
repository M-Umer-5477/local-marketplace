import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";

export default function ApplicationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-md text-center p-6 shadow-xl">
        <div className="flex justify-center mb-4">
           <div className="bg-green-100 p-4 rounded-full">
              <Clock className="h-10 w-10 text-green-600" />
           </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-muted-foreground mb-6">
          Your email has been verified. Our admin team will review your documents and shop details within 24 hours.
        </p>
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm mb-6">
           You will receive an email once your account is <strong>Approved</strong>.
        </div>
        <Link href="/">
           <Button variant="outline">Return Home</Button>
        </Link>
      </Card>
    </div>
  );
}