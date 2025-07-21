// src/components/FormSection.tsx
import React from "react";

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  gridCols?: number; // This line adds the missing prop
}

export const FormSection = ({
  title,
  icon,
  children,
  gridCols = 2,
}: FormSectionProps) => (
  <div className="bg-slate-50/70 p-6 rounded-xl shadow-sm border border-slate-200">
    <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-6 border-b pb-3">
      {icon}
      {title}
    </h3>
    {/* This line uses the prop to dynamically set the grid columns */}
    <div
      className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-x-6 gap-y-4`}
    >
      {children}
    </div>
  </div>
);
