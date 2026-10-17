import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  AccountBalanceWalletOutlined,
  AutoAwesomeRounded,
  CalendarMonthOutlined,
  CheckCircleRounded,
  DescriptionOutlined,
  Download,
  PaymentsOutlined,
  ReceiptLong,
  Refresh,
  RestartAlt,
} from "@mui/icons-material";

import {
  alpha,
  useTheme,
} from "@mui/material/styles";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import invoiceApi from "../../../api/invoiceApi";
import studentPaymentApi from "../../../api/studentPaymentApi";


// ============================================================
// HELPERS
// ============================================================

const formatMoney = (
  amount,
  currency = "INR",
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency:
        currency || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    Number(amount ?? 0),
  );
};


const formatDate = (
  value,
) => {
  if (!value) {
    return "-";
  }

  const rawValue =
    String(value).includes(
      "T",
    )
      ? value
      : `${value}T00:00:00`;

  const date =
    new Date(rawValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};


const normalizeArrayResponse =
  (response) => {
    if (
      Array.isArray(
        response,
      )
    ) {
      return response;
    }

    if (
      Array.isArray(
        response?.content,
      )
    ) {
      return response.content;
    }

    return [];
  };


const getInvoiceId = (
  invoice,
) => {
  return (
    invoice?.invoiceId ??
    invoice?.id ??
    null
  );
};


const getInvoicePaymentTransactionId =
  (invoice) => {
    return (
      invoice?.paymentTransactionId ??
      invoice?.transactionId ??
      invoice?.paymentId ??
      invoice
        ?.paymentTransaction
        ?.id ??
      null
    );
  };


const getPaymentTransactionId =
  (payment) => {
    return (
      payment?.paymentTransactionId ??
      payment?.transactionId ??
      payment?.paymentId ??
      payment?.id ??
      null
    );
  };


const isSuccessfulStudentPayment =
  (payment) => {
    if (
      payment?.status !==
      "SUCCESS"
    ) {
      return false;
    }

    /*
     * PLATFORM_SUBSCRIPTION belongs to:
     *
     * Library Owner
     *      ↓
     * LibraryHub
     *
     * It must not appear inside the
     * student's invoice recovery flow.
     */
    if (
      payment?.referenceType ===
      "PLATFORM_SUBSCRIPTION"
    ) {
      return false;
    }

    return Boolean(
      getPaymentTransactionId(
        payment,
      ),
    );
  };


const getInvoiceStatusColor =
  (status) => {
    switch (
      String(
        status || "",
      ).toUpperCase()
    ) {
      case "GENERATED":
      case "PAID":
      case "SUCCESS":
        return "success";

      case "PENDING":
        return "warning";

      case "FAILED":
      case "CANCELLED":
        return "error";

      default:
        return "default";
    }
  };


// ============================================================
// COMPONENT
// ============================================================

function StudentInvoices() {
  const theme =
    useTheme();

  const location =
    useLocation();

  const navigate =
    useNavigate();


  // ==========================================================
  // NOTIFICATION STATE
  // ==========================================================

  const fromNotification =
    Boolean(
      location.state
        ?.fromNotification,
    );

  const notificationReferenceId =
    location.state
      ?.notificationReferenceId ??
    null;

  const notificationReferenceType =
    location.state
      ?.notificationReferenceType ??
    null;


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    invoices,
    setInvoices,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    recovering,
    setRecovering,
  ] = useState(false);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState(null);

  const [
    regeneratingId,
    setRegeneratingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    highlightedInvoiceId,
    setHighlightedInvoiceId,
  ] = useState(null);


  // ==========================================================
  // FETCH INVOICES
  // ==========================================================

  const fetchInvoices =
    useCallback(
      async () => {
        const response =
          await invoiceApi
            .getMyInvoices();

        return normalizeArrayResponse(
          response,
        );
      },
      [],
    );


  // ==========================================================
  // RECOVER HISTORICAL INVOICES
  // ==========================================================

  const recoverHistoricalInvoices =
    useCallback(
      async (
        currentInvoices,
      ) => {
        const paymentResponse =
          await studentPaymentApi
            .getMyPayments();

        const payments =
          normalizeArrayResponse(
            paymentResponse,
          );

        const successfulPayments =
          payments.filter(
            isSuccessfulStudentPayment,
          );

        if (
          successfulPayments.length ===
          0
        ) {
          return {
            generatedCount: 0,
            failedCount: 0,
          };
        }


        // ====================================================
        // EXISTING PAYMENT IDS
        // ====================================================

        const existingPaymentIds =
          new Set(
            currentInvoices
              .map(
                getInvoicePaymentTransactionId,
              )
              .filter(Boolean)
              .map(String),
          );


        // ====================================================
        // MISSING INVOICES
        // ====================================================

        const candidatePayments =
          successfulPayments.filter(
            (payment) => {
              const transactionId =
                getPaymentTransactionId(
                  payment,
                );

              if (
                !transactionId
              ) {
                return false;
              }

              /*
               * Some historical invoice DTOs may not expose
               * paymentTransactionId.
               *
               * Calling recovery remains safe because the
               * backend generateIfAbsent(...) is idempotent.
               */
              if (
                existingPaymentIds.size ===
                0
              ) {
                return true;
              }

              return !existingPaymentIds.has(
                String(
                  transactionId,
                ),
              );
            },
          );


        if (
          candidatePayments.length ===
          0
        ) {
          return {
            generatedCount: 0,
            failedCount: 0,
          };
        }


        // ====================================================
        // GENERATE MISSING INVOICES
        // ====================================================

        const results =
          await Promise.allSettled(
            candidatePayments.map(
              (payment) =>
                invoiceApi
                  .generateMissingInvoice(
                    getPaymentTransactionId(
                      payment,
                    ),
                  ),
            ),
          );

        const generatedCount =
          results.filter(
            (result) =>
              result.status ===
              "fulfilled",
          ).length;

        const failedCount =
          results.length -
          generatedCount;


        results.forEach(
          (
            result,
            index,
          ) => {
            if (
              result.status ===
              "rejected"
            ) {
              console.warn(
                "Unable to recover invoice for payment:",
                getPaymentTransactionId(
                  candidatePayments[
                    index
                  ],
                ),
                result.reason,
              );
            }
          },
        );


        return {
          generatedCount,
          failedCount,
        };
      },
      [],
    );


  // ==========================================================
  // LOAD INVOICES
  // ==========================================================

  const loadInvoices =
    useCallback(
      async ({
        recoverMissing = true,
        showRecoveryMessage = false,
      } = {}) => {
        try {
          setLoading(true);

          setError("");

          let currentInvoices =
            await fetchInvoices();

          setInvoices(
            currentInvoices,
          );


          // ==================================================
          // HISTORICAL RECOVERY
          // ==================================================

          if (
            recoverMissing
          ) {
            setRecovering(
              true,
            );

            try {
              const {
                generatedCount,
              } =
                await recoverHistoricalInvoices(
                  currentInvoices,
                );

              if (
                generatedCount >
                0
              ) {
                currentInvoices =
                  await fetchInvoices();

                setInvoices(
                  currentInvoices,
                );

                if (
                  showRecoveryMessage
                ) {
                  setSuccess(
                    generatedCount ===
                      1
                      ? "1 missing invoice was recovered successfully."
                      : `${generatedCount} missing invoices were recovered successfully.`,
                  );
                }
              }
            } catch (
              recoveryError
            ) {
              /*
               * Recovery is secondary.
               *
               * Existing invoices should remain usable even
               * when historical recovery fails.
               */
              console.warn(
                "Historical invoice recovery failed:",
                recoveryError,
              );
            } finally {
              setRecovering(
                false,
              );
            }
          }
        } catch (
          requestError
        ) {
          console.error(
            "Failed to load student invoices:",
            requestError,
          );

          setError(
            requestError
              ?.response?.data
              ?.message ||
              requestError
                ?.response?.data
                ?.error ||
              requestError
                ?.message ||
              "Unable to load invoices.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        fetchInvoices,
        recoverHistoricalInvoices,
      ],
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadInvoices({
      recoverMissing: true,
      showRecoveryMessage:
        false,
    });
  }, [loadInvoices]);


  // ==========================================================
  // NOTIFICATION DEEP LINK
  // ==========================================================

  useEffect(() => {
    if (
      loading ||
      !fromNotification
    ) {
      return;
    }


    if (
      notificationReferenceType !==
      "INVOICE"
    ) {
      navigate(
        location.pathname,
        {
          replace: true,
          state: null,
        },
      );

      return;
    }


    if (
      !notificationReferenceId
    ) {
      navigate(
        location.pathname,
        {
          replace: true,
          state: null,
        },
      );

      return;
    }


    const matchingInvoice =
      invoices.find(
        (invoice) =>
          Number(
            getInvoiceId(
              invoice,
            ),
          ) ===
          Number(
            notificationReferenceId,
          ),
      );


    if (
      !matchingInvoice
    ) {
      setError(
        `Invoice #${notificationReferenceId} could not be found.`,
      );

      navigate(
        location.pathname,
        {
          replace: true,
          state: null,
        },
      );

      return;
    }


    const targetInvoiceId =
      getInvoiceId(
        matchingInvoice,
      );

    setHighlightedInvoiceId(
      targetInvoiceId,
    );

    setSuccess(
      `Invoice ${
        matchingInvoice
          .invoiceNumber ||
        `#${targetInvoiceId}`
      } opened from notification.`,
    );


    navigate(
      location.pathname,
      {
        replace: true,
        state: null,
      },
    );
  }, [
    loading,
    fromNotification,
    notificationReferenceId,
    notificationReferenceType,
    invoices,
    location.pathname,
    navigate,
  ]);


  // ==========================================================
  // SCROLL TO HIGHLIGHTED INVOICE
  // ==========================================================

  useEffect(() => {
    if (
      !highlightedInvoiceId ||
      loading
    ) {
      return;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          document
            .getElementById(
              `student-invoice-${highlightedInvoiceId}`,
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
        },
        150,
      );

    return () =>
      window.clearTimeout(
        timeoutId,
      );
  }, [
    highlightedInvoiceId,
    loading,
    invoices,
  ]);


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {
      setSuccess("");

      await loadInvoices({
        recoverMissing: true,
        showRecoveryMessage:
          true,
      });
    };


  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload =
    async (invoice) => {
      const invoiceId =
        getInvoiceId(
          invoice,
        );

      try {
        setDownloadingId(
          invoiceId,
        );

        setError("");

        await invoiceApi
          .downloadGlobalInvoice(
            invoiceId,
            invoice.invoiceNumber,
          );
      } catch (
        requestError
      ) {
        console.error(
          "Failed to download invoice:",
          requestError,
        );

        setError(
          requestError
            ?.response?.data
            ?.message ||
            requestError
              ?.response?.data
              ?.error ||
            requestError
              ?.message ||
            "Unable to download invoice.",
        );
      } finally {
        setDownloadingId(
          null,
        );
      }
    };


  // ==========================================================
  // REGENERATE PDF
  // ==========================================================

  const handleRegeneratePdf =
    async (invoice) => {
      const invoiceId =
        getInvoiceId(
          invoice,
        );

      if (!invoiceId) {
        setError(
          "Invoice ID is required.",
        );

        return;
      }

      try {
        setRegeneratingId(
          invoiceId,
        );

        setError("");

        setSuccess("");

        await invoiceApi
          .regeneratePdf(
            invoiceId,
            invoice.invoiceNumber,
          );

        setSuccess(
          `Invoice ${
            invoice.invoiceNumber ||
            `#${invoiceId}`
          } PDF regenerated successfully.`,
        );

        const refreshedInvoices =
          await fetchInvoices();

        setInvoices(
          refreshedInvoices,
        );

        setHighlightedInvoiceId(
          invoiceId,
        );
      } catch (
        requestError
      ) {
        console.error(
          "Failed to regenerate invoice PDF:",
          requestError,
        );

        setError(
          requestError
            ?.response?.data
            ?.message ||
            requestError
              ?.response?.data
              ?.error ||
            requestError
              ?.message ||
            "Unable to regenerate invoice PDF.",
        );
      } finally {
        setRegeneratingId(
          null,
        );
      }
    };


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(() => {
      const totalInvoices =
        invoices.length;

      const totalPaid =
        invoices.reduce(
          (
            sum,
            invoice,
          ) =>
            sum +
            Number(
              invoice.totalAmount ??
                0,
            ),
          0,
        );

      const latestInvoice =
        invoices[0] ?? null;

      return {
        totalInvoices,
        totalPaid,
        latestInvoice,
      };
    }, [invoices]);


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1220,
        mx: "auto",
        pb: 5,
      }}
    >

      {/* ===================================================== */}
      {/* PREMIUM HERO */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",

          mb: 3,

          borderRadius: 4,

          border: "1px solid",

          borderColor:
            alpha(
              theme.palette.primary.main,
              0.13,
            ),

          background: `
            linear-gradient(
              135deg,
              ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark"
                  ? 0.2
                  : 0.095,
              )} 0%,
              ${alpha(
                theme.palette.background.paper,
                0.99,
              )} 52%,
              ${alpha(
                theme.palette.primary.main,
                0.025,
              )} 100%
            )
          `,

          boxShadow:
            `0 18px 52px ${alpha(
              theme.palette.common.black,
              theme.palette.mode === "dark"
                ? 0.2
                : 0.055,
            )}`,

          "&::before": {
            content: '""',

            position:
              "absolute",

            width: 330,
            height: 330,

            borderRadius:
              "50%",

            right: -120,
            top: -210,

            bgcolor:
              alpha(
                theme.palette.primary.main,
                0.08,
              ),
          },

          "&::after": {
            content: '""',

            position:
              "absolute",

            width: 160,
            height: 160,

            borderRadius:
              "50%",

            right: 230,
            bottom: -120,

            bgcolor:
              alpha(
                theme.palette.primary.main,
                0.035,
              ),
          },
        }}
      >
        <CardContent
          sx={{
            position:
              "relative",

            zIndex: 1,

            p: {
              xs: 2.5,
              sm: 3,
              md: 4,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,
                sm: 3,
                md: 4,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            justifyContent="space-between"
            spacing={3}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,

                  borderRadius: 3,

                  display: "grid",

                  placeItems:
                    "center",

                  color:
                    "primary.main",

                  bgcolor:
                    alpha(
                      theme.palette.primary.main,
                      0.1,
                    ),

                  boxShadow:
                    `0 10px 28px ${alpha(
                      theme.palette.primary.main,
                      0.12,
                    )}`,
                }}
              >
                <ReceiptLong
                  sx={{
                    fontSize: 31,
                  }}
                />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    sx={{
                      letterSpacing:
                        "-0.035em",
                    }}
                  >
                    My Invoices
                  </Typography>

                  <Chip
                    size="small"
                    icon={
                      <AutoAwesomeRounded />
                    }
                    label="Document Center"
                    sx={{
                      fontWeight:
                        700,

                      color:
                        "primary.main",

                      bgcolor:
                        alpha(
                          theme.palette.primary.main,
                          0.075,
                        ),

                      "& .MuiChip-icon":
                        {
                          color:
                            "primary.main",
                        },
                    }}
                  />
                </Stack>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.7,

                    maxWidth: 610,

                    lineHeight: 1.7,
                  }}
                >
                  Access your official LibraryHub payment invoices,
                  download PDFs and recover historical documents.
                </Typography>
              </Box>
            </Stack>


            <Button
              variant="outlined"
              startIcon={
                recovering ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <Refresh />
                )
              }
              disabled={
                loading ||
                recovering
              }
              onClick={
                handleRefresh
              }
              sx={{
                minHeight: 46,

                px: 2.4,

                borderRadius:
                  2.5,

                borderWidth:
                  "1.5px",

                textTransform:
                  "none",

                fontWeight:
                  800,

                "&:hover": {
                  borderWidth:
                    "1.5px",

                  bgcolor:
                    alpha(
                      theme.palette.primary.main,
                      0.05,
                    ),
                },
              }}
            >
              {recovering
                ? "Checking..."
                : "Refresh Invoices"}
            </Button>
          </Stack>
        </CardContent>
      </Card>


      {/* ===================================================== */}
      {/* SUMMARY CARDS */}
      {/* ===================================================== */}

      {!loading &&
        invoices.length >
          0 && (
          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <SummaryCard
                icon={
                  <DescriptionOutlined />
                }
                label="Total Invoices"
                value={
                  summary.totalInvoices
                }
                caption="Official payment documents"
              />
            </Grid>


            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <SummaryCard
                icon={
                  <AccountBalanceWalletOutlined />
                }
                label="Total Invoiced"
                value={formatMoney(
                  summary.totalPaid,
                  invoices[0]
                    ?.currency ||
                    "INR",
                )}
                caption="Across available invoices"
              />
            </Grid>


            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <SummaryCard
                icon={
                  <CalendarMonthOutlined />
                }
                label="Latest Invoice"
                value={
                  summary
                    .latestInvoice
                    ?.invoiceDate
                    ? formatDate(
                        summary
                          .latestInvoice
                          .invoiceDate,
                      )
                    : "-"
                }
                caption={
                  summary
                    .latestInvoice
                    ?.invoiceNumber ||
                  "Latest available document"
                }
              />
            </Grid>
          </Grid>
        )}


      {/* ===================================================== */}
      {/* ALERTS */}
      {/* ===================================================== */}

      {success && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess("")
          }
          sx={{
            mb: 2.5,

            borderRadius: 3,

            border:
              "1px solid",

            borderColor:
              alpha(
                theme.palette.success.main,
                0.2,
              ),
          }}
        >
          {success}
        </Alert>
      )}


      {recovering && (
        <Alert
          severity="info"
          icon={
            <CircularProgress
              size={18}
            />
          }
          sx={{
            mb: 2.5,

            borderRadius:
              3,
          }}
        >
          Checking successful payments for missing historical
          invoices...
        </Alert>
      )}


      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError("")
          }
          sx={{
            mb: 2.5,

            borderRadius:
              3,
          }}
        >
          {error}
        </Alert>
      )}


      {/* ===================================================== */}
      {/* LOADING */}
      {/* ===================================================== */}

      {loading ? (
        <Card
          elevation={0}
          sx={{
            border:
              "1px solid",

            borderColor:
              "divider",

            borderRadius:
              4,
          }}
        >
          <CardContent
            sx={{
              py: "72px !important",
            }}
          >
            <Stack
              alignItems="center"
              spacing={2}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,

                  display:
                    "grid",

                  placeItems:
                    "center",

                  borderRadius:
                    "50%",

                  bgcolor:
                    alpha(
                      theme.palette.primary.main,
                      0.08,
                    ),
                }}
              >
                <CircularProgress
                  size={32}
                />
              </Box>

              <Box
                textAlign="center"
              >
                <Typography
                  fontWeight={800}
                >
                  Loading invoices
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.4,
                  }}
                >
                  Preparing your payment documents.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : invoices.length ===
        0 ? (

        // ====================================================
        // EMPTY STATE
        // ====================================================

        <Card
          elevation={0}
          sx={{
            border:
              "1px dashed",

            borderColor:
              alpha(
                theme.palette.primary.main,
                0.25,
              ),

            borderRadius:
              4,

            bgcolor:
              alpha(
                theme.palette.primary.main,
                0.018,
              ),
          }}
        >
          <CardContent
            sx={{
              py: "70px !important",
            }}
          >
            <Stack
              alignItems="center"
              textAlign="center"
              spacing={2}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,

                  display:
                    "grid",

                  placeItems:
                    "center",

                  borderRadius:
                    4,

                  color:
                    "primary.main",

                  bgcolor:
                    alpha(
                      theme.palette.primary.main,
                      0.08,
                    ),
                }}
              >
                <ReceiptLong
                  sx={{
                    fontSize: 37,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  No invoices yet
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.6,

                    maxWidth: 450,

                    lineHeight: 1.7,
                  }}
                >
                  Your invoices will appear here automatically after
                  eligible successful payments.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={
                  <Refresh />
                }
                onClick={
                  handleRefresh
                }
                disabled={
                  recovering
                }
                sx={{
                  mt: 1,

                  px: 2.4,

                  minHeight:
                    44,

                  borderRadius:
                    2.5,

                  textTransform:
                    "none",

                  fontWeight:
                    800,
                }}
              >
                Check for Invoices
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (

        // ====================================================
        // INVOICE LIST
        // ====================================================

        <Stack spacing={2.5}>
          {invoices.map(
            (
              invoice,
              index,
            ) => {
              const invoiceId =
                getInvoiceId(
                  invoice,
                );

              const highlighted =
                String(
                  invoiceId,
                ) ===
                String(
                  highlightedInvoiceId,
                );

              const downloading =
                downloadingId ===
                invoiceId;

              const regenerating =
                regeneratingId ===
                invoiceId;

              const transactionId =
                getInvoicePaymentTransactionId(
                  invoice,
                );

              const status =
                invoice.status ||
                "GENERATED";

              return (
                <Card
                  id={`student-invoice-${invoiceId}`}
                  key={
                    invoiceId
                  }
                  elevation={0}
                  sx={{
                    position:
                      "relative",

                    overflow:
                      "hidden",

                    border:
                      highlighted
                        ? "2px solid"
                        : "1px solid",

                    borderColor:
                      highlighted
                        ? "primary.main"
                        : alpha(
                            theme.palette.divider,
                            0.9,
                          ),

                    borderRadius:
                      4,

                    bgcolor:
                      highlighted
                        ? alpha(
                            theme.palette.primary.main,
                            0.035,
                          )
                        : "background.paper",

                    boxShadow:
                      highlighted
                        ? `0 18px 45px ${alpha(
                            theme.palette.primary.main,
                            0.14,
                          )}`
                        : `0 8px 30px ${alpha(
                            theme.palette.common.black,
                            theme.palette.mode ===
                              "dark"
                              ? 0.12
                              : 0.035,
                          )}`,

                    transition:
                      "all 0.25s ease",

                    "&:hover": {
                      transform:
                        "translateY(-2px)",

                      borderColor:
                        alpha(
                          theme.palette.primary.main,
                          0.22,
                        ),

                      boxShadow:
                        `0 16px 42px ${alpha(
                          theme.palette.common.black,
                          theme.palette.mode ===
                            "dark"
                            ? 0.18
                            : 0.07,
                        )}`,
                    },

                    "&::before": {
                      content:
                        '""',

                      position:
                        "absolute",

                      top: 0,
                      left: 0,
                      bottom: 0,

                      width: 4,

                      bgcolor:
                        highlighted
                          ? "primary.main"
                          : alpha(
                              theme.palette.primary.main,
                              0.45,
                            ),
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: {
                        xs: 2.3,
                        md: 3,
                      },

                      "&:last-child":
                        {
                          pb: {
                            xs: 2.3,
                            md: 3,
                          },
                        },
                    }}
                  >

                    {/* ======================================== */}
                    {/* TOP */}
                    {/* ======================================== */}

                    <Stack
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "stretch",
                        md: "flex-start",
                      }}
                      spacing={2.5}
                    >
                      <Stack
                        direction="row"
                        spacing={1.6}
                        alignItems="flex-start"
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,

                            flexShrink: 0,

                            display:
                              "grid",

                            placeItems:
                              "center",

                            borderRadius:
                              2.6,

                            bgcolor:
                              alpha(
                                theme.palette.primary.main,
                                0.085,
                              ),

                            color:
                              "primary.main",
                          }}
                        >
                          <ReceiptLong />
                        </Box>

                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Typography
                              variant="h6"
                              fontWeight={900}
                              sx={{
                                letterSpacing:
                                  "-0.02em",
                              }}
                            >
                              {invoice.invoiceNumber ||
                                `Invoice #${invoiceId}`}
                            </Typography>

                            {index ===
                              0 && (
                              <Chip
                                size="small"
                                label="Latest"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  height: 24,

                                  fontWeight:
                                    700,
                                }}
                              />
                            )}
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                            sx={{
                              mt: 0.6,
                            }}
                          >
                            <CalendarMonthOutlined
                              sx={{
                                fontSize: 16,

                                color:
                                  "text.secondary",
                              }}
                            />

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Issued{" "}
                              {formatDate(
                                invoice.invoiceDate,
                              )}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>


                      {/* ====================================== */}
                      {/* ACTIONS */}
                      {/* ====================================== */}

                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        spacing={1}
                        alignItems={{
                          xs: "stretch",
                          sm: "center",
                        }}
                      >
                        <Chip
                          size="small"
                          icon={
                            <CheckCircleRounded />
                          }
                          label={
                            status
                          }
                          color={
                            getInvoiceStatusColor(
                              status,
                            )
                          }
                          variant="outlined"
                          sx={{
                            height: 34,

                            fontWeight:
                              800,

                            borderRadius:
                              2,

                            "& .MuiChip-icon":
                              {
                                fontSize:
                                  17,
                              },
                          }}
                        />

                        <Button
                          variant="outlined"
                          startIcon={
                            regenerating ? (
                              <CircularProgress
                                size={18}
                                color="inherit"
                              />
                            ) : (
                              <RestartAlt />
                            )
                          }
                          disabled={
                            regenerating ||
                            downloading
                          }
                          onClick={() =>
                            handleRegeneratePdf(
                              invoice,
                            )
                          }
                          sx={{
                            minHeight:
                              40,

                            px: 1.8,

                            borderRadius:
                              2.3,

                            textTransform:
                              "none",

                            fontWeight:
                              700,

                            borderWidth:
                              "1.5px",

                            "&:hover":
                              {
                                borderWidth:
                                  "1.5px",

                                bgcolor:
                                  alpha(
                                    theme.palette.primary.main,
                                    0.04,
                                  ),
                              },
                          }}
                        >
                          {regenerating
                            ? "Regenerating..."
                            : "Regenerate"}
                        </Button>

                        <Button
                          variant="contained"
                          startIcon={
                            downloading ? (
                              <CircularProgress
                                size={18}
                                color="inherit"
                              />
                            ) : (
                              <Download />
                            )
                          }
                          disabled={
                            downloading ||
                            regenerating
                          }
                          onClick={() =>
                            handleDownload(
                              invoice,
                            )
                          }
                          sx={{
                            minHeight:
                              40,

                            px: 2,

                            borderRadius:
                              2.3,

                            textTransform:
                              "none",

                            fontWeight:
                              800,

                            boxShadow:
                              `0 7px 20px ${alpha(
                                theme.palette.primary.main,
                                0.2,
                              )}`,

                            "&:hover":
                              {
                                boxShadow:
                                  `0 10px 26px ${alpha(
                                    theme.palette.primary.main,
                                    0.28,
                                  )}`,
                              },
                          }}
                        >
                          {downloading
                            ? "Downloading..."
                            : "Download PDF"}
                        </Button>
                      </Stack>
                    </Stack>


                    <Divider
                      sx={{
                        my: 2.5,
                      }}
                    />


                    {/* ======================================== */}
                    {/* FINANCIAL DETAILS */}
                    {/* ======================================== */}

                    <Grid
                      container
                      spacing={1.5}
                    >
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 3,
                        }}
                      >
                        <InvoiceDetail
                          icon={
                            <PaymentsOutlined />
                          }
                          label="Taxable Amount"
                          value={formatMoney(
                            invoice.taxableAmount,
                            invoice.currency,
                          )}
                        />
                      </Grid>


                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 3,
                        }}
                      >
                        <InvoiceDetail
                          icon={
                            <DescriptionOutlined />
                          }
                          label="GST"
                          value={`${
                            invoice.gstPercentage ??
                            0
                          }%`}
                        />
                      </Grid>


                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 3,
                        }}
                      >
                        <InvoiceDetail
                          icon={
                            <AccountBalanceWalletOutlined />
                          }
                          label="Total Amount"
                          value={formatMoney(
                            invoice.totalAmount,
                            invoice.currency,
                          )}
                          emphasize
                        />
                      </Grid>


                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 3,
                        }}
                      >
                        <InvoiceDetail
                          icon={
                            <CalendarMonthOutlined />
                          }
                          label="Paid On"
                          value={formatDate(
                            invoice.paymentDate,
                          )}
                        />
                      </Grid>
                    </Grid>


                    {/* ======================================== */}
                    {/* FOOTER */}
                    {/* ======================================== */}

                    {transactionId && (
                      <Box
                        sx={{
                          mt: 2.5,

                          px: 1.6,

                          py: 1.2,

                          borderRadius:
                            2.5,

                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap: 1,

                          bgcolor:
                            alpha(
                              theme.palette.background.default,
                              theme.palette.mode ===
                                "dark"
                                ? 0.18
                                : 0.55,
                            ),

                          border:
                            "1px solid",

                          borderColor:
                            "divider",
                        }}
                      >
                        <CheckCircleRounded
                          sx={{
                            fontSize: 17,

                            color:
                              "success.main",
                          }}
                        />

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Payment Transaction
                        </Typography>

                        <Typography
                          variant="caption"
                          fontWeight={800}
                        >
                          #{transactionId}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            },
          )}
        </Stack>
      )}
    </Box>
  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  icon,
  label,
  value,
  caption,
}) {
  const theme =
    useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        border:
          "1px solid",

        borderColor:
          "divider",

        borderRadius:
          3,

        transition:
          "all 0.2s ease",

        "&:hover": {
          transform:
            "translateY(-2px)",

          borderColor:
            alpha(
              theme.palette.primary.main,
              0.2,
            ),

          boxShadow:
            `0 10px 28px ${alpha(
              theme.palette.common.black,
              theme.palette.mode ===
                "dark"
                ? 0.14
                : 0.05,
            )}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.3,

          "&:last-child": {
            pb: 2.3,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <Box
            sx={{
              width: 46,
              height: 46,

              flexShrink: 0,

              display: "grid",

              placeItems:
                "center",

              borderRadius:
                2.5,

              color:
                "primary.main",

              bgcolor:
                alpha(
                  theme.palette.primary.main,
                  0.075,
                ),

              "& svg": {
                fontSize: 23,
              },
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {label}
            </Typography>

            <Typography
              variant="h6"
              fontWeight={900}
              noWrap
              sx={{
                mt: 0.15,

                letterSpacing:
                  "-0.02em",
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
            >
              {caption}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}


// ============================================================
// INVOICE DETAIL
// ============================================================

function InvoiceDetail({
  icon,
  label,
  value,
  emphasize = false,
}) {
  const theme =
    useTheme();

  return (
    <Box
      sx={{
        height: "100%",

        minHeight: 92,

        p: 1.7,

        borderRadius:
          2.7,

        border:
          "1px solid",

        borderColor:
          emphasize
            ? alpha(
                theme.palette.primary.main,
                0.18,
              )
            : "divider",

        bgcolor:
          emphasize
            ? alpha(
                theme.palette.primary.main,
                0.04,
              )
            : alpha(
                theme.palette.background.default,
                theme.palette.mode ===
                  "dark"
                  ? 0.14
                  : 0.42,
              ),
      }}
    >
      <Stack
        direction="row"
        spacing={1.2}
        alignItems="center"
      >
        <Box
          sx={{
            width: 38,
            height: 38,

            flexShrink: 0,

            display: "grid",

            placeItems:
              "center",

            borderRadius:
              2,

            bgcolor:
              alpha(
                theme.palette.primary.main,
                0.07,
              ),

            color:
              emphasize
                ? "primary.main"
                : "text.secondary",

            "& svg": {
              fontSize: 19,
            },
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
          >
            {label}
          </Typography>

          <Typography
            fontWeight={
              emphasize
                ? 900
                : 750
            }
            color={
              emphasize
                ? "primary.main"
                : "text.primary"
            }
            sx={{
              mt: 0.15,

              overflowWrap:
                "anywhere",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}


export default StudentInvoices;