import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import SeatChangeRequestStatus from "../SeatChangeRequest/components/SeatChangeRequestStatus";

import OwnerReviewDialog from "./components/OwnerReviewDialog";

const mockRequests = [
  {
    id: 1001,
    userName: "Rahul Sharma",
    userId: 101,
    bookingId: 501,
    currentSeatNumber: "A3",
    requestedSeatNumber: "D2",
    reason: "I would prefer a quieter seat near the reading area.",
    status: "PENDING",
    requestedAt: "2026-09-25T10:30:00",
  },
  {
    id: 1002,
    userName: "Priya Singh",
    userId: 102,
    bookingId: 502,
    currentSeatNumber: "B2",
    requestedSeatNumber: "C5",
    reason: "I need a seat closer to the charging point.",
    status: "APPROVED",
    requestedAt: "2026-09-22T09:15:00",
  },
  {
    id: 1003,
    userName: "Amit Kumar",
    userId: 103,
    bookingId: 503,
    currentSeatNumber: "D4",
    requestedSeatNumber: "E1",
    reason: "I need a seat with better lighting.",
    status: "REJECTED",
    requestedAt: "2026-09-20T14:00:00",
  },
];

function SeatChangeRequests() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [requests, setRequests] = useState(mockRequests);

  const [reviewRequest, setReviewRequest] = useState(null);

  const [reviewAction, setReviewAction] = useState(null);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.userName.toLowerCase().includes(search.toLowerCase()) ||
        String(request.id).includes(search) ||
        request.currentSeatNumber
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        request.requestedSeatNumber
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus = status === "ALL" || request.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, status]);

  const handleApprove = (request) => {
    setReviewRequest(request);
    setReviewAction("APPROVE");
  };

  const handleReject = (request) => {
    setReviewRequest(request);
    setReviewAction("REJECT");
  };

  const handleCloseReview = () => {
    setReviewRequest(null);
    setReviewAction(null);
  };

  const handleReviewConfirm = ({ requestId, status, ownerComment }) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              ownerComment,
              reviewedAt: new Date().toISOString(),
            }
          : request,
      ),
    );

    handleCloseReview();
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Seat Change Requests
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Review and manage member seat change requests.
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search member, request or seat..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                ),
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={(event) => setStatus(event.target.value)}
              >
                <MenuItem value="ALL">All Requests</MenuItem>

                <MenuItem value="PENDING">Pending</MenuItem>

                <MenuItem value="APPROVED">Approved</MenuItem>

                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {filteredRequests.map((request) => (
          <Grid item xs={12} key={request.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        {request.userName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Request #{request.id} · Booking #{request.bookingId}
                      </Typography>
                    </Box>

                    <SeatChangeRequestStatus status={request.status} />
                  </Stack>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={4}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current Seat
                      </Typography>

                      <Typography fontWeight={700}>
                        {request.currentSeatNumber}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Requested Seat
                      </Typography>

                      <Typography fontWeight={700}>
                        {request.requestedSeatNumber}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Reason
                      </Typography>

                      <Typography variant="body2">{request.reason}</Typography>
                    </Box>
                  </Stack>

                  {request.status === "PENDING" && (
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={1}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={() => handleReject(request)}
                      >
                        Reject
                      </Button>

                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(request)}
                      >
                        Approve
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredRequests.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography align="center" color="text.secondary" py={4}>
                  No seat change requests found.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        <OwnerReviewDialog
          open={Boolean(reviewRequest)}
          request={reviewRequest}
          action={reviewAction}
          onClose={handleCloseReview}
          onConfirm={handleReviewConfirm}
        />
      </Grid>
    </Box>
  );
}

export default SeatChangeRequests;
