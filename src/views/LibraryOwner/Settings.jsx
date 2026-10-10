import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  CheckCircle,
  EventSeat,
  LibraryBooks,
  Notifications,
  Refresh,
  Save,
  Security,
} from "@mui/icons-material";

import libraryApi from "../../api/libraryApi";
import settingsApi from "../../api/settingsApi";

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const defaultSettings = {
  // ---------------------------------------------------------
  // LIBRARY CORE DATA
  // ---------------------------------------------------------

  libraryName: "",
  email: "",
  phone: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  openingTime: "",
  closingTime: "",

  description: "",

  totalSeats: 0,

  latitude: null,
  longitude: null,

  // ---------------------------------------------------------
  // GENERAL SETTINGS
  // ---------------------------------------------------------

  timezone: "Asia/Kolkata",

  // ---------------------------------------------------------
  // LIBRARY SETTINGS
  // ---------------------------------------------------------

  allowPublicDiscovery: true,

  allowOnlineBooking: true,

  // ---------------------------------------------------------
  // BOOKING SETTINGS
  // ---------------------------------------------------------

  autoConfirmBooking: true,

  allowCancellation: true,

  cancellationHours: 2,

  allowSeatChangeRequest: true,

  // ---------------------------------------------------------
  // NOTIFICATION SETTINGS
  // ---------------------------------------------------------

  emailNotifications: true,

  smsNotifications: false,

  inAppNotifications: true,

  bookingNotifications: true,

  paymentNotifications: true,

  membershipNotifications: true,
};

// ============================================================
// HELPERS
// ============================================================

const normalizeLibraries = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};

