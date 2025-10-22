import React from "react";
import styled from "styled-components";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "textarea" | "email" | "password";
  disabled?: boolean;
  className?: string;
  rows?: number;
}

const StyledInput = styled.input<{ disabled: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: ${(props) => (props.disabled ? "#f9fafb" : "white")};
  color: ${(props) => (props.disabled ? "#9ca3af" : "#374151")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const StyledTextarea = styled.textarea<{ disabled: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: ${(props) => (props.disabled ? "#f9fafb" : "white")};
  color: ${(props) => (props.disabled ? "#9ca3af" : "#374151")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const Input: React.FC<InputProps> = ({ value, onChange, placeholder, type = "text", disabled = false, className, rows = 3 }) => {
  if (type === "textarea") {
    return <StyledTextarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={className} rows={rows} />;
  }

  return <StyledInput type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={className} />;
};
