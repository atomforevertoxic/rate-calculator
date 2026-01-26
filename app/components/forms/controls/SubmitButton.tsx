"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  pending?: boolean;
}

export function SubmitButton({
  children,
  className = "",
  disabled = false,
  loadingText = "Processing...",
  variant = "primary",
  fullWidth = false,
  type = "submit",
  onClick,
  pending: externalPending,
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const pending = externalPending !== undefined ? externalPending : formPending;
  const isDisabled = disabled || pending;

  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300",
    outline:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${widthStyles}
        ${className}
        ${pending ? "cursor-wait" : ""}
        px-6 py-3
      `}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
