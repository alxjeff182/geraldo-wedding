import type { ReactNode } from "react";
import { isOverridden } from "../../lib/merge-content";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  wide?: boolean;
};

type OverrideFieldProps = {
  label: string;
  overridden: boolean;
  onReset?: () => void;
  wide?: boolean;
  children: ReactNode;
};

export function OverrideField({ label, overridden, onReset, wide, children }: OverrideFieldProps) {
  return (
    <div className={`admin-field${wide ? " admin-field--wide" : ""}`}>
      <div className="admin-label-row">
        <span className="admin-label">{label}</span>
        {overridden ? (
          <span className="admin-override-meta">
            <span className="admin-override-badge">Diubah</span>
            {onReset ? (
              <button type="button" className="admin-override-reset" onClick={onReset}>
                Reset
              </button>
            ) : null}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

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

type OverrideTextFieldProps = TextFieldProps & {
  defaultValue: unknown;
  onReset: () => void;
};

export function AdminOverrideTextField({
  label,
  value,
  defaultValue,
  onChange,
  onReset,
  rows,
  placeholder,
  wide,
}: OverrideTextFieldProps) {
  const Input = rows ? "textarea" : "input";
  const overridden = isOverridden(value, defaultValue);

  return (
    <OverrideField label={label} overridden={overridden} onReset={onReset} wide={wide}>
      <Input
        className="admin-input"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </OverrideField>
  );
}

type OverrideBooleanSelectProps = {
  label: string;
  value: boolean;
  defaultValue: boolean;
  onChange: (value: boolean) => void;
  onReset: () => void;
  wide?: boolean;
  falseOption: string;
  trueOption: string;
};

export function AdminOverrideBooleanSelect({
  label,
  value,
  defaultValue,
  onChange,
  onReset,
  wide,
  falseOption,
  trueOption,
}: OverrideBooleanSelectProps) {
  const overridden = isOverridden(value, defaultValue);

  return (
    <OverrideField label={label} overridden={overridden} onReset={onReset} wide={wide}>
      <select
        className="admin-input"
        value={value ? "1" : "0"}
        onChange={(e) => onChange(e.target.value === "1")}
      >
        <option value="0">{falseOption}</option>
        <option value="1">{trueOption}</option>
      </select>
    </OverrideField>
  );
}

type OverrideMediaFieldProps = {
  label: string;
  value: string;
  defaultValue: string;
  onReset: () => void;
  children: ReactNode;
};

export function AdminOverrideMediaField({
  label,
  value,
  defaultValue,
  onReset,
  children,
}: OverrideMediaFieldProps) {
  const overridden = isOverridden(value, defaultValue);

  return (
    <OverrideField label={label} overridden={overridden} onReset={onReset} wide>
      {children}
    </OverrideField>
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
