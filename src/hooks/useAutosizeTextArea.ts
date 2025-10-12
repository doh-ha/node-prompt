import { useEffect, useRef } from "react";

export const useAutosizeTextArea = (value: string) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textAreaRef.current.style.height = "auto";

      // Set height to scrollHeight, but not more than max-height
      const scrollHeight = textAreaRef.current.scrollHeight;
      const maxHeight = 200; // matches max-height in CSS
      const newHeight = Math.min(scrollHeight, maxHeight);

      textAreaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  return textAreaRef;
};
