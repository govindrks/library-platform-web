import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  Add,
  Assessment,
  Autorenew,
  CalendarMonth,
  CheckCircle,
  DeleteOutlineOutlined,
  Download,
  EditOutlined,
  ErrorOutlineOutlined,
  Groups,
  History,
  InfoOutlined,
  InsertDriveFile,
  Payment,
  ReceiptLong,
  Refresh,
  SettingsSuggest,
  ToggleOff,
} from "@mui/icons-material";

import automationApi from "../../api/automationApi";
import libraryApi from "../../api/libraryApi";

// ============================================================
// CONSTANTS
// ============================================================

const EMPTY_SUMMARY = {
  totalRules: 0,
  activeRules: 0,
  inactiveRules: 0,
  customRules: 0,
};

const INITIAL_FORM = {
  type: "CUSTOM",

  name: "",

  description: "",

  enabled: true,

  // =========================================================
  // BUILT-IN / LEGACY FIELDS
  // =========================================================

  triggerValue: "",

  scheduleTime: "",

  // =========================================================
  // CUSTOM TRIGGER
  // =========================================================

  triggerType: "SCHEDULED_DATE_TIME",

  scheduledAt: "",

  daysBefore: "",

  // =========================================================
  // CUSTOM CONDITIONS
  // =========================================================

  conditions: [],

  // =========================================================
  // CUSTOM ACTION
  // =========================================================

  actionRecipient: "LIBRARY_OWNER",

  actionTitle: "",

  actionMessage: "",
};

// ============================================================
// CUSTOM TRIGGER OPTIONS
// ============================================================

const CUSTOM_TRIGGER_OPTIONS = [
  {
    value: "SCHEDULED_DATE_TIME",
    label: "Scheduled Date & Time",
  },

  {
    value: "MEMBERSHIP_EXPIRING",
    label: "Membership Expiring",
  },

  {
    value: "PAYMENT_SUCCESS",
    label: "Payment Successful",
  },
];

// ============================================================
// MEMBERSHIP CONDITION FIELDS
// ============================================================

const MEMBERSHIP_CONDITION_FIELDS = [
  {
    value: "MEMBERSHIP_PLAN_ID",
    label: "Membership Plan ID",
  },

  {
    value: "MEMBERSHIP_STATUS",
    label: "Membership Status",
  },

  {
    value: "DAYS_UNTIL_EXPIRY",
    label: "Days Until Expiry",
  },

  {
    value: "MEMBER_ID",
    label: "Member ID",
  },
];

// ============================================================
// PAYMENT CONDITION FIELDS
// ============================================================

const PAYMENT_CONDITION_FIELDS = [
  {
    value: "PAYMENT_AMOUNT",
    label: "Payment Amount",
  },

  {
    value: "PAYMENT_STATUS",
    label: "Payment Status",
  },

  /*
   * PAYMENT_METHOD is intentionally not exposed yet.
   *
   * The condition enum supports it, but the actual
   * payment-method value is not yet populated into the
   * CustomAutomationContext from PaymentTransaction.
   */

  {
    value: "MEMBER_ID",
    label: "Member ID",
  },
];

// ============================================================
// CONDITION OPERATORS
// ============================================================

const CONDITION_OPERATOR_OPTIONS = [
  {
    value: "EQUALS",
    label: "Equals",
  },

  {
    value: "NOT_EQUALS",
    label: "Not Equals",
  },

  {
    value: "GREATER_THAN",
    label: "Greater Than",
  },

  {
    value: "GREATER_THAN_OR_EQUAL",
    label: "Greater Than or Equal",
  },

  {
    value: "LESS_THAN",
    label: "Less Than",
  },

  {
    value: "LESS_THAN_OR_EQUAL",
    label: "Less Than or Equal",
  },

  {
    value: "CONTAINS",
    label: "Contains",
  },

  {
    value: "IN",
    label: "In",
  },
];

// ============================================================
// NOTIFICATION RECIPIENTS
// ============================================================

const NOTIFICATION_RECIPIENT_OPTIONS = [
  {
    value: "LIBRARY_OWNER",
    label: "Library Owner",
  },

  {
    value: "TRIGGER_MEMBER",
    label: "Trigger Member",
  },
];

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

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const formatEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const normalizeTime = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
};

const normalizeDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 16);
};

const formatDateTime = (value) => {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
};

const getRuleIcon = (type) => {
  switch (type) {
    case "BOOKING_REMINDER":
      return <CalendarMonth />;

    case "MEMBERSHIP_EXPIRY_REMINDER":
      return <Groups />;

    case "PAYMENT_NOTIFICATION":
      return <Payment />;

    case "INVOICE_GENERATION":
      return <ReceiptLong />;

    case "DAILY_REPORT":
      return <Assessment />;

    case "CUSTOM":
      return <SettingsSuggest />;

    default:
      return <Autorenew />;
  }
};

