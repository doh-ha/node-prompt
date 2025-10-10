import React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import type { Theme } from "@mui/material/styles";

interface RadioSuggestionsProps {
  suggestions: string[];
  selectedValue?: string;
  onSelectionChange: (value: string) => void;
}

export const RadioSuggestions: React.FC<RadioSuggestionsProps> = ({ suggestions, selectedValue, onSelectionChange }) => {
  return (
    <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup row value={selectedValue ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectionChange(e.target.value)} aria-label="suggestions" name="radio-suggestions">
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {suggestions.map((s, i) => (
              <FormControlLabel
                key={`${s}-${i}`}
                value={s}
                control={<Radio color="primary" size="small" />}
                label={s}
                sx={{
                  m: 0,
                  px: 1,
                  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  "& .MuiFormControlLabel-label": { fontSize: 12 },
                }}
              />
            ))}
          </Stack>
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};
