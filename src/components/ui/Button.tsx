import React from "react";
import styled from "styled-components";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  className?: string;
}

const StyledButton = styled.button<{ variant: string; size: string; disabled: boolean }>`
  padding: ${(props) => {
    switch (props.size) {
      case "small":
        return "6px 12px";
      case "large":
        return "12px 24px";
      default:
        return "8px 16px";
    }
  }};
  border: 2px solid;
  border-radius: 8px;
  font-weight: 500;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  font-size: ${(props) => {
    switch (props.size) {
      case "small":
        return "12px";
      case "large":
        return "16px";
      default:
        return "14px";
    }
  }};

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: ${props.disabled ? "#9ca3af" : "#4f46e5"};
          color: white;
          border-color: ${props.disabled ? "#9ca3af" : "#4f46e5"};
          &:hover {
            background: ${props.disabled ? "#9ca3af" : "#4338ca"};
            border-color: ${props.disabled ? "#9ca3af" : "#4338ca"};
          }
        `;
      case "secondary":
        return `
          background: white;
          color: ${props.disabled ? "#9ca3af" : "#374151"};
          border-color: ${props.disabled ? "#9ca3af" : "#e5e7eb"};
          &:hover {
            border-color: ${props.disabled ? "#9ca3af" : "#4f46e5"};
            color: ${props.disabled ? "#9ca3af" : "#4f46e5"};
          }
        `;
      case "danger":
        return `
          background: ${props.disabled ? "#9ca3af" : "#ef4444"};
          color: white;
          border-color: ${props.disabled ? "#9ca3af" : "#ef4444"};
          &:hover {
            background: ${props.disabled ? "#9ca3af" : "#dc2626"};
            border-color: ${props.disabled ? "#9ca3af" : "#dc2626"};
          }
        `;
      case "success":
        return `
          background: ${props.disabled ? "#9ca3af" : "#059669"};
          color: white;
          border-color: ${props.disabled ? "#9ca3af" : "#059669"};
          &:hover {
            background: ${props.disabled ? "#9ca3af" : "#047857"};
            border-color: ${props.disabled ? "#9ca3af" : "#047857"};
          }
        `;
      default:
        return `
          background: white;
          color: #374151;
          border-color: #e5e7eb;
          &:hover {
            border-color: #4f46e5;
            color: #4f46e5;
          }
        `;
    }
  }}
`;

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = "secondary", size = "medium", disabled = false, className }) => {
  return (
    <StyledButton variant={variant} size={size} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </StyledButton>
  );
};
