import {
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";

import {
    Add,
    Block,
    CheckCircle,
    Edit,
    LocalOffer,
    Search,
    Visibility,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import couponStore from "../../utility/couponStore";

import CouponFormDialog from "./components/CouponFormDialog";
import CouponStatusChip from "./components/CouponStatusChip";

const currency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

function Coupons() {
    /*
     * Shared coupon state.
     *
     * This allows Coupons.jsx and CouponApply.jsx
     * to work with the same mock coupon data.
     */
    const coupons = useSyncExternalStore(
        couponStore.subscribe,
        couponStore.getCoupons,
        couponStore.getCoupons
    );

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [formOpen, setFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [detailsCoupon, setDetailsCoupon] = useState(null);

    /*
     * Summary counts
     */
    const activeCount = coupons.filter(
        (coupon) => coupon.status === "ACTIVE"
    ).length;

    const usedCount = coupons.filter(
        (coupon) => coupon.status === "USED"
    ).length;

    const expiredCount = coupons.filter(
        (coupon) => coupon.status === "EXPIRED"
    ).length;

    const deactivatedCount = coupons.filter(
        (coupon) => coupon.status === "DEACTIVATED"
    ).length;

    /*
     * Search + status filtering
     */
    const filteredCoupons = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        return coupons.filter((coupon) => {
            const matchesSearch =
                !searchValue ||
                coupon.code
                    .toLowerCase()
                    .includes(searchValue) ||
                coupon.description
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "ALL" ||
                coupon.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [coupons, search, statusFilter]);

    /*
     * Open create dialog
     */
    const handleCreate = () => {
        setEditingCoupon(null);
        setFormOpen(true);
    };

    /*
     * Open edit dialog
     */
    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormOpen(true);
    };

    /*
     * Create / update coupon
     */
    const handleSave = (formData) => {
        try {
            if (editingCoupon) {
                couponStore.updateCoupon(
                    editingCoupon.id,
                    formData
                );
            } else {
                couponStore.createCoupon(formData);
            }

            setFormOpen(false);
            setEditingCoupon(null);
        } catch (error) {
            console.error(
                "Coupon save failed:",
                error
            );
        }
    };

    /*
     * Deactivate coupon
     */
    const handleDeactivate = (couponId) => {
        try {
            couponStore.deactivateCoupon(couponId);
        } catch (error) {
            console.error(
                "Coupon deactivation failed:",
                error
            );
        }
    };

    /*
     * Delete non-active coupon
     */
    const handleDelete = (couponId) => {
        couponStore.deleteCoupon(couponId);

        /*
         * If the deleted coupon is currently
         * displayed in the details dialog,
         * close the dialog.
         */
        if (detailsCoupon?.id === couponId) {
            setDetailsCoupon(null);
        }
    };

    /*
     * Format discount
     */
    const getDiscountText = (coupon) => {
        if (coupon.discountType === "PERCENTAGE") {
            return `${coupon.discountValue}%`;
        }

        return currency(coupon.discountValue);
    };

    /*
     * Close form dialog
     */
    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingCoupon(null);
    };

    /*
     * Close details dialog
     */
    const handleCloseDetails = () => {
        setDetailsCoupon(null);
    };

    return (
        <Box>
            {/* =====================================================
                HEADER
            ====================================================== */}
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "center",
                }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        gutterBottom
                    >
                        Coupons
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Create, activate and monitor
                        promotional coupons for your
                        library.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreate}
                >
                    Create Coupon
                </Button>
            </Stack>

            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}
            <Grid
                container
                spacing={2.5}
                sx={{ mb: 3 }}
            >
                {/* Active */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Active Coupons
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        sx={{ mt: 1 }}
                                    >
                                        {activeCount}
                                    </Typography>
                                </Box>

                                <CheckCircle color="success" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Used */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Used Coupons
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        sx={{ mt: 1 }}
                                    >
                                        {usedCount}
                                    </Typography>
                                </Box>

                                <LocalOffer color="primary" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Expired */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Expired Coupons
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        sx={{ mt: 1 }}
                                    >
                                        {expiredCount}
                                    </Typography>
                                </Box>

                                <Block color="disabled" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Deactivated */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Deactivated
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        sx={{ mt: 1 }}
                                    >
                                        {deactivatedCount}
                                    </Typography>
                                </Box>

                                <Block color="warning" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* =====================================================
                COUPON LIST
            ====================================================== */}
            <Card>
                <CardContent>
                    {/* Filters */}
                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        spacing={2}
                        justifyContent="space-between"
                        sx={{ mb: 3 }}
                    >
                        <TextField
                            size="small"
                            placeholder="Search coupon code..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            sx={{
                                width: {
                                    xs: "100%",
                                    md: 320,
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Select
                            size="small"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            sx={{
                                minWidth: {
                                    xs: "100%",
                                    md: 180,
                                },
                            }}
                        >
                            <MenuItem value="ALL">
                                All Status
                            </MenuItem>

                            <MenuItem value="ACTIVE">
                                Active
                            </MenuItem>

                            <MenuItem value="USED">
                                Used
                            </MenuItem>

                            <MenuItem value="EXPIRED">
                                Expired
                            </MenuItem>

                            <MenuItem value="DEACTIVATED">
                                Deactivated
                            </MenuItem>
                        </Select>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Coupon Cards */}
                    <Stack spacing={1}>
                        {filteredCoupons.map((coupon) => (
                            <Card
                                key={coupon.id}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: "none",
                                }}
                            >
                                <CardContent>
                                    <Stack
                                        direction={{
                                            xs: "column",
                                            lg: "row",
                                        }}
                                        spacing={2}
                                        alignItems={{
                                            xs: "flex-start",
                                            lg: "center",
                                        }}
                                    >
                                        {/* Coupon information */}
                                        <Box sx={{ flex: 1 }}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                flexWrap="wrap"
                                                useFlexGap
                                            >
                                                <Typography
                                                    fontWeight={700}
                                                >
                                                    {coupon.code}
                                                </Typography>

                                                <CouponStatusChip
                                                    status={
                                                        coupon.status
                                                    }
                                                />
                                            </Stack>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.5,
                                                }}
                                            >
                                                {
                                                    coupon.description
                                                }
                                            </Typography>
                                        </Box>

                                        {/* Discount */}
                                        <Box
                                            sx={{
                                                minWidth: 110,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Discount
                                            </Typography>

                                            <Typography fontWeight={700}>
                                                {getDiscountText(
                                                    coupon
                                                )}
                                            </Typography>
                                        </Box>

                                        {/* Minimum payment */}
                                        <Box
                                            sx={{
                                                minWidth: 130,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Minimum Payment
                                            </Typography>

                                            <Typography fontWeight={600}>
                                                {currency(
                                                    coupon.minimumAmount
                                                )}
                                            </Typography>
                                        </Box>

                                        {/* Validity */}
                                        <Box
                                            sx={{
                                                minWidth: 180,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Validity
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {coupon.validFrom}{" "}
                                                →{" "}
                                                {
                                                    coupon.validUntil
                                                }
                                            </Typography>
                                        </Box>

                                        {/* Actions */}
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                        >
                                            {/* View */}
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() =>
                                                        setDetailsCoupon(
                                                            coupon
                                                        )
                                                    }
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Active actions */}
                                            {coupon.status ===
                                                "ACTIVE" && (
                                                <>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            onClick={() =>
                                                                handleEdit(
                                                                    coupon
                                                                )
                                                            }
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Deactivate">
                                                        <IconButton
                                                            color="warning"
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    coupon.id
                                                                )
                                                            }
                                                        >
                                                            <Block />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}

                                            {/* Past coupon delete */}
                                            {coupon.status !==
                                                "ACTIVE" && (
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() =>
                                                            handleDelete(
                                                                coupon.id
                                                            )
                                                        }
                                                    >
                                                        <DeleteOutline />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Empty state */}
                        {filteredCoupons.length === 0 && (
                            <Box
                                sx={{
                                    py: 8,
                                    textAlign: "center",
                                }}
                            >
                                <LocalOffer
                                    sx={{
                                        fontSize: 42,
                                        color: "text.disabled",
                                        mb: 1,
                                    }}
                                />

                                <Typography
                                    color="text.secondary"
                                >
                                    No coupons found.
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* =====================================================
                CREATE / EDIT COUPON DIALOG
            ====================================================== */}
            <CouponFormDialog
                open={formOpen}
                coupon={editingCoupon}
                onClose={handleCloseForm}
                onSave={handleSave}
            />

            {/* =====================================================
                COUPON DETAILS DIALOG
            ====================================================== */}
            <Dialog
                open={Boolean(detailsCoupon)}
                onClose={handleCloseDetails}
                fullWidth
                maxWidth="sm"
            >
                {detailsCoupon && (
                    <>
                        <DialogTitle>
                            Coupon Details
                        </DialogTitle>

                        <DialogContent>
                            <Stack spacing={2}>
                                {/* Code + Status */}
                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    justifyContent="space-between"
                                    alignItems={{
                                        xs: "flex-start",
                                        sm: "center",
                                    }}
                                    spacing={1}
                                >
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        {detailsCoupon.code}
                                    </Typography>

                                    <CouponStatusChip
                                        status={
                                            detailsCoupon.status
                                        }
                                    />
                                </Stack>

                                <Divider />

                                {/* Description */}
                                <Typography>
                                    <strong>
                                        Description:
                                    </strong>{" "}
                                    {detailsCoupon.description ||
                                        "-"}
                                </Typography>

                                {/* Discount */}
                                <Typography>
                                    <strong>
                                        Discount:
                                    </strong>{" "}
                                    {getDiscountText(
                                        detailsCoupon
                                    )}
                                </Typography>

                                {/* Minimum */}
                                <Typography>
                                    <strong>
                                        Minimum Payment:
                                    </strong>{" "}
                                    {currency(
                                        detailsCoupon.minimumAmount
                                    )}
                                </Typography>

                                {/* Maximum */}
                                {detailsCoupon.maximumDiscount !==
                                    null &&
                                    detailsCoupon.maximumDiscount !==
                                        undefined && (
                                        <Typography>
                                            <strong>
                                                Maximum Discount:
                                            </strong>{" "}
                                            {currency(
                                                detailsCoupon.maximumDiscount
                                            )}
                                        </Typography>
                                    )}

                                {/* Valid From */}
                                <Typography>
                                    <strong>
                                        Valid From:
                                    </strong>{" "}
                                    {detailsCoupon.validFrom ||
                                        "-"}
                                </Typography>

                                {/* Valid Until */}
                                <Typography>
                                    <strong>
                                        Valid Until:
                                    </strong>{" "}
                                    {detailsCoupon.validUntil ||
                                        "-"}
                                </Typography>

                                {/* Created */}
                                <Typography>
                                    <strong>
                                        Created:
                                    </strong>{" "}
                                    {detailsCoupon.createdAt ||
                                        "-"}
                                </Typography>

                                {/* Used information */}
                                {detailsCoupon.status ===
                                    "USED" && (
                                    <>
                                        <Divider />

                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={700}
                                        >
                                            Usage Details
                                        </Typography>

                                        <Typography>
                                            <strong>
                                                Used By:
                                            </strong>{" "}
                                            {detailsCoupon.usedBy ||
                                                "-"}
                                        </Typography>

                                        <Typography>
                                            <strong>
                                                Used At:
                                            </strong>{" "}
                                            {detailsCoupon.usedAt ||
                                                "-"}
                                        </Typography>

                                        {detailsCoupon.bookingId && (
                                            <Typography>
                                                <strong>
                                                    Booking ID:
                                                </strong>{" "}
                                                {
                                                    detailsCoupon.bookingId
                                                }
                                            </Typography>
                                        )}

                                        {detailsCoupon.paymentId && (
                                            <Typography>
                                                <strong>
                                                    Payment ID:
                                                </strong>{" "}
                                                {
                                                    detailsCoupon.paymentId
                                                }
                                            </Typography>
                                        )}

                                        {detailsCoupon.discountAmount !==
                                            null &&
                                            detailsCoupon.discountAmount !==
                                                undefined && (
                                                <Typography>
                                                    <strong>
                                                        Discount Given:
                                                    </strong>{" "}
                                                    {currency(
                                                        detailsCoupon.discountAmount
                                                    )}
                                                </Typography>
                                            )}
                                    </>
                                )}

                                {/* Deactivated */}
                                {detailsCoupon.status ===
                                    "DEACTIVATED" && (
                                    <>
                                        <Divider />

                                        <Typography
                                            color="warning.main"
                                            variant="body2"
                                        >
                                            This coupon has
                                            been manually
                                            deactivated by
                                            the library
                                            owner and cannot
                                            be used.
                                        </Typography>
                                    </>
                                )}

                                {/* Expired */}
                                {detailsCoupon.status ===
                                    "EXPIRED" && (
                                    <>
                                        <Divider />

                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            This coupon is
                                            no longer
                                            available because
                                            its validity
                                            period has ended.
                                        </Typography>
                                    </>
                                )}
                            </Stack>
                        </DialogContent>

                        <DialogActions>
                            <Button
                                onClick={
                                    handleCloseDetails
                                }
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}

export default Coupons;