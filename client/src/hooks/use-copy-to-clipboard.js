import { useState } from "react";

export function useCopyToClipboard() {
  const [copiedValue, setCopiedValue] = useState("");

  async function copy(value) {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
  }

  return {
    copiedValue,
    copy,
  };
}
