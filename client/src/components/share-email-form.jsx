import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "../lib/utils.js";
import { sendShareEmail } from "../services/file-service.js";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { Input } from "./ui/input.jsx";

export function ShareEmailForm({ uuid, compact = false }) {
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
    <Card className={compact ? "rounded-[24px]" : "rounded-[32px]"}>
      <CardHeader>
        <CardTitle>Email this link</CardTitle>
        <CardDescription>Send the file link directly from Linkify.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`email-to-${uuid}`}>
              Recipient email
            </label>
            <Input
              id={`email-to-${uuid}`}
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
            <label className="text-sm font-medium" htmlFor={`email-from-${uuid}`}>
              Your email
            </label>
            <Input
              id={`email-from-${uuid}`}
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="size-4" />
            {isSubmitting ? "Sending..." : "Send email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
