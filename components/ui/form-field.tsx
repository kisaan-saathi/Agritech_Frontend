interface FormFieldProps {
  type?: string;
  placeholder?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function FormField({
  type = "text",
  placeholder,
  label,
  value,
  onChange,
  required = false,
}: FormFieldProps) {
  return (
    <div className="form-floating mb-3 floating-custom-label">
      <input
        type={type}
        className="form-control py-3"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
      />
      <label>{label}</label>
    </div>
  );
}