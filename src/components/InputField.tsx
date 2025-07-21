// src/components/InputField.tsx
import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const InputField = ({
  label,
  name,
  error,
  containerClassName = "",
  ...props
}: InputFieldProps) => (
  <div className={containerClassName}>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-slate-600 mb-1"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      className={`w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
        error ? "border-red-500" : ""
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);
