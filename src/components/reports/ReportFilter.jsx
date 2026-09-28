import React from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@mui/material";

function ReportFilter({
    value,
    onChange,
    label = "Period",
    options = [
        { value: "today", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "quarter", label: "This Quarter" },
        { value: "year", label: "This Year" },
    ],
}) {
    return (
        <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{label}</InputLabel>

            <Select
                value={value}
                label={label}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default ReportFilter;