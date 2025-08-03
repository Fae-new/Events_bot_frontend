import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Chip } from "@mui/material";
import {
  Chat,
  Business,
  Settings,
  CheckCircle,
  Error,
  HourglassEmpty,
} from "@mui/icons-material";
import { useHealthCheck } from "../hooks/useHealthCheck";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { health } = useHealthCheck();

  const navItems = [
    { path: "/", label: "Chat", icon: <Chat /> },
    { path: "/vendors", label: "Vendors", icon: <Business /> },
    { path: "/bot-config", label: "Bot Config", icon: <Settings /> },
  ];

  const getStatusIcon = () => {
    switch (health.status) {
      case "ok":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "error":
        return <Error sx={{ fontSize: 16 }} />;
      default:
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case "ok":
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <AppBar
      position="static"
      sx={{ background: "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)" }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EventAI Platform
        </Typography>

        {/* Status Indicator */}
        <Chip
          icon={getStatusIcon()}
          label={health.message || "Checking..."}
          color={getStatusColor()}
          size="small"
          sx={{ mr: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor:
                  location.pathname === item.path
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
