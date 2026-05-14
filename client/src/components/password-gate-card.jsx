import { useState } from "react";
import { Fingerprint } from "lucide-react";
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
      toast.success("Password verified.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Password verification failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <CardTitle>Enter password</CardTitle>
        <CardDescription>This file is protected. Enter the password to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium" htmlFor="download-password">
            Password
          </label>
          <Input
            id="download-password"
            type="password"
            value={password}
            placeholder="Enter password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Fingerprint className="size-4" />
            {isSubmitting ? "Verifying..." : "Unlock file"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
