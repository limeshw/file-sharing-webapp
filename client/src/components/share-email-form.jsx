import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "../lib/utils.js";
import { sendShareEmail } from "../services/file-service.js";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Input } from "./ui/input.jsx";

export function ShareEmailForm({ uuid }) {
  const [formState, setFormState] = useState({
    emailTo: "",
    emailFrom: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await sendShareEmail({
        uuid,
        emailTo: formState.emailTo,
        emailFrom: formState.emailFrom,
      });

      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send share email."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <CardTitle>Email this transfer</CardTitle>
        <CardDescription>
          Uses `POST /api/files/send`. The backend allows only one send per file and returns a validation error if it was already sent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email-to">
              Recipient email
            </label>
            <Input
              id="email-to"
              type="email"
              value={formState.emailTo}
              placeholder="receiver@example.com"
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  emailTo: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email-from">
              Sender email
            </label>
            <Input
              id="email-from"
              type="email"
              value={formState.emailFrom}
              placeholder="sender@example.com"
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  emailFrom: event.target.value,
                }))
              }
            />
          </div>

          <div className="rounded-[28px] border border-border bg-white/55 p-4 text-sm text-muted dark:bg-slate-950/25">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Mail className="size-4" />
              Backend behavior
            </div>
            <p className="leading-6">
              Email content is generated server-side and uses the backend’s configured `APP_BASE_URL`, SMTP settings, and file expiry label.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="size-4" />
            {isSubmitting ? "Sending..." : "Send share email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
