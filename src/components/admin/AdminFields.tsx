type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  wide?: boolean;
};

export function AdminTextField({
  label,
  value,
  onChange,
  rows,
  placeholder,
  wide,
}: TextFieldProps) {
  const Input = rows ? "textarea" : "input";

  return (
    <label className={`admin-field${wide ? " admin-field--wide" : ""}`}>
      <span className="admin-label">{label}</span>
      <Input
        className="admin-input"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

type StringListFieldProps = {
  label: string;
  value: readonly string[];
  onChange: (value: string[]) => void;
};

export function AdminStringListField({ label, value, onChange }: StringListFieldProps) {
  return (
    <label className="admin-field admin-field--wide">
      <span className="admin-label">{label}</span>
      <input
        className="admin-input"
        value={[...value].join(", ")}
        placeholder="1, 2, 3"
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
      />
    </label>
  );
}

type ParagraphListFieldProps = {
  label: string;
  value: readonly string[];
  onChange: (value: string[]) => void;
};

export function AdminParagraphListField({ label, value, onChange }: ParagraphListFieldProps) {
  return (
    <label className="admin-field admin-field--wide">
      <span className="admin-label">{label}</span>
      <textarea
        className="admin-input"
        rows={5}
        value={[...value].join("\n\n")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(/\n{2,}/)
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
      />
    </label>
  );
}
