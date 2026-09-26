import {
  ExpandMore,
  Help,
  Menu,
  NotificationsNone,
  Search,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

const drawerWidth = 250;

function Header({ onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: {
          xs: "100%",
          md: `calc(100% - ${drawerWidth}px)`,
        },

        ml: {
          xs: 0,
          md: `${drawerWidth}px`,
        },

        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",
          px: {
            xs: 2,
            md: 3,
          },
          gap: 2,
        }}
      >
        {/* Mobile menu */}
        <IconButton
          onClick={onMenuClick}
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },
          }}
        >
          <Menu />
        </IconButton>

        {/* Library Selector */}
        <Select
          value="main-library"
          variant="standard"
          disableUnderline
          IconComponent={ExpandMore}
          sx={{
            minWidth: 180,

            "& .MuiSelect-select": {
              py: 0.5,
              fontWeight: 600,
            },
          }}
        >
          <MenuItem value="main-library">Main Library</MenuItem>

          <MenuItem value="city-library">City Library</MenuItem>
        </Select>

        {/* Search */}
        <Paper
          component="form"
          elevation={0}
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },
            alignItems: "center",
            width: {
              sm: 240,
              lg: 340,
            },
            height: 40,
            px: 1.5,
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Search
            fontSize="small"
            sx={{
              color: "text.secondary",
              mr: 1,
            }}
          />

          <InputBase
            placeholder="Search..."
            sx={{
              flex: 1,
              fontSize: "0.875rem",
            }}
          />
        </Paper>

        <Box sx={{ flex: 1 }} />

        {/* Help */}
        <Tooltip title="Help & Documentation">
          <IconButton>
            <Help />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton>
            <Badge badgeContent={4} color="error">
              <NotificationsNone />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            ml: 1,
            cursor: "pointer",
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: "primary.main",
              fontSize: 14,
            }}
          >
            GK
          </Avatar>

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Govind Kumar
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Library Owner
            </Typography>
          </Box>

          <ExpandMore
            fontSize="small"
            sx={{
              color: "text.secondary",
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
