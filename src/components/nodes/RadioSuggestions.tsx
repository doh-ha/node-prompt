import React from "react";
import styled from "styled-components";

const SuggestionsContainer = styled.div`
  margin-bottom: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const SuggestionsTitle = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 500;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const RadioOption = styled.label<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  font-size: 11px;
  color: ${(props) => (props.$isSelected ? "#3b82f6" : "#475569")};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.$isSelected ? "#3b82f6" : "#cbd5e1")};
  background: ${(props) => (props.$isSelected ? "#eff6ff" : "white")};
  transition: all 0.2s;
  font-weight: ${(props) => (props.$isSelected ? "500" : "normal")};

  &:hover {
    background: ${(props) => (props.$isSelected ? "#dbeafe" : "#f1f5f9")};
    border-color: ${(props) => (props.$isSelected ? "#3b82f6" : "#94a3b8")};
  }

  input[type="radio"] {
    margin-right: 4px;
    margin: 0;
    margin-right: 4px;
  }

  span {
    color: inherit;
    font-weight: inherit;
  }
`;

interface RadioSuggestionsProps {
  suggestions: string[];
  selectedValue?: string;
  onSelectionChange: (value: string) => void;
  title?: string;
}

export const RadioSuggestions: React.FC<RadioSuggestionsProps> = ({ suggestions, selectedValue, onSelectionChange }) => {
  return (
    <SuggestionsContainer>
      <RadioGroup>
        {suggestions.map((suggestion, index) => (
          <RadioOption key={index} $isSelected={selectedValue === suggestion}>
            <input
              type="radio"
              name="suggestion"
              value={suggestion}
              checked={selectedValue === suggestion}
              onChange={(e) => onSelectionChange(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <span>{suggestion}</span>
          </RadioOption>
        ))}
      </RadioGroup>
    </SuggestionsContainer>
  );
};
