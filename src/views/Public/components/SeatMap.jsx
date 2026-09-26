import { Chair } from "@mui/icons-material";

import {
    Box,
    Stack,
    Typography,
} from "@mui/material";

function SeatMap({
    seats,
    selectedSeat,
    onSelect,
}) {
    return (
        <Stack spacing={3}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 620,
                    mx: "auto",
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(5, minmax(55px, 1fr))",
                        gap: {
                            xs: 1,
                            sm: 1.5,
                        },
                    }}
                >
                    {seats.map((seat) => {
                        const occupied =
                            seat.status ===
                            "OCCUPIED";

                        const selected =
                            selectedSeat?.id ===
                            seat.id;

                        return (
                            <Box
                                key={seat.id}
                                onClick={() => {
                                    if (
                                        !occupied
                                    ) {
                                        onSelect(
                                            seat
                                        );
                                    }
                                }}
                                sx={{
                                    aspectRatio: "1",
                                    borderRadius: 2,
                                    border: "1.5px solid",
                                    borderColor:
                                        selected
                                            ? "#146EF5"
                                            : occupied
                                            ? "#FCA5A5"
                                            : "#86EFAC",

                                    backgroundColor:
                                        selected
                                            ? "#E8F1FF"
                                            : occupied
                                            ? "#FEE2E2"
                                            : "#DCFCE7",

                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",

                                    cursor: occupied
                                        ? "not-allowed"
                                        : "pointer",

                                    opacity:
                                        occupied
                                            ? 0.65
                                            : 1,

                                    transition:
                                        "all 0.15s ease",

                                    "&:hover":
                                        occupied
                                            ? {}
                                            : {
                                                  transform:
                                                      "translateY(-3px)",
                                                  boxShadow:
                                                      "0 5px 15px rgba(20,110,245,0.12)",
                                              },
                                }}
                            >
                                <Chair
                                    sx={{
                                        fontSize: {
                                            xs: 20,
                                            sm: 24,
                                        },
                                        color:
                                            selected
                                                ? "#146EF5"
                                                : occupied
                                                ? "#DC2626"
                                                : "#16A34A",
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        color: "#334155",
                                    }}
                                >
                                    {seat.number}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Stack>
    );
}

export default SeatMap;