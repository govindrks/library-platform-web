import {
    CalendarMonth,
    LocalOffer,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputAdornment,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useEffect, useState } from "react";


function CustomPricingDialog({
    open,
    member,
    onClose,
    onSave,
}) {

    const [pricingType, setPricingType] =
        useState("FIXED_AMOUNT");

    const [customPrice, setCustomPrice] =
        useState("");

    const [effectiveFrom, setEffectiveFrom] =
        useState("");

    const [hasExpiry, setHasExpiry] =
        useState(false);

    const [effectiveUntil, setEffectiveUntil] =
        useState("");

    const [reason, setReason] =
        useState("");

    const [error, setError] =
        useState("");

    const [saving, setSaving] =
        useState(false);


    /*
     * Load member's existing pricing
     * whenever the dialog opens.
     */
    useEffect(() => {

        if (!open || !member) {
            return;
        }

        setPricingType(
            member.pricingType ||
                "FIXED_AMOUNT"
        );

        setCustomPrice(
            member.customPrice !== null &&
                member.customPrice !== undefined
                ? String(member.customPrice)
                : ""
        );

        setEffectiveFrom(
            member.customPriceFrom ||
                new Date()
                    .toISOString()
                    .split("T")[0]
        );

        setHasExpiry(
            Boolean(member.customPriceUntil)
        );

        setEffectiveUntil(
            member.customPriceUntil || ""
        );

        setReason(
            member.customPriceReason || ""
        );

        setError("");

    }, [open, member]);


    const handleClose = () => {

        if (saving) {
            return;
        }

        setError("");

        onClose();
    };


    const validateForm = () => {

        if (!member) {
            return "Member information is missing.";
        }

        if (
            customPrice === "" ||
            Number.isNaN(Number(customPrice))
        ) {
            return "Please enter a valid custom price.";
        }

        const price = Number(customPrice);

        if (price <= 0) {
            return "Custom price must be greater than ₹0.";
        }

        const regularPrice = Number(
            member.standardPrice ??
                member.amount ??
                0
        );

        if (
            pricingType === "FIXED_AMOUNT" &&
            regularPrice > 0 &&
            price >= regularPrice
        ) {
            return (
                "Custom price should be lower than the regular plan price."
            );
        }

        if (!effectiveFrom) {
            return "Please select an effective start date.";
        }

        if (
            hasExpiry &&
            !effectiveUntil
        ) {
            return "Please select an expiry date.";
        }

        if (
            hasExpiry &&
            effectiveUntil < effectiveFrom
        ) {
            return (
                "Expiry date cannot be earlier than the effective start date."
            );
        }

        return "";
    };


    const handleSave = async () => {

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const payload = {
            pricingType,
            customPrice: Number(
                customPrice
            ),
            effectiveFrom,
            effectiveUntil:
                hasExpiry
                    ? effectiveUntil
                    : null,
            reason:
                reason.trim() || null,
        };

        try {

            setSaving(true);
            setError("");

            await onSave(
                member,
                payload
            );

            handleClose();

        } catch (saveError) {

            setError(
                saveError?.message ||
                    "Unable to save custom pricing."
            );

        } finally {

            setSaving(false);

        }
    };


    if (!member) {
        return null;
    }


    const regularPrice = Number(
        member.standardPrice ??
            member.amount ??
            0
    );


    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >

            {/* ------------------------------------------------ */}
            {/* Header */}
            {/* ------------------------------------------------ */}

            <DialogTitle
                sx={{
                    pb: 1.5,
                }}
            >

                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                >

                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor:
                                "primary.light",
                            color:
                                "primary.main",
                        }}
                    >
                        <LocalOffer />
                    </Box>

                    <Box>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Set Member-Specific Price
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Set a custom price for this member.
                        </Typography>

                    </Box>

                </Stack>

            </DialogTitle>


            <DialogContent>

                <Stack
                    spacing={3}
                    sx={{
                        pt: 1,
                    }}
                >

                    {/* ---------------------------------------- */}
                    {/* Information */}
                    {/* ---------------------------------------- */}

                    <Alert
                        severity="info"
                        icon={<LocalOffer />}
                    >
                        This custom price will override the
                        regular membership price for the
                        configured period.
                    </Alert>


                    {/* ---------------------------------------- */}
                    {/* Member */}
                    {/* ---------------------------------------- */}

                    <Box>

                        <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            mb={1}
                        >
                            Member
                        </Typography>

                        <Box
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                bgcolor:
                                    "background.default",
                            }}
                        >

                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >

                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: "50%",
                                        bgcolor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        fontWeight: 700,
                                    }}
                                >
                                    {member.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </Box>

                                <Box>

                                    <Typography
                                        variant="body1"
                                        fontWeight={700}
                                    >
                                        {member.name}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {member.email}

                                        {member.phone
                                            ? ` | ${member.phone}`
                                            : ""}
                                    </Typography>

                                </Box>

                            </Stack>

                        </Box>

                    </Box>


                    {/* ---------------------------------------- */}
                    {/* Membership Plan */}
                    {/* ---------------------------------------- */}

                    <Box>

                        <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            mb={1}
                        >
                            Membership Plan
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            value={
                                member.plan ||
                                "Membership Plan"
                            }
                            InputProps={{
                                readOnly: true,
                            }}
                            helperText={
                                member.planType
                                    ? `${member.planType} Plan`
                                    : "Current membership plan"
                            }
                        />

                    </Box>


                    {/* ---------------------------------------- */}
                    {/* Regular Price */}
                    {/* ---------------------------------------- */}

                    <Box>

                        <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            mb={1}
                        >
                            Regular Plan Price
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            value={
                                regularPrice > 0
                                    ? `₹${regularPrice.toLocaleString(
                                          "en-IN"
                                      )}`
                                    : "Not available"
                            }
                            InputProps={{
                                readOnly: true,
                            }}
                        />

                    </Box>


                    <Divider />


                    {/* ---------------------------------------- */}
                    {/* Pricing Type */}
                    {/* ---------------------------------------- */}

                    <FormControl>

                        <FormLabel
                            sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                mb: 0.5,
                            }}
                        >
                            Custom Pricing Type
                        </FormLabel>

                        <RadioGroup
                            value={pricingType}
                            onChange={(event) =>
                                setPricingType(
                                    event.target.value
                                )
                            }
                        >

                            <FormControlLabel
                                value="FIXED_AMOUNT"
                                control={<Radio />}
                                label={
                                    <Box>

                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                        >
                                            Fixed Amount
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Set the exact
                                            amount this member
                                            will pay.
                                        </Typography>

                                    </Box>
                                }
                            />

                            <FormControlLabel
                                value="PERCENTAGE_DISCOUNT"
                                control={<Radio />}
                                label={
                                    <Box>

                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                        >
                                            Percentage Discount
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Apply a percentage
                                            discount to the
                                            regular plan price.
                                        </Typography>

                                    </Box>
                                }
                                disabled
                            />

                        </RadioGroup>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Percentage pricing will be
                            enabled when supported by the
                            membership pricing API.
                        </Typography>

                    </FormControl>


                    {/* ---------------------------------------- */}
                    {/* Custom Price */}
                    {/* ---------------------------------------- */}

                    <TextField
                        fullWidth
                        required
                        size="small"
                        type="number"
                        label="Custom Price"
                        value={customPrice}
                        onChange={(event) => {

                            setCustomPrice(
                                event.target.value
                            );

                            setError("");

                        }}
                        inputProps={{
                            min: 0,
                            step: "0.01",
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    ₹
                                </InputAdornment>
                            ),
                        }}
                        helperText={
                            pricingType ===
                            "FIXED_AMOUNT"
                                ? "The member will pay this amount during the configured period."
                                : "Percentage discount from the regular price."
                        }
                    />


                    {/* ---------------------------------------- */}
                    {/* Effective From */}
                    {/* ---------------------------------------- */}

                    <TextField
                        fullWidth
                        required
                        size="small"
                        type="date"
                        label="Effective From"
                        value={effectiveFrom}
                        onChange={(event) => {

                            setEffectiveFrom(
                                event.target.value
                            );

                            setError("");

                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarMonth
                                        fontSize="small"
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />


                    {/* ---------------------------------------- */}
                    {/* Expiry */}
                    {/* ---------------------------------------- */}

                    <FormControl>

                        <FormLabel
                            sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                mb: 0.5,
                            }}
                        >
                            Pricing Expiry
                        </FormLabel>

                        <RadioGroup
                            value={
                                hasExpiry
                                    ? "SET_EXPIRY"
                                    : "NO_EXPIRY"
                            }
                            onChange={(event) => {

                                const value =
                                    event.target.value;

                                setHasExpiry(
                                    value ===
                                        "SET_EXPIRY"
                                );

                                if (
                                    value ===
                                    "NO_EXPIRY"
                                ) {
                                    setEffectiveUntil(
                                        ""
                                    );
                                }

                            }}
                        >

                            <FormControlLabel
                                value="NO_EXPIRY"
                                control={<Radio />}
                                label="No expiry"
                            />

                            <FormControlLabel
                                value="SET_EXPIRY"
                                control={<Radio />}
                                label="Set expiry date"
                            />

                        </RadioGroup>

                    </FormControl>


                    {hasExpiry && (
                        <TextField
                            fullWidth
                            required
                            size="small"
                            type="date"
                            label="Effective Until"
                            value={effectiveUntil}
                            onChange={(event) => {

                                setEffectiveUntil(
                                    event.target.value
                                );

                                setError("");

                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarMonth
                                            fontSize="small"
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}


                    {/* ---------------------------------------- */}
                    {/* Reason */}
                    {/* ---------------------------------------- */}

                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={3}
                        label="Reason / Note"
                        placeholder="Example: Special pricing offered to long-term member."
                        value={reason}
                        onChange={(event) => {

                            setReason(
                                event.target.value
                            );

                            setError("");

                        }}
                        helperText="Optional note explaining why this custom price was configured."
                    />


                    {/* ---------------------------------------- */}
                    {/* Preview */}
                    {/* ---------------------------------------- */}

                    {customPrice &&
                        !Number.isNaN(
                            Number(customPrice)
                        ) &&
                        Number(customPrice) > 0 && (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor:
                                        "success.light",
                                    border: "1px solid",
                                    borderColor:
                                        "success.main",
                                }}
                            >

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Member will pay
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="baseline"
                                    mt={0.25}
                                >

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                        color="success.dark"
                                    >
                                        ₹
                                        {Number(
                                            customPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </Typography>

                                    {regularPrice >
                                        0 &&
                                        Number(
                                            customPrice
                                        ) <
                                            regularPrice && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Regular price ₹
                                                {regularPrice.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </Typography>
                                        )}

                                </Stack>

                            </Box>
                        )}


                    {/* ---------------------------------------- */}
                    {/* Error */}
                    {/* ---------------------------------------- */}

                    {error && (
                        <Alert
                            severity="error"
                            onClose={() =>
                                setError("")
                            }
                        >
                            {error}
                        </Alert>
                    )}

                </Stack>

            </DialogContent>


            {/* -------------------------------------------- */}
            {/* Actions */}
            {/* -------------------------------------------- */}

            <DialogActions
                sx={{
                    px: 3,
                    pb: 3,
                }}
            >

                <Button
                    variant="outlined"
                    onClick={handleClose}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={
                        <LocalOffer />
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Save Custom Price"}
                </Button>

            </DialogActions>

        </Dialog>
    );
}


export default CustomPricingDialog;