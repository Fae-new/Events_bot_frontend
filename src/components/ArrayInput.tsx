import React from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface ArrayInputProps {
  field: string;
  label: string;
  placeholder: string;
  icon?: React.ElementType;
  value: string[];
  addbtnText: string;
  error?: string;
  onChange: (field: string, index: number, value: string) => void;
  onAdd: (field: string) => void;
  onRemove: (field: string, index: number) => void;
}

export const ArrayInput = React.memo(
  ({
    field,
    label,
    placeholder,
    icon: Icon,
    value,
    error,
    addbtnText,
    onChange,
    onAdd,
    onRemove,
  }: ArrayInputProps) => {
    const handleChange = React.useCallback(
      (index: number, newValue: string) => {
        onChange(field, index, newValue);
      },
      [onChange, field]
    );

    const handleRemove = React.useCallback(
      (index: number) => {
        onRemove(field, index);
      },
      [onRemove, field]
    );

    const handleAdd = React.useCallback(() => {
      onAdd(field);
    }, [onAdd, field]);

    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          {Icon && <Icon color="primary" />}
          <Typography variant="subtitle1" fontWeight="medium">
            {label}
          </Typography>
        </Stack>
        {value.map((item: string, index: number) => {
          const inputId = `${field}-${index}`;
          return (
            <Stack key={inputId} direction="row" spacing={1} mb={2}>
              <TextField
                fullWidth
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={placeholder}
                variant="outlined"
                size="small"
                id={inputId}
              />
              <IconButton
                onClick={() => handleRemove(index)}
                color="error"
                size="small"
                aria-label={`Remove ${label}`}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          );
        })}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAdd}
          variant="outlined"
          color="primary"
          fullWidth
        >
          {addbtnText}
        </Button>
        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }
);

ArrayInput.displayName = "ArrayInput";
