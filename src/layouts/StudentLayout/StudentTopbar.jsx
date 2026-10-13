import {
  AccountCircle,
  HelpOutlineOutlined,
  Logout,
  Menu as MenuIcon,
  NotificationsNone,
  Person,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  logout,
} from "../../redux/reducer/authReducer";

import {
  drawerWidth,
} from "./StudentSidebar";


const getInitials =
  (name) => {
    if (!name) {
      return "U";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("");
  };


function StudentTopbar({
  onMenuClick,
}) {
  const navigate =
    useNavigate();

  const dispatch =
    useDispatch();

  const user =
    useSelector(
      (state) =>
        state.auth?.user
    );

  const [
    anchorEl,
    setAnchorEl,
  ] = useState(null);


  const userName =
    user?.fullName?.trim() ||
    "Member";


  const initials =
    useMemo(
      () =>
        getInitials(
          userName
        ),
      [
        userName,
      ]
    );


  const handleLogout =
    () => {
      setAnchorEl(null);

      dispatch(
        logout()
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };


  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: {
          md:
            `calc(100% - ${drawerWidth}px)`,
        },

        ml: {
          md:
            `${drawerWidth}px`,
        },

        borderBottom:
          "1px solid",

        borderColor:
          "divider",

        bgcolor:
          "background.paper",
      }}
    >
      <Toolbar
        sx={{
          minHeight:
            "76px !important",
          px: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {/* MOBILE MENU */}

        <IconButton
          edge="start"
          onClick={
            onMenuClick
          }
          sx={{
            mr: 1,
            display: {
              md: "none",
            },
          }}
        >
          <MenuIcon />
        </IconButton>


        {/* PORTAL TITLE */}

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Member Portal
        </Typography>


        <Box
          sx={{
            flexGrow: 1,
          }}
        />


        {/* HELP */}

        <Tooltip
          title=
            "Help & Support"
        >
          <IconButton
            onClick={() =>
              navigate(
                "/student/help"
              )
            }
          >
            <HelpOutlineOutlined />
          </IconButton>
        </Tooltip>


        {/* NOTIFICATIONS */}

        <Tooltip
          title=
            "Notifications"
        >
          <IconButton
            onClick={() =>
              navigate(
                "/student/notifications"
              )
            }
            sx={{
              ml: 0.5,
            }}
          >
            <Badge
              variant="dot"
              color="error"
            >
              <NotificationsNone />
            </Badge>
          </IconButton>
        </Tooltip>


        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 2,
            my: 2,
          }}
        />


        {/* USER */}

        <Box
          onClick={(
            event
          ) =>
            setAnchorEl(
              event.currentTarget
            )
          }
          sx={{
            display: "flex",
            alignItems:
              "center",
            gap: 1.25,
            cursor: "pointer",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor:
                "primary.main",
            }}
          >
            {initials}
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
              fontWeight={700}
            >
              {userName}
            </Typography>

            <Typography
              variant="caption"
              color=
                "text.secondary"
            >
              Member
            </Typography>
          </Box>
        </Box>


        {/* ACCOUNT MENU */}

        <Menu
          anchorEl={
            anchorEl
          }
          open={
            Boolean(
              anchorEl
            )
          }
          onClose={() =>
            setAnchorEl(
              null
            )
          }
          anchorOrigin={{
            vertical:
              "bottom",
            horizontal:
              "right",
          }}
          transformOrigin={{
            vertical:
              "top",
            horizontal:
              "right",
          }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(
                null
              );

              navigate(
                "/student/profile"
              );
            }}
          >
            <Person
              fontSize="small"
              sx={{
                mr: 1.5,
              }}
            />

            My Profile
          </MenuItem>


          <MenuItem
            onClick={() => {
              setAnchorEl(
                null
              );

              navigate(
                "/student/notifications"
              );
            }}
          >
            <AccountCircle
              fontSize="small"
              sx={{
                mr: 1.5,
              }}
            />

            Notifications
          </MenuItem>


          <Divider />


          <MenuItem
            onClick={
              handleLogout
            }
          >
            <Logout
              fontSize="small"
              sx={{
                mr: 1.5,
              }}
            />

            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default StudentTopbar;