const getTriggerText = (rule) => {
  switch (rule?.type) {
    case "BOOKING_REMINDER":
      return rule?.triggerValue != null
        ? `${rule.triggerValue} minute(s) before booking`
        : "Not configured";

    case "MEMBERSHIP_EXPIRY_REMINDER":
      return rule?.triggerValue != null
        ? `${rule.triggerValue} day(s) before expiry`
        : "Not configured";

    case "DAILY_REPORT":
      return rule?.scheduleTime
        ? `Every day at ${normalizeTime(rule.scheduleTime)}`
        : "Daily schedule not configured";

    case "PAYMENT_NOTIFICATION":
      return "Triggered by payment events";

    case "INVOICE_GENERATION":
      return "Triggered after successful payment";

    case "CUSTOM": {
      switch (rule?.triggerType) {
        case "SCHEDULED_DATE_TIME":
          return rule?.triggerConfig?.scheduledAt
            ? `Scheduled for ${formatDateTime(rule.triggerConfig.scheduledAt)}`
            : "Scheduled date/time not configured";

        case "MEMBERSHIP_EXPIRING":
          return rule?.triggerConfig?.daysBefore != null
            ? `${rule.triggerConfig.daysBefore} day(s) before membership expiry`
            : "Membership expiry trigger";

        case "PAYMENT_SUCCESS":
          return "Triggered after successful payment";

        default:
          return "Custom trigger";
      }
    }

    default:
      return "Event based";
  }
};

const getExecutionStatusColor = (status) => {
  switch (status) {
    case "SUCCESS":
      return "success";

    case "FAILED":
      return "error";

    case "PROCESSING":
      return "warning";

    case "SKIPPED":
      return "info";

    default:
      return "default";
  }
};

const getActionStatusIcon = (status) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle fontSize="small" color="success" />;

    case "FAILED":
      return <ErrorOutlineOutlined fontSize="small" color="error" />;

    case "SKIPPED":
      return <InfoOutlined fontSize="small" color="info" />;

    case "PROCESSING":
      return <CircularProgress size={16} />;

    default:
      return <InfoOutlined fontSize="small" />;
  }
};

const formatReference = (execution) => {
  if (!execution?.referenceType) {
    return "-";
  }

  return `${formatEnum(
    execution.referenceType,
  )} #${execution.referenceId ?? "-"}`;
};

const getConditionFields = (triggerType) => {
  switch (triggerType) {
    case "MEMBERSHIP_EXPIRING":
      return MEMBERSHIP_CONDITION_FIELDS;

    case "PAYMENT_SUCCESS":
      return PAYMENT_CONDITION_FIELDS;

    case "SCHEDULED_DATE_TIME":
      return [];

    default:
      return [];
  }
};

const getAvailableTemplateVariables = (triggerType) => {
  switch (triggerType) {
    case "MEMBERSHIP_EXPIRING":
      return [
        "{{libraryName}}",
        "{{daysUntilExpiry}}",
        "{{membershipExpiryDate}}",
        "{{membershipPlanName}}",
        "{{memberId}}",
        "{{referenceId}}",
      ];

    case "PAYMENT_SUCCESS":
      return [
        "{{libraryName}}",
        "{{paymentAmount}}",
        "{{paymentCurrency}}",
        "{{receiptNumber}}",
        "{{memberId}}",
        "{{referenceId}}",
      ];

    case "SCHEDULED_DATE_TIME":
      return ["{{libraryId}}", "{{referenceId}}", "{{triggerType}}"];

    default:
      return [];
  }
};

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ title, value, icon }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={800} mt={0.5}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,

              height: 44,

              borderRadius: 2,

              display: "flex",

              justifyContent: "center",

              alignItems: "center",

              backgroundColor: "action.hover",

              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// AUTOMATION RULE CARD
// ============================================================

