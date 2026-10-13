import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  Add,
  CancelOutlined,
  EventSeat,
  Refresh,
  SwapHoriz,
} from "@mui/icons-material";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import studentSeatChangeApi
  from "../../../api/studentSeatChangeApi";

const statusColor = (
  status
) => {
  switch (status) {
    case "PENDING":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "error";

    default:
      return "default";
  }
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

function MySeatChangeRequests() {
  const navigate =
    useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    cancellingId,
    setCancellingId,
  ] = useState(null);

  const loadRequests =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await studentSeatChangeApi
              .getMyRequests();

          setRequests(
            Array.isArray(response)
              ? response
              : []
          );
        } catch (requestError) {
          console.error(
            "Failed to load seat change requests:",
            requestError
          );

          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load seat change requests."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadRequests();
  }, [
    loadRequests,
  ]);

  const handleCancel =
    async (requestId) => {
      try {
        setCancellingId(
          requestId
        );

        setError("");

        await studentSeatChangeApi
          .cancelRequest(
            requestId
          );

        await loadRequests();
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to cancel the seat change request."
        );
      } finally {
        setCancellingId(
          null
        );
      }
    };

  return (
    <Box>
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
            variant="h4"
            fontWeight={800}
          >
            Seat Change Requests
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Track your requested seat changes and their approval status.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={
              <Refresh />
            }
            onClick={
              loadRequests
            }
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              navigate(
                "/student/seat-change/request"
              )
            }
          >
            New Request
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack
          alignItems="center"
          spacing={2}
          sx={{ py: 8 }}
        >
          <CircularProgress />

          <Typography color="text.secondary">
            Loading requests...
          </Typography>
        </Stack>
      ) : requests.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              No seat change requests
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
                mb: 2,
              }}
            >
              You have not requested a seat change yet.
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  "/student/seat-change/request"
                )
              }
            >
              Request Seat Change
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {requests.map(
            (request) => {
              const pending =
                request.status ===
                "PENDING";

              return (
                <Card
                  key={
                    request.requestId
                  }
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor:
                      pending
                        ? "warning.light"
                        : "divider",
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Request
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight={800}
                        >
                          #
                          {
                            request.requestId
                          }
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={
                          request.status
                        }
                        color={
                          statusColor(
                            request.status
                          )
                        }
                      />
                    </Stack>

                    <Divider
                      sx={{ my: 2 }}
                    />

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                    >
                      <Stack
                        alignItems="center"
                        spacing={0.5}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Current Seat
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <EventSeat />

                          <Typography
                            variant="h6"
                            fontWeight={700}
                          >
                            {
                              request.currentSeat
                            }
                          </Typography>
                        </Stack>
                      </Stack>

                      <SwapHoriz />

                      <Stack
                        alignItems="center"
                        spacing={0.5}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Requested Seat
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <EventSeat
                            color="primary"
                          />

                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="primary.main"
                          >
                            {
                              request.requestedSeat
                            }
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Divider
                      sx={{ my: 2 }}
                    />

                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>
                          Reason:
                        </strong>{" "}
                        {request.reason ||
                          "-"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Requested on:{" "}
                        {formatDateTime(
                          request.requestedAt
                        )}
                      </Typography>

                      {request
                        .rejectionReason && (
                        <Alert
                          severity="error"
                        >
                          {
                            request
                              .rejectionReason
                          }
                        </Alert>
                      )}
                    </Stack>

                    {pending && (
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={
                          <CancelOutlined />
                        }
                        disabled={
                          cancellingId ===
                          request.requestId
                        }
                        onClick={() =>
                          handleCancel(
                            request.requestId
                          )
                        }
                        sx={{ mt: 2 }}
                      >
                        {cancellingId ===
                        request.requestId
                          ? "Cancelling..."
                          : "Cancel Request"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            }
          )}
        </Stack>
      )}
    </Box>
  );
}

export default MySeatChangeRequests;