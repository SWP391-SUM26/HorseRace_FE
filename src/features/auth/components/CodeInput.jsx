import { useRef } from "react";

const LENGTH = 6;

export function CodeInput({ value, onChange }) {
  const inputs = useRef([]);

  const chars = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const emit = (next) => onChange(next.join("").slice(0, LENGTH));

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...chars];
    next[i] = digit;
    emit(next);
    if (digit && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? "");
    emit(next);
    inputs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex gap-2">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={c}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-12 rounded-lg border border-border text-center text-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label={`Mã ký tự ${i + 1}`}
        />
      ))}
    </div>
  );
}