function AutomationRuleCard({ rule, busyRuleId, onToggle, onEdit, onDelete }) {
  const busy = busyRuleId === rule.id;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",

        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: "primary.main",

          boxShadow: 1,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
        }}
      >
        <Stack spacing={2}>
          {/* HEADER */}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,

                  height: 44,

                  display: "flex",

                  justifyContent: "center",

                  alignItems: "center",

                  borderRadius: 2,

                  backgroundColor: "action.hover",

                  color: "primary.main",
                }}
              >
                {getRuleIcon(rule.type)}
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {rule.name}
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.75}
                  mt={0.5}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    label={formatEnum(rule.type)}
                  />

                  {rule.type === "CUSTOM" && rule.triggerType && (
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={formatEnum(rule.triggerType)}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            {busy ? (
              <CircularProgress size={22} />
            ) : (
              <Switch
                checked={Boolean(rule.enabled)}
                onChange={(event) => onToggle(rule, event.target.checked)}
              />
            )}
          </Stack>

          {/* DESCRIPTION */}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              minHeight: 40,
            }}
          >
            {rule.description || "No description configured."}
          </Typography>

          <Divider />

          {/* TRIGGER */}

          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTime
              sx={{
                fontSize: 18,

                color: "text.secondary",
              }}
            />

            <Typography variant="body2" color="text.secondary">
              {getTriggerText(rule)}
            </Typography>
          </Stack>

          {/* CUSTOM INFO */}

          {rule.type === "CUSTOM" && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={`${
                  Array.isArray(rule.conditions) ? rule.conditions.length : 0
                } condition(s)`}
              />

              <Chip
                size="small"
                label={`${
                  Array.isArray(rule.actions) ? rule.actions.length : 0
                } action(s)`}
              />
            </Stack>
          )}

          {/* STATUS */}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Chip
              size="small"
              color={rule.enabled ? "success" : "default"}
              label={rule.enabled ? "Active" : "Inactive"}
            />

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit automation">
                <IconButton size="small" onClick={() => onEdit(rule)}>
                  <EditOutlined fontSize="small" />
                </IconButton>
              </Tooltip>

              {rule.type === "CUSTOM" && (
                <Tooltip title="Delete custom automation">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(rule)}
                  >
                    <DeleteOutlineOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {(rule.lastRunAt || rule.nextRunAt) && (
            <>
              <Divider />

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Last run: {formatDateTime(rule.lastRunAt)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Next run: {formatDateTime(rule.nextRunAt)}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function AutomationCenter() {
  // =========================================================
  // LIBRARIES
  // =========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  // =========================================================
  // AUTOMATION DATA
  // =========================================================

  const [rules, setRules] = useState([]);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [executions, setExecutions] = useState([]);

  const [generatedReports, setGeneratedReports] = useState([]);

  // =========================================================
  // LOADING
  // =========================================================

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [busyRuleId, setBusyRuleId] = useState(null);

  const [downloadingReportId, setDownloadingReportId] = useState(null);

  // =========================================================
  // MESSAGES
  // =========================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // RULE DIALOG
  // =========================================================

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingRule, setEditingRule] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [savingRule, setSavingRule] = useState(false);

  // =========================================================
  // EXECUTION DETAIL DIALOG
  // =========================================================

  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);

  const [selectedExecution, setSelectedExecution] = useState(null);

  const [loadingExecution, setLoadingExecution] = useState(false);

  // =========================================================
  // SELECTED LIBRARY
  // =========================================================

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,

    [libraries, selectedLibraryId],
  );

  const conditionFields = useMemo(
    () => getConditionFields(form.triggerType),

    [form.triggerType],
  );

  const templateVariables = useMemo(
    () => getAvailableTemplateVariables(form.triggerType),

    [form.triggerType],
  );

  // =========================================================
  // LOAD LIBRARIES
  // =========================================================

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

        console.error("Failed to load libraries:", requestError);

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

  // =========================================================
  // LOAD AUTOMATION DATA
  // =========================================================

  const loadAutomationData = useCallback(
    async (showLoader = true) => {
      if (!selectedLibraryId) {
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        /*
         * The rules endpoint executes first because
         * the backend initializes missing built-in
         * automation rules during this call.
         */
        const rulesResponse = await automationApi.getRules(selectedLibraryId);

        const [summaryResponse, executionResponse, reportResponse] =
          await Promise.all([
            automationApi.getSummary(selectedLibraryId),

            automationApi.getExecutions(selectedLibraryId),

            automationApi.getGeneratedReports(selectedLibraryId),
          ]);

        setRules(Array.isArray(rulesResponse) ? rulesResponse : []);

        setExecutions(
          Array.isArray(executionResponse) ? executionResponse : [],
        );

        setGeneratedReports(
          Array.isArray(reportResponse) ? reportResponse : [],
        );

        setSummary({
          totalRules: Number(summaryResponse?.totalRules ?? 0),

          activeRules: Number(summaryResponse?.activeRules ?? 0),

          inactiveRules: Number(summaryResponse?.inactiveRules ?? 0),

          customRules: Number(summaryResponse?.customRules ?? 0),
        });
      } catch (requestError) {
        console.error("Failed to load automations:", requestError);

        setError(
          getErrorMessage(
            requestError,
            "Unable to load automation information.",
          ),
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },

    [selectedLibraryId],
  );

  useEffect(() => {
    if (!loadingLibraries && selectedLibraryId) {
      loadAutomationData(true);
    }
  }, [loadingLibraries, selectedLibraryId, loadAutomationData]);

  // =========================================================
  // TOGGLE RULE
  // =========================================================

  const handleToggle = async (rule, enabled) => {
    try {
      setBusyRuleId(rule.id);

      setError("");

      const updated = await automationApi.toggleRule(
        selectedLibraryId,
        rule.id,
        enabled,
      );

      setRules((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      );

      setSummary((previous) => ({
        ...previous,

        activeRules: Math.max(previous.activeRules + (enabled ? 1 : -1), 0),

        inactiveRules: Math.max(previous.inactiveRules + (enabled ? -1 : 1), 0),
      }));

      setSuccess(enabled ? `${rule.name} enabled.` : `${rule.name} disabled.`);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update automation rule."),
      );
    } finally {
      setBusyRuleId(null);
    }
  };

  // =========================================================
  // CREATE DIALOG
  // =========================================================

  const openCreateDialog = () => {
    setEditingRule(null);

    setForm({
      ...INITIAL_FORM,
    });

    setError("");

    setDialogOpen(true);
  };

  // =========================================================
  // EDIT DIALOG
  // =========================================================

  const openEditDialog = (rule) => {
    setEditingRule(rule);

    const notificationAction = Array.isArray(rule.actions)
      ? rule.actions.find((action) => action?.type === "SEND_NOTIFICATION")
      : null;

    setForm({
      type: rule.type || "CUSTOM",

      name: rule.name || "",

      description: rule.description || "",

      enabled: Boolean(rule.enabled),

      // BUILT-IN

      triggerValue: rule.triggerValue ?? "",

      scheduleTime: normalizeTime(rule.scheduleTime),

      // CUSTOM

      triggerType: rule.triggerType || "SCHEDULED_DATE_TIME",

      scheduledAt: normalizeDateTimeLocal(rule?.triggerConfig?.scheduledAt),

      daysBefore: rule?.triggerConfig?.daysBefore ?? "",

      conditions: Array.isArray(rule.conditions)
        ? rule.conditions.map((condition) => ({
            field: condition.field || "",

            operator: condition.operator || "EQUALS",

            value: condition.value ?? "",
          }))
        : [],

      actionRecipient: notificationAction?.config?.recipient || "LIBRARY_OWNER",

      actionTitle: notificationAction?.config?.title || "",

      actionMessage: notificationAction?.config?.message || "",
    });

    setError("");

    setDialogOpen(true);
  };

  // =========================================================
  // CLOSE RULE DIALOG
  // =========================================================

  const closeDialog = () => {
    if (savingRule) {
      return;
    }

    setDialogOpen(false);

    setEditingRule(null);

    setForm({
      ...INITIAL_FORM,
    });
  };

  // =========================================================
  // UPDATE FORM
  // =========================================================

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,

      [field]: value,
    }));
  };

  // =========================================================
  // TRIGGER CHANGE
  // =========================================================

  const handleTriggerTypeChange = (triggerType) => {
    setForm((previous) => ({
      ...previous,

      triggerType,

      scheduledAt: "",

      daysBefore: "",

      conditions: [],

      actionRecipient:
        triggerType === "SCHEDULED_DATE_TIME"
          ? "LIBRARY_OWNER"
          : previous.actionRecipient,
    }));
  };

  // =========================================================
  // CONDITIONS
  // =========================================================

  const addCondition = () => {
    if (conditionFields.length === 0) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      conditions: [
        ...previous.conditions,

        {
          field: "",

          operator: "EQUALS",

          value: "",
        },
      ],
    }));
  };

  const updateCondition = (index, field, value) => {
    setForm((previous) => ({
      ...previous,

      conditions: previous.conditions.map((condition, conditionIndex) =>
        conditionIndex === index
          ? {
              ...condition,

              [field]: value,
            }
          : condition,
      ),
    }));
  };

  const removeCondition = (index) => {
    setForm((previous) => ({
      ...previous,

      conditions: previous.conditions.filter(
        (_, conditionIndex) => conditionIndex !== index,
      ),
    }));
  };

  // =========================================================
  // SAVE RULE
  // =========================================================

  const handleSaveRule = async () => {
    if (!form.name.trim()) {
      setError("Automation name is required.");

      return;
    }

    // =====================================================
    // CUSTOM VALIDATION
    // =====================================================

    if (form.type === "CUSTOM") {
      if (!form.triggerType) {
        setError("Automation trigger is required.");

        return;
      }

      if (form.triggerType === "SCHEDULED_DATE_TIME" && !form.scheduledAt) {
        setError("Scheduled date and time are required.");

        return;
      }

      if (form.triggerType === "SCHEDULED_DATE_TIME") {
        const scheduledTime = new Date(form.scheduledAt).getTime();

        if (Number.isNaN(scheduledTime) || scheduledTime <= Date.now()) {
          setError("Scheduled date and time must be in the future.");

          return;
        }
      }

      if (
        form.triggerType === "MEMBERSHIP_EXPIRING" &&
        (form.daysBefore === "" ||
          Number(form.daysBefore) < 0 ||
          !Number.isInteger(Number(form.daysBefore)))
      ) {
        setError(
          "Days before expiry must be a whole number greater than or equal to zero.",
        );

        return;
      }

      const invalidCondition = form.conditions.some(
        (condition) =>
          !condition.field ||
          !condition.operator ||
          String(condition.value ?? "").trim() === "",
      );

      if (invalidCondition) {
        setError(
          "Complete all automation conditions or remove incomplete conditions.",
        );

        return;
      }

      if (!form.actionRecipient) {
        setError("Notification recipient is required.");

        return;
      }

      if (
        form.triggerType === "SCHEDULED_DATE_TIME" &&
        form.actionRecipient === "TRIGGER_MEMBER"
      ) {
        setError(
          "Scheduled automations cannot use Trigger Member because no member exists in the scheduled trigger context.",
        );

        return;
      }

      if (!form.actionTitle.trim()) {
        setError("Notification title is required.");

        return;
      }

      if (!form.actionMessage.trim()) {
        setError("Notification message is required.");

        return;
      }
    }

    try {
      setSavingRule(true);

      setError("");

      let payload;

      // =================================================
      // CUSTOM PAYLOAD
      // =================================================

      if (form.type === "CUSTOM") {
        let triggerConfig = {};

        switch (form.triggerType) {
          case "SCHEDULED_DATE_TIME":
            triggerConfig = {
              scheduledAt: form.scheduledAt,
            };

            break;

          case "MEMBERSHIP_EXPIRING":
            triggerConfig = {
              daysBefore: Number(form.daysBefore),
            };

            break;

          case "PAYMENT_SUCCESS":
            triggerConfig = {};

            break;

          default:
            triggerConfig = {};
        }

        payload = {
          type: "CUSTOM",

          name: form.name.trim(),

          description: form.description.trim() || null,

          enabled: Boolean(form.enabled),

          /*
           * CUSTOM does not use the
           * legacy trigger fields.
           */
          triggerValue: null,

          scheduleTime: null,

          triggerType: form.triggerType,

          triggerConfig,

          conditions: form.conditions.map((condition) => ({
            field: condition.field,

            operator: condition.operator,

            value: String(condition.value).trim(),
          })),

          actions: [
            {
              type: "SEND_NOTIFICATION",

              order: 1,

              enabled: true,

              config: {
                recipient: form.actionRecipient,

                title: form.actionTitle.trim(),

                message: form.actionMessage.trim(),
              },
            },
          ],
        };
      } else {
        // =================================================
        // BUILT-IN PAYLOAD
        // =================================================

        payload = {
          type: editingRule ? editingRule.type : form.type,

          name: form.name.trim(),

          description: form.description.trim() || null,

          enabled: Boolean(form.enabled),

          triggerValue:
            form.triggerValue === "" ? null : Number(form.triggerValue),

          scheduleTime: form.scheduleTime || null,

          triggerType: null,

          triggerConfig: {},

          conditions: [],

          actions: [],
        };
      }

      if (editingRule) {
        await automationApi.updateRule(
          selectedLibraryId,
          editingRule.id,
          payload,
        );

        setSuccess("Automation rule updated successfully.");
      } else {
        await automationApi.createRule(selectedLibraryId, payload);

        setSuccess("Automation rule created successfully.");
      }

      setDialogOpen(false);

      setEditingRule(null);

      setForm({
        ...INITIAL_FORM,
      });

      await loadAutomationData(false);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to save automation rule."),
      );
    } finally {
      setSavingRule(false);
    }
  };

  // =========================================================
  // DELETE CUSTOM RULE
  // =========================================================

  const handleDelete = async (rule) => {
    const confirmed = window.confirm(`Delete automation "${rule.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setBusyRuleId(rule.id);

      setError("");

      await automationApi.deleteRule(selectedLibraryId, rule.id);

      setSuccess("Custom automation deleted successfully.");

      await loadAutomationData(false);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to delete automation rule."),
      );
    } finally {
      setBusyRuleId(null);
    }
  };

  // =========================================================
  // DOWNLOAD REPORT
  // =========================================================

  const handleDownloadReport = async (report) => {
    try {
      setDownloadingReportId(report.id);

      setError("");

      await automationApi.downloadGeneratedReport(
        selectedLibraryId,
        report.id,
        report.fileName,
      );
    } catch (requestError) {
      console.error("Failed to download report:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to download generated report."),
      );
    } finally {
      setDownloadingReportId(null);
    }
  };

  // =========================================================
  // OPEN EXECUTION DETAILS
  // =========================================================

  const handleOpenExecution = async (execution) => {
    if (!execution?.id || !selectedLibraryId) {
      return;
    }

    try {
      setLoadingExecution(true);

      setError("");

      /*
       * Show the lightweight table object immediately.
       */
      setSelectedExecution(execution);

      setExecutionDialogOpen(true);

      /*
       * Then replace it with the full execution
       * containing nested action logs.
       */
      const detail = await automationApi.getExecution(
        selectedLibraryId,
        execution.id,
      );

      setSelectedExecution(detail);
    } catch (requestError) {
      console.error("Failed to load automation execution:", requestError);

      setError(
        getErrorMessage(
          requestError,
          "Unable to load automation execution details.",
        ),
      );

      setExecutionDialogOpen(false);

      setSelectedExecution(null);
    } finally {
      setLoadingExecution(false);
    }
  };

  // =========================================================
  // CLOSE EXECUTION DETAILS
  // =========================================================

  const handleCloseExecution = () => {
    if (loadingExecution) {
      return;
    }

    setExecutionDialogOpen(false);

    setSelectedExecution(null);
  };

  // =========================================================
  // INITIAL PAGE LOADING
  // =========================================================

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
          Loading automation center...
        </Typography>
      </Stack>
    );
  }

  // =========================================================
  // UI
  // =========================================================

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
            Automation Center
          </Typography>

          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Configure automated workflows for bookings, memberships, payments
            and reports.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 210,
            }}
          >
            <InputLabel>Library</InputLabel>

            <Select
              value={selectedLibraryId}
              label="Library"
              onChange={(event) => setSelectedLibraryId(event.target.value)}
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
              refreshing ? <CircularProgress size={16} /> : <Refresh />
            }
            disabled={refreshing || !selectedLibraryId}
            onClick={() => loadAutomationData(false)}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            disabled={!selectedLibraryId}
            onClick={openCreateDialog}
          >
            Create Rule
          </Button>
        </Stack>
      </Stack>

      {/* ==================================================
                CURRENT LIBRARY
            ================================================== */}

      {selectedLibrary && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
          }}
        >
          Automation rules shown below belong to{" "}
          <strong>{selectedLibrary.name}</strong>.
        </Alert>
      )}

      {/* ==================================================
                ERROR
            ================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 3,
          }}
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
          onClose={() => setSuccess("")}
          sx={{
            mb: 3,
          }}
        >
          {success}
        </Alert>
      )}

      {/* ==================================================
                SUMMARY
            ================================================== */}

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Total Rules"
            value={summary.totalRules}
            icon={<Autorenew />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Active"
            value={summary.activeRules}
            icon={<CheckCircle />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Inactive"
            value={summary.inactiveRules}
            icon={<ToggleOff />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Custom Rules"
            value={summary.customRules}
            icon={<SettingsSuggest />}
          />
        </Grid>
      </Grid>

      {/* ==================================================
                AUTOMATION RULES
            ================================================== */}

      <Box>
        <Typography variant="h5" fontWeight={800} mb={0.5}>
          Automation Rules
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Enable, disable and configure automated workflows.
        </Typography>

        {loading ? (
          <Card>
            <CardContent
              sx={{
                py: 9,

                textAlign: "center",
              }}
            >
              <CircularProgress />

              <Typography mt={2} color="text.secondary">
                Loading automation rules...
              </Typography>
            </CardContent>
          </Card>
        ) : rules.length > 0 ? (
          <Grid container spacing={2}>
            {rules.map((rule) => (
              <Grid item xs={12} md={6} xl={4} key={rule.id}>
                <AutomationRuleCard
                  rule={rule}
                  busyRuleId={busyRuleId}
                  onToggle={handleToggle}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent
              sx={{
                py: 8,

                textAlign: "center",
              }}
            >
              <SettingsSuggest
                sx={{
                  fontSize: 58,

                  color: "text.disabled",
                }}
              />

              <Typography variant="h6" fontWeight={700} mt={2}>
                No automation rules
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Create an automation rule to get started.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  mt: 2,
                }}
                onClick={openCreateDialog}
              >
                Create Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* ==================================================
                GENERATED REPORTS
            ================================================== */}

      <Box mt={5}>
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
          mb={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Generated Reports
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Reports automatically generated by your automation rules.
            </Typography>
          </Box>

          <Chip
            icon={<InsertDriveFile />}
            label={`${generatedReports.length} file(s)`}
            variant="outlined"
          />
        </Stack>

        <Card variant="outlined">
          {generatedReports.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report</TableCell>

                    <TableCell>Date</TableCell>

                    <TableCell>Format</TableCell>

                    <TableCell>Automation</TableCell>

                    <TableCell>Generated</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {generatedReports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <InsertDriveFile fontSize="small" color="primary" />

                          <Typography variant="body2" fontWeight={600}>
                            {report.fileName}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>{report.reportDate || "-"}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={report.format || "-"}
                          color={report.format === "PDF" ? "error" : "success"}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>{report.ruleName || "-"}</TableCell>

                      <TableCell>{formatDateTime(report.createdAt)}</TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={
                            downloadingReportId === report.id ? (
                              <CircularProgress size={15} />
                            ) : (
                              <Download />
                            )
                          }
                          disabled={downloadingReportId === report.id}
                          onClick={() => handleDownloadReport(report)}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <CardContent
              sx={{
                py: 6,

                textAlign: "center",
              }}
            >
              <Assessment
                sx={{
                  fontSize: 48,

                  color: "text.disabled",
                }}
              />

              <Typography fontWeight={700} mt={1}>
                No generated reports yet
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Daily PDF and Excel reports will appear here after the Daily
                Report automation executes.
              </Typography>
            </CardContent>
          )}
        </Card>
      </Box>

      {/* ==================================================
                EXECUTION HISTORY
            ================================================== */}

      <Box mt={5} mb={4}>
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
          mb={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Execution History
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Recent automation executions for this library. Click a row to view
              execution details.
            </Typography>
          </Box>

          <Chip
            icon={<History />}
            label={`${executions.length} execution(s)`}
            variant="outlined"
          />
        </Stack>

        <Card variant="outlined">
          {executions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Automation</TableCell>

                    <TableCell>Reference</TableCell>

                    <TableCell>Status</TableCell>

                    <TableCell>Started</TableCell>

                    <TableCell>Completed</TableCell>

                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {executions.map((execution) => (
                    <TableRow
                      key={execution.id}
                      hover
                      onClick={() => handleOpenExecution(execution)}
                      sx={{
                        cursor: "pointer",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {execution.ruleName || `Rule #${execution.ruleId}`}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatReference(execution)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={execution.status || "-"}
                          color={getExecutionStatusColor(execution.status)}
                        />
                      </TableCell>

                      <TableCell>
                        {formatDateTime(execution.startedAt)}
                      </TableCell>

                      <TableCell>
                        {formatDateTime(execution.completedAt)}
                      </TableCell>

                      <TableCell>
                        {execution.status === "FAILED" ? (
                          <Tooltip
                            title={
                              execution.errorMessage ||
                              "Automation execution failed."
                            }
                          >
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <ErrorOutlineOutlined
                                fontSize="small"
                                color="error"
                              />

                              <Typography variant="body2" color="error.main">
                                Failed
                              </Typography>
                            </Stack>
                          </Tooltip>
                        ) : execution.status === "SUCCESS" ? (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <CheckCircle fontSize="small" color="success" />

                            <Typography variant="body2">Completed</Typography>
                          </Stack>
                        ) : execution.status === "SKIPPED" ? (
                          <Tooltip
                            title={
                              execution.errorMessage ||
                              "Automation execution was skipped."
                            }
                          >
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <InfoOutlined fontSize="small" color="info" />

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Skipped
                              </Typography>
                            </Stack>
                          </Tooltip>
                        ) : (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <CircularProgress size={14} />

                            <Typography variant="body2" color="text.secondary">
                              Processing
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <CardContent
              sx={{
                py: 6,

                textAlign: "center",
              }}
            >
              <History
                sx={{
                  fontSize: 48,

                  color: "text.disabled",
                }}
              />

              <Typography fontWeight={700} mt={1}>
                No automation executions yet
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Booking reminders, membership reminders, payment automations and
                custom workflows will appear here after execution.
              </Typography>
            </CardContent>
          )}
        </Card>
      </Box>

      {/* ==================================================
                CREATE / EDIT RULE DIALOG
            ================================================== */}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editingRule ? "Edit Automation Rule" : "Create Automation Rule"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            {/* TYPE */}

            <FormControl fullWidth disabled={Boolean(editingRule)}>
              <InputLabel>Automation Type</InputLabel>

              <Select
                label="Automation Type"
                value={form.type}
                onChange={(event) => updateForm("type", event.target.value)}
              >
                <MenuItem value="CUSTOM">Custom Automation</MenuItem>

                {editingRule && editingRule.type !== "CUSTOM" && (
                  <MenuItem value={editingRule.type}>
                    {formatEnum(editingRule.type)}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {/* NAME */}

            <TextField
              fullWidth
              required
              label="Rule Name"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
            />

            {/* DESCRIPTION */}

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
            />

            {/* BUILT-IN TRIGGER VALUE */}

            {(form.type === "BOOKING_REMINDER" ||
              form.type === "MEMBERSHIP_EXPIRY_REMINDER") && (
              <TextField
                fullWidth
                type="number"
                label={
                  form.type === "BOOKING_REMINDER"
                    ? "Minutes Before Booking"
                    : "Days Before Expiry"
                }
                inputProps={{
                  min: 0,
                }}
                value={form.triggerValue}
                onChange={(event) =>
                  updateForm("triggerValue", event.target.value)
                }
              />
            )}

            {/* DAILY REPORT */}

            {form.type === "DAILY_REPORT" && (
              <TextField
                fullWidth
                type="time"
                label="Schedule Time"
                value={form.scheduleTime}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(event) =>
                  updateForm("scheduleTime", event.target.value)
                }
              />
            )}

            {/* ==================================================
                            CUSTOM
                        ================================================== */}

            {form.type === "CUSTOM" && (
              <>
                <Divider />

                {/* TRIGGER */}

                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Trigger
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Choose the event that starts this automation.
                  </Typography>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Trigger Type</InputLabel>

                  <Select
                    label="Trigger Type"
                    value={form.triggerType}
                    onChange={(event) =>
                      handleTriggerTypeChange(event.target.value)
                    }
                  >
                    {CUSTOM_TRIGGER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* SCHEDULED */}

                {form.triggerType === "SCHEDULED_DATE_TIME" && (
                  <Stack spacing={0.75}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="text.primary"
                    >
                      Scheduled Date & Time
                      <Box
                        component="span"
                        sx={{
                          color: "error.main",
                          ml: 0.25,
                        }}
                      >
                        *
                      </Box>
                    </Typography>

                    <TextField
                      fullWidth
                      required
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(event) =>
                        updateForm("scheduledAt", event.target.value)
                      }
                      inputProps={{
                        min: new Date(
                          Date.now() - new Date().getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16),
                      }}
                      sx={{
                        "& input": {
                          py: 1.7,
                        },
                      }}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        ml: 1.75,
                      }}
                    >
                      This is currently a one-time scheduled automation.
                    </Typography>
                  </Stack>
                )}

                {/* MEMBERSHIP */}

                {form.triggerType === "MEMBERSHIP_EXPIRING" && (
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Days Before Expiry"
                    value={form.daysBefore}
                    inputProps={{
                      min: 0,
                      step: 1,
                    }}
                    onChange={(event) =>
                      updateForm("daysBefore", event.target.value)
                    }
                    helperText="Example: 3 means execute when an active membership has exactly 3 days remaining."
                  />
                )}

                {/* PAYMENT */}

                {form.triggerType === "PAYMENT_SUCCESS" && (
                  <Alert severity="info">
                    This automation runs after a successful payment. Add
                    conditions below if it should apply only to specific
                    payments.
                  </Alert>
                )}

                {/* CONDITIONS */}

                <Divider />

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
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Conditions
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      All configured conditions must match.
                    </Typography>
                  </Box>

                  {conditionFields.length > 0 && (
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={addCondition}
                    >
                      Add Condition
                    </Button>
                  )}
                </Stack>

                {conditionFields.length === 0 && (
                  <Alert severity="info">
                    This trigger currently has no configurable business
                    conditions.
                  </Alert>
                )}

                {conditionFields.length > 0 && form.conditions.length === 0 && (
                  <Alert severity="info">
                    No conditions configured. The automation will execute
                    whenever this trigger matches.
                  </Alert>
                )}

                {form.conditions.length > 0 && (
                  <Stack spacing={2}>
                    {form.conditions.map((condition, index) => (
                      <Card key={index} variant="outlined">
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack
                              direction={{
                                xs: "column",
                                sm: "row",
                              }}
                              spacing={1.5}
                            >
                              <FormControl fullWidth size="small">
                                <InputLabel>Field</InputLabel>

                                <Select
                                  label="Field"
                                  value={condition.field}
                                  onChange={(event) =>
                                    updateCondition(
                                      index,
                                      "field",
                                      event.target.value,
                                    )
                                  }
                                >
                                  {conditionFields.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              <FormControl fullWidth size="small">
                                <InputLabel>Operator</InputLabel>

                                <Select
                                  label="Operator"
                                  value={condition.operator}
                                  onChange={(event) =>
                                    updateCondition(
                                      index,
                                      "operator",
                                      event.target.value,
                                    )
                                  }
                                >
                                  {CONDITION_OPERATOR_OPTIONS.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <TextField
                                fullWidth
                                size="small"
                                label="Value"
                                value={condition.value}
                                onChange={(event) =>
                                  updateCondition(
                                    index,
                                    "value",
                                    event.target.value,
                                  )
                                }
                              />

                              <Tooltip title="Remove condition">
                                <IconButton
                                  color="error"
                                  onClick={() => removeCondition(index)}
                                >
                                  <DeleteOutlineOutlined />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}

                {/* ACTION */}

                <Divider />

                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Action
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Define what happens after the trigger and conditions match.
                  </Typography>
                </Box>

                <Alert severity="info">
                  Current supported action: <strong>Send Notification</strong>
                </Alert>

                <FormControl fullWidth>
                  <InputLabel>Notification Recipient</InputLabel>

                  <Select
                    label="Notification Recipient"
                    value={form.actionRecipient}
                    onChange={(event) =>
                      updateForm("actionRecipient", event.target.value)
                    }
                  >
                    {NOTIFICATION_RECIPIENT_OPTIONS.filter(
                      (option) =>
                        form.triggerType !== "SCHEDULED_DATE_TIME" ||
                        option.value === "LIBRARY_OWNER",
                    ).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {form.actionRecipient === "TRIGGER_MEMBER" && (
                  <Alert severity="info">
                    The notification will be sent to the member associated with
                    the event that triggered this rule.
                  </Alert>
                )}

                <TextField
                  fullWidth
                  required
                  label="Notification Title"
                  value={form.actionTitle}
                  onChange={(event) =>
                    updateForm("actionTitle", event.target.value)
                  }
                />

                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  label="Notification Message"
                  value={form.actionMessage}
                  onChange={(event) =>
                    updateForm("actionMessage", event.target.value)
                  }
                  helperText="Template variables shown below can be used inside the message."
                />

                {/* TEMPLATE VARIABLES */}

                {templateVariables.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Available template variables
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      mt={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {templateVariables.map((variable) => (
                        <Chip
                          key={variable}
                          size="small"
                          variant="outlined"
                          label={variable}
                          onClick={() =>
                            updateForm(
                              "actionMessage",
                              `${form.actionMessage}${
                                form.actionMessage ? " " : ""
                              }${variable}`,
                            )
                          }
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            )}

            <Divider />

            {/* ENABLE */}

            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.enabled)}
                  onChange={(event) =>
                    updateForm("enabled", event.target.checked)
                  }
                />
              }
              label="Enable this automation"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} disabled={savingRule}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={savingRule || !form.name.trim()}
            onClick={handleSaveRule}
          >
            {savingRule ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingRule ? (
              "Save Changes"
            ) : (
              "Create Rule"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================
                EXECUTION DETAILS DIALOG
            ================================================== */}

      <Dialog
        open={executionDialogOpen}
        onClose={handleCloseExecution}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Automation Execution Details</DialogTitle>

        <DialogContent dividers>
          {loadingExecution ? (
            <Stack
              minHeight={240}
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Loading execution details...
              </Typography>
            </Stack>
          ) : selectedExecution ? (
            <Stack spacing={3}>
              {/* HEADER */}

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
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    {selectedExecution.ruleName ||
                      `Rule #${selectedExecution.ruleId}`}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Execution #{selectedExecution.id}
                  </Typography>
                </Box>

                <Chip
                  label={selectedExecution.status || "-"}
                  color={getExecutionStatusColor(selectedExecution.status)}
                />
              </Stack>

              <Divider />

              {/* EXECUTION INFORMATION */}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Reference
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {formatReference(selectedExecution)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Library ID
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {selectedExecution.libraryId ?? "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Started
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {formatDateTime(selectedExecution.startedAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {formatDateTime(selectedExecution.completedAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Execution Key
                  </Typography>

                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    sx={{
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedExecution.executionKey || "-"}
                  </Typography>
                </Grid>
              </Grid>

              {/* EXECUTION MESSAGE */}

              {selectedExecution.errorMessage && (
                <Alert
                  severity={
                    selectedExecution.status === "FAILED"
                      ? "error"
                      : selectedExecution.status === "SKIPPED"
                        ? "info"
                        : "warning"
                  }
                >
                  {selectedExecution.errorMessage}
                </Alert>
              )}

              <Divider />

              {/* ACTION EXECUTIONS */}

              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Action Executions
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Individual actions executed by this automation run.
                </Typography>
              </Box>

              {Array.isArray(selectedExecution.actions) &&
              selectedExecution.actions.length > 0 ? (
                <Stack spacing={1.5}>
                  {selectedExecution.actions.map((action) => (
                    <Card key={action.id} variant="outlined">
                      <CardContent>
                        <Stack spacing={1.5}>
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
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              {getActionStatusIcon(action.status)}

                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {formatEnum(action.actionType)}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Action order: {action.executionOrder ?? "-"}
                                </Typography>
                              </Box>
                            </Stack>

                            <Chip
                              size="small"
                              label={action.status || "-"}
                              color={getExecutionStatusColor(action.status)}
                            />
                          </Stack>

                          <Divider />

                          <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Started
                              </Typography>

                              <Typography variant="body2">
                                {formatDateTime(action.startedAt)}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Completed
                              </Typography>

                              <Typography variant="body2">
                                {formatDateTime(action.completedAt)}
                              </Typography>
                            </Grid>
                          </Grid>

                          {action.errorMessage && (
                            <Alert
                              severity={
                                action.status === "FAILED" ? "error" : "info"
                              }
                            >
                              {action.errorMessage}
                            </Alert>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  No action-level execution records are available for this run.
                  Built-in automations may not create individual action logs.
                </Alert>
              )}
            </Stack>
          ) : (
            <Alert severity="warning">Execution details are unavailable.</Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseExecution} disabled={loadingExecution}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AutomationCenter;
