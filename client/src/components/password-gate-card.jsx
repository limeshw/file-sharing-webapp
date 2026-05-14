import { useState } from "react";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "../lib/utils.js";
import { verifyFilePassword } from "../services/file-service.js";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Input } from "./ui/input.jsx";

export function PasswordGateCard({ uuid, onVerified }) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await verifyFilePassword({ uuid, password });
      onVerified(response.data);
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Password verification failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <CardTitle>Unlock this file</CardTitle>
        <CardDescription>
          This form posts to `POST /api/files/verify-password` and stores the temporary access key returned by the backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium" htmlFor="download-password">
            File password
          </label>
          <Input
            id="download-password"
            type="password"
            value={password}
            placeholder="Enter the share password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="rounded-[28px] border border-border bg-white/55 p-4 text-sm text-muted dark:bg-slate-950/25">
            <div className="mb-3 flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="size-4" />
              Access key behavior
            </div>
            <p className="leading-6">
              The backend signs a temporary access token tied to this file UUID. It is not JWT auth and it expires on its own.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Fingerprint className="size-4" />
            {isSubmitting ? "Verifying..." : "Verify and unlock download"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