const normalizeTime = (value) => {
  if (!value) {
    return "";
  }

  /*
   * Backend LocalTime may arrive as:
   *
   * 06:00
   * 06:00:00
   *
   * HTML time input requires HH:mm.
   */
  return String(value).slice(0, 5);
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ============================================================
// COMPONENT
// ============================================================

function Settings() {
  // ========================================================
  // PAGE STATE
  // ========================================================

  const [activeTab, setActiveTab] = useState(0);

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [settings, setSettings] = useState(defaultSettings);

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [loadingSettings, setLoadingSettings] = useState(false);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // ========================================================
  // UPDATE ONE FIELD
  // ========================================================

  const updateSetting = (field, value) => {
    setSettings((previous) => ({
      ...previous,

      [field]: value,
    }));

    setSuccess("");
  };

  // ========================================================
  // LOAD OWNER LIBRARIES
  // ========================================================

  useEffect(() => {
    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);

        setError("");

        const response = await libraryApi.getMyLibraries();

        if (!active) {
          return;
        }

        const data = normalizeLibraries(response);

        setLibraries(data);

        if (data.length > 0) {
          setSelectedLibraryId(String(data[0].id));
        } else {
          setSelectedLibraryId("");

          setError("No library is associated with your account.");
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error("Failed to load owner libraries:", requestError);

        setError(
          getErrorMessage(requestError, "Unable to load your libraries."),
        );
      } finally {
        if (active) {
          setLoadingLibraries(false);
        }
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, []);

  // ========================================================
  // SELECTED OWNER LIBRARY SUMMARY
  // ========================================================

  const selectedOwnerLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,
    [libraries, selectedLibraryId],
  );

  // ========================================================
  // LOAD LIBRARY + SETTINGS
  // ========================================================

  const loadSettings = useCallback(async () => {
    if (!selectedLibraryId) {
      return;
    }

    try {
      setLoadingSettings(true);

      setError("");

      setSuccess("");

      const [libraryDetails, preferences] = await Promise.all([
        libraryApi.getLibraryDetails(selectedLibraryId),

        settingsApi.getSettings(selectedLibraryId),
      ]);

      setSettings({
        // ======================================
        // LIBRARY CORE DATA
        // ======================================

        libraryName: libraryDetails?.name ?? selectedOwnerLibrary?.name ?? "",

        /*
         * LibraryDetailsResponse in some versions
         * does not expose email, so fall back to
         * the owner's library list response.
         */
        email: libraryDetails?.email ?? selectedOwnerLibrary?.email ?? "",

        phone:
          libraryDetails?.contactNumber ??
          selectedOwnerLibrary?.contactNumber ??
          "",

        address: libraryDetails?.address ?? selectedOwnerLibrary?.address ?? "",

        city: libraryDetails?.city ?? selectedOwnerLibrary?.city ?? "",

        state: libraryDetails?.state ?? selectedOwnerLibrary?.state ?? "",

        pincode:
          libraryDetails?.pincode != null
            ? String(libraryDetails.pincode)
            : selectedOwnerLibrary?.pincode != null
              ? String(selectedOwnerLibrary.pincode)
              : "",

        openingTime: normalizeTime(
          libraryDetails?.openingTime ?? selectedOwnerLibrary?.openingTime,
        ),

        closingTime: normalizeTime(
          libraryDetails?.closingTime ?? selectedOwnerLibrary?.closingTime,
        ),

        description:
          libraryDetails?.description ??
          selectedOwnerLibrary?.description ??
          "",

        totalSeats: Number(
          libraryDetails?.totalSeats ?? selectedOwnerLibrary?.totalSeats ?? 0,
        ),

        latitude:
          libraryDetails?.latitude ?? selectedOwnerLibrary?.latitude ?? null,

        longitude:
          libraryDetails?.longitude ?? selectedOwnerLibrary?.longitude ?? null,

        // ======================================
        // PREFERENCES
        // ======================================

        timezone: preferences?.timezone ?? "Asia/Kolkata",

        allowPublicDiscovery: preferences?.allowPublicDiscovery ?? true,

        allowOnlineBooking: preferences?.allowOnlineBooking ?? true,

        autoConfirmBooking: preferences?.autoConfirmBooking ?? true,

        allowCancellation: preferences?.allowCancellation ?? true,

        cancellationHours: Number(preferences?.cancellationHours ?? 2),

        allowSeatChangeRequest: preferences?.allowSeatChangeRequest ?? true,

        emailNotifications: preferences?.emailNotifications ?? true,

        smsNotifications: preferences?.smsNotifications ?? false,

        inAppNotifications: preferences?.inAppNotifications ?? true,

        bookingNotifications: preferences?.bookingNotifications ?? true,

        paymentNotifications: preferences?.paymentNotifications ?? true,

        membershipNotifications: preferences?.membershipNotifications ?? true,
      });
    } catch (requestError) {
      console.error("Failed to load settings:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to load library settings."),
      );
    } finally {
      setLoadingSettings(false);
    }
  }, [selectedLibraryId, selectedOwnerLibrary]);

  useEffect(() => {
    if (!loadingLibraries && selectedLibraryId) {
      loadSettings();
    }
  }, [loadingLibraries, selectedLibraryId, loadSettings]);

  // ========================================================
  // BUILD LIBRARY UPDATE REQUEST
  // ========================================================

  const buildLibraryPayload = () => {
    /*
     * LibraryController.updateLibrary uses LibraryRequest.
     *
     * We therefore preserve all Library fields instead of
     * sending only the fields visible in Settings.
     *
     * This prevents address, coordinates, description,
     * seat count, etc. from being accidentally cleared.
     */
    return {
      name: settings.libraryName.trim(),

      address: settings.address,

      city: settings.city,

      state: settings.state,

      pincode: settings.pincode,

      contactNumber: settings.phone,

      email: settings.email,

      totalSeats: Number(settings.totalSeats || 0),

      latitude: settings.latitude,

      longitude: settings.longitude,

      openingTime: settings.openingTime || null,

      closingTime: settings.closingTime || null,

      description: settings.description,
    };
  };

  // ========================================================
  // BUILD SETTINGS REQUEST
  // ========================================================

  const buildSettingsPayload = () => {
    return {
      timezone: settings.timezone,

      allowPublicDiscovery: Boolean(settings.allowPublicDiscovery),

      allowOnlineBooking: Boolean(settings.allowOnlineBooking),

      autoConfirmBooking: Boolean(settings.autoConfirmBooking),

      allowCancellation: Boolean(settings.allowCancellation),

      cancellationHours: Math.max(Number(settings.cancellationHours || 0), 0),

      allowSeatChangeRequest: Boolean(settings.allowSeatChangeRequest),

      emailNotifications: Boolean(settings.emailNotifications),

      smsNotifications: Boolean(settings.smsNotifications),

      inAppNotifications: Boolean(settings.inAppNotifications),

      bookingNotifications: Boolean(settings.bookingNotifications),

      paymentNotifications: Boolean(settings.paymentNotifications),

      membershipNotifications: Boolean(settings.membershipNotifications),
    };
  };

  // ========================================================
  // SAVE SETTINGS
  // ========================================================

  const handleSave = async () => {
    if (!selectedLibraryId) {
      return;
    }

    if (!settings.libraryName.trim()) {
      setError("Library name is required.");

      return;
    }

    if (settings.allowCancellation && Number(settings.cancellationHours) < 0) {
      setError("Cancellation window cannot be negative.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      const libraryPayload = buildLibraryPayload();

      const settingsPayload = buildSettingsPayload();

      /*
       * Save the two separate backend domains:
       *
       * Library core information
       * +
       * Library preferences
       */
      await Promise.all([
        libraryApi.updateLibrary(selectedLibraryId, libraryPayload),

        settingsApi.updateSettings(selectedLibraryId, settingsPayload),
      ]);

      setSuccess("Library settings saved successfully.");

      /*
       * Reload from backend so the screen reflects
       * persisted data rather than assuming the write.
       */
      await loadSettings();
    } catch (requestError) {
      console.error("Failed to save settings:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to save library settings."),
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // INITIAL LOADING
  // ========================================================

  if (loadingLibraries) {
    return (
      <Stack
        minHeight={320}
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading your libraries...
        </Typography>
      </Stack>
    );
  }

  // ========================================================
  // UI
  // ========================================================

  return (
    <Box>
      {/* ==================================================
                HEADER
            ================================================== */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Settings
          </Typography>

          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Configure your library, booking and notification preferences.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          {/* LIBRARY SELECTOR */}

          <FormControl
            size="small"
            sx={{
              minWidth: 200,
            }}
          >
            <InputLabel>Library</InputLabel>

            <Select
              label="Library"
              value={selectedLibraryId}
              onChange={(event) => setSelectedLibraryId(event.target.value)}
              disabled={saving}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={
              loadingSettings ? <CircularProgress size={16} /> : <Refresh />
            }
            onClick={loadSettings}
            disabled={loadingSettings || saving || !selectedLibraryId}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : <Save />
            }
            onClick={handleSave}
            disabled={
              saving || loadingSettings || !selectedLibraryId || activeTab === 4
            }
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Stack>

      {/* ==================================================
                ERROR
            ================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ==================================================
                SUCCESS
            ================================================== */}

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{
            mb: 3,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* ==================================================
                SETTINGS TABS
            ================================================== */}

      <Card
        sx={{
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(event, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<LibraryBooks />} iconPosition="start" label="General" />

          <Tab icon={<AccessTime />} iconPosition="start" label="Library" />

          <Tab icon={<EventSeat />} iconPosition="start" label="Booking" />

          <Tab
            icon={<Notifications />}
            iconPosition="start"
            label="Notifications"
          />

          <Tab icon={<Security />} iconPosition="start" label="Security" />
        </Tabs>
      </Card>

      {/* ==================================================
                DATA LOADING
            ================================================== */}

      {loadingSettings ? (
        <Card>
          <CardContent
            sx={{
              py: 10,

              textAlign: "center",
            }}
          >
            <CircularProgress />

            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading library settings...
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ==========================================
                        GENERAL
                    ========================================== */}

          {activeTab === 0 && (
            <Card>
              <CardContent
                sx={{
                  p: 3,
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      General Settings
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Manage the basic information associated with your library.
                    </Typography>
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Library Name"
                        value={settings.libraryName}
                        onChange={(event) =>
                          updateSetting("libraryName", event.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact Email"
                        type="email"
                        value={settings.email}
                        onChange={(event) =>
                          updateSetting("email", event.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact Phone"
                        value={settings.phone}
                        onChange={(event) =>
                          updateSetting("phone", event.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>

                        <Select
                          value={settings.timezone}
                          label="Timezone"
                          onChange={(event) =>
                            updateSetting("timezone", event.target.value)
                          }
                        >
                          <MenuItem value="Asia/Kolkata">
                            India Standard Time (IST)
                          </MenuItem>

                          <MenuItem value="Asia/Dubai">
                            Gulf Standard Time
                          </MenuItem>

                          <MenuItem value="UTC">UTC</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* ==========================================
                        LIBRARY
                    ========================================== */}

          {activeTab === 1 && (
            <Card>
              <CardContent
                sx={{
                  p: 3,
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Library Settings
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Configure operating hours and public availability.
                    </Typography>
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Opening Time"
                        value={settings.openingTime}
                        onChange={(event) =>
                          updateSetting("openingTime", event.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Closing Time"
                        value={settings.closingTime}
                        onChange={(event) =>
                          updateSetting("closingTime", event.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider />

                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allowPublicDiscovery}
                          onChange={(event) =>
                            updateSetting(
                              "allowPublicDiscovery",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={600}>
                            Public Library Discovery
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Allow members to discover your library on
                            LibraryHub.
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allowOnlineBooking}
                          onChange={(event) =>
                            updateSetting(
                              "allowOnlineBooking",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={600}>
                            Online Booking
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Allow members to book seats online.
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* ==========================================
                        BOOKING
                    ========================================== */}

          {activeTab === 2 && (
            <Card>
              <CardContent
                sx={{
                  p: 3,
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Booking Settings
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Control bookings, cancellations and seat change requests.
                    </Typography>
                  </Box>

                  <Divider />

                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoConfirmBooking}
                          onChange={(event) =>
                            updateSetting(
                              "autoConfirmBooking",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={600}>
                            Automatically Confirm Bookings
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Automatically confirm eligible bookings.
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allowCancellation}
                          onChange={(event) =>
                            updateSetting(
                              "allowCancellation",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={600}>
                            Allow Booking Cancellation
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Allow members to cancel their bookings.
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allowSeatChangeRequest}
                          onChange={(event) =>
                            updateSetting(
                              "allowSeatChangeRequest",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={600}>
                            Allow Seat Change Requests
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Allow members to request another seat for an
                            existing booking.
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>

                  {settings.allowCancellation && (
                    <>
                      <Divider />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Cancellation Window"
                            value={settings.cancellationHours}
                            inputProps={{
                              min: 0,
                            }}
                            onChange={(event) =>
                              updateSetting(
                                "cancellationHours",
                                Number(event.target.value),
                              )
                            }
                            helperText="Minimum hours before booking start"
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* ==========================================
                        NOTIFICATIONS
                    ========================================== */}

          {activeTab === 3 && (
            <Card>
              <CardContent
                sx={{
                  p: 3,
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Notification Settings
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Select notification channels and events for this library.
                    </Typography>
                  </Box>

                  <Divider />

                  <Typography variant="subtitle2" fontWeight={700}>
                    Notification Channels
                  </Typography>

                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(event) =>
                            updateSetting(
                              "emailNotifications",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="Email Notifications"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.smsNotifications}
                          onChange={(event) =>
                            updateSetting(
                              "smsNotifications",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="SMS Notifications"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.inAppNotifications}
                          onChange={(event) =>
                            updateSetting(
                              "inAppNotifications",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="In-App Notifications"
                    />
                  </Stack>

                  <Divider />

                  <Typography variant="subtitle2" fontWeight={700}>
                    Notification Events
                  </Typography>

                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.bookingNotifications}
                          onChange={(event) =>
                            updateSetting(
                              "bookingNotifications",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="Booking Notifications"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.paymentNotifications}
                          onChange={(event) =>
                            updateSetting(
                              "paymentNotifications",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="Payment Notifications"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.membershipNotifications}
                          onChange={(event) =>
                            updateSetting(
                              "membershipNotifications",
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="Membership Notifications"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* ==========================================
                        SECURITY
                    ========================================== */}

          {activeTab === 4 && (
            <Card>
              <CardContent
                sx={{
                  p: 3,
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Security Settings
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Authentication and account-security controls.
                    </Typography>
                  </Box>

                  <Divider />

                  <Alert severity="info">
                    Session timeout and two-factor authentication are not yet
                    implemented by the backend authentication module. These
                    controls will be enabled here only after they are enforced
                    by Spring Security.
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled>
                        <InputLabel>Session Timeout</InputLabel>

                        <Select value="30" label="Session Timeout">
                          <MenuItem value="15">15 minutes</MenuItem>

                          <MenuItem value="30">30 minutes</MenuItem>

                          <MenuItem value="60">1 hour</MenuItem>

                          <MenuItem value="120">2 hours</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <FormControlLabel
                    disabled
                    control={<Switch checked={false} />}
                    label={
                      <Box>
                        <Typography fontWeight={600}>
                          Two-Factor Authentication
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Will be available after 2FA is implemented by the
                          authentication backend.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}

export default Settings;
