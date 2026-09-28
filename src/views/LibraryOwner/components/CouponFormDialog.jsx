import { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";

const initialForm = {
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minimumAmount: "",
    maximumDiscount: "",
    validFrom: "",
    validUntil: "",
};

function CouponFormDialog({
    open,
    onClose,
    onSave,
    coupon = null,
}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (coupon) {
            setForm({
                code: coupon.code || "",
                description: coupon.description || "",
                discountType: coupon.discountType || "PERCENTAGE",
                discountValue: coupon.discountValue ?? "",
                minimumAmount: coupon.minimumAmount ?? "",
                maximumDiscount: coupon.maximumDiscount ?? "",
                validFrom: coupon.validFrom || "",
                validUntil: coupon.validUntil || "",
            });
        } else {
            setForm(initialForm);
        }
    }, [coupon, open]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        if (
            !form.code ||
            !form.discountValue ||
            !form.validFrom ||
            !form.validUntil
        ) {
            return;
        }

        onSave({
            ...form,
            code: form.code.trim().toUpperCase(),
            discountValue: Number(form.discountValue),
            minimumAmount: form.minimumAmount
                ? Number(form.minimumAmount)
                : 0,
            maximumDiscount: form.maximumDiscount
                ? Number(form.maximumDiscount)
                : null,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                {coupon ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.2} sx={{ mt: 1 }}>
                    <TextField
                        name="code"
                        label="Coupon Code"
                        value={form.code}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="e.g. WELCOME50"
                        inputProps={{
                            style: {
                                textTransform: "uppercase",
                            },
                        }}
                    />

                    <TextField
                        name="description"
                        label="Description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                    />

                    <FormControl fullWidth size="small">
                        <InputLabel>Discount Type</InputLabel>

                        <Select
                            name="discountType"
                            value={form.discountType}
                            label="Discount Type"
                            onChange={handleChange}
                        >
                            <MenuItem value="PERCENTAGE">
                                Percentage
                            </MenuItem>

                            <MenuItem value="FIXED_AMOUNT">
                                Fixed Amount
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        name="discountValue"
                        label={
                            form.discountType === "PERCENTAGE"
                                ? "Discount (%)"
                                : "Discount Amount (₹)"
                        }
                        type="number"
                        value={form.discountValue}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        name="minimumAmount"
                        label="Minimum Payment Amount (₹)"
                        type="number"
                        value={form.minimumAmount}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />

                    {form.discountType === "PERCENTAGE" && (
                        <TextField
                            name="maximumDiscount"
                            label="Maximum Discount (₹)"
                            type="number"
                            value={form.maximumDiscount}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    )}

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                    >
                        <TextField
                            name="validFrom"
                            label="Valid From"
                            type="date"
                            value={form.validFrom}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            name="validUntil"
                            label="Valid Until"
                            type="date"
                            value={form.validUntil}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                >
                    {coupon ? "Update Coupon" : "Create Coupon"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CouponFormDialog;