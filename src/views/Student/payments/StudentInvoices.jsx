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

import { Download, ReceiptLong } from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";

import invoiceApi from "../../../api/invoiceApi";

const formatMoney = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StudentInvoices() {
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [downloadingId, setDownloadingId] = useState(null);

  const [error, setError] = useState("");

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await invoiceApi.getMyInvoices();

      setInvoices(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Failed to load student invoices:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load invoices.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleDownload = async (invoice) => {
    try {
      setDownloadingId(invoice.invoiceId);

      setError("");

      await invoiceApi.downloadGlobalInvoice(
        invoice.invoiceId,
        invoice.invoiceNumber,
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to download invoice.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>
        Invoices
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,
          mb: 3,
        }}
      >
        View and download invoices for your successful payments.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            py: 8,
          }}
        >
          <CircularProgress />

          <Typography color="text.secondary">Loading invoices...</Typography>
        </Stack>
      ) : invoices.length === 0 ? (
        <Alert severity="info">No invoices are available yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {invoices.map((invoice) => (
            <Card
              key={invoice.invoiceId}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" spacing={1.5}>
                    <ReceiptLong color="primary" />

                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        {invoice.invoiceNumber}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Invoice date: {formatDate(invoice.invoiceDate)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={invoice.status || "GENERATED"}
                      color="success"
                      variant="outlined"
                    />

                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      disabled={downloadingId === invoice.invoiceId}
                      onClick={() => handleDownload(invoice)}
                    >
                      {downloadingId === invoice.invoiceId
                        ? "Downloading..."
                        : "Download PDF"}
                    </Button>
                  </Stack>
                </Stack>

                <Divider
                  sx={{
                    my: 2,
                  }}
                />

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Taxable Amount
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatMoney(invoice.taxableAmount, invoice.currency)}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      GST
                    </Typography>

                    <Typography fontWeight={600}>
                      {invoice.gstPercentage ?? 0}%
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>

                    <Typography fontWeight={800} color="primary.main">
                      {formatMoney(invoice.totalAmount, invoice.currency)}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Due Date
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatDate(invoice.dueDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default StudentInvoices;
