import { useRef } from "react";

const LENGTH = 6;

export function CodeInput({ value, onChange }) {
  const inputs = useRef([]);
  const chars = Array.from({ length: LENGTH }, (_, index) => value[index] ?? "");
  const emit = (next) => onChange(next.join("").slice(0, LENGTH));

  return (
    <div className="flex gap-2">
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={char}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, "").slice(-1);
            const next = [...chars];
            next[index] = digit;
            emit(next);
            if (digit && index < LENGTH - 1) inputs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !chars[index] && index > 0) {
              inputs.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
            if (!pasted) return;
            const next = Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? "");
            emit(next);
          }}
          className="h-12 w-12 rounded-lg border border-border text-center text-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label={`Code digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
