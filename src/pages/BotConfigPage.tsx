import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Settings,
  Psychology,
  RestoreFromTrash,
  Save,
  Refresh,
  SmartToy,
  Add,
  Delete,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { botConfigAPI } from "../services/api";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1",
    },
    secondary: {
      main: "#8b5cf6",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
});

interface BotConfig {
  systemPrompt: string;
  contextData: string[];
  personality: any;
}

const BotConfigPage: React.FC = () => {
  const [config, setConfig] = useState<BotConfig>({
    systemPrompt: "",
    contextData: [],
    personality: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newContextData, setNewContextData] = useState("");
  const [newPersonalityTrait, setNewPersonalityTrait] = useState("");

  // Load bot configuration on component mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);

      const response = await botConfigAPI.get();
      setConfig(response.config);
    } catch (error) {
      console.error("Error loading bot config:", error);
      toast.error("Error loading bot configuration");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      const response = await botConfigAPI.update(config);
      console.log(response);
    } catch (error) {
      console.error("Error saving bot config:", error);
      toast.error("Error saving bot configuration");
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = async () => {
    try {
      setSaving(true);
      const response = await botConfigAPI.reset();
      if (response.success && response.data) {
        setConfig(response.data);
        toast.success("Bot configuration reset to defaults!");
        setResetDialogOpen(false);
      } else {
        toast.error("Failed to reset bot configuration");
      }
    } catch (error) {
      console.error("Error resetting bot config:", error);
      toast.error("Error resetting bot configuration");
    } finally {
      setSaving(false);
    }
  };

  const addContextData = () => {
    if (newContextData.trim()) {
      setConfig((prev) => ({
        ...prev,
        contextData: [...prev.contextData, newContextData.trim()],
      }));
      setNewContextData("");
    }
  };

  const removeContextData = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      context_data: prev.contextData.filter((_, i) => i !== index),
    }));
  };

  const addPersonalityTrait = () => {
    if (newPersonalityTrait.trim()) {
      setConfig((prev) => ({
        ...prev,
        personality: [...prev.personality, newPersonalityTrait.trim()],
      }));
      setNewPersonalityTrait("");
    }
  };

  const removePersonalityTrait = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      personality: prev.personality.traits.filter(
        (_: any, i: any) => i !== index
      ),
    }));
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box mb={4}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <SmartToy color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" component="h1" fontWeight="600">
                Bot Configuration
              </Typography>
            </Stack>
            <Typography variant="body1" color="textSecondary">
              Customize your AI bot's behavior, personality, and knowledge base
            </Typography>
          </Box>

          {/* Configuration Form */}
          <Stack spacing={4}>
            {/* System Prompt */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Settings color="primary" />
                <Typography variant="h6">System Prompt</Typography>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="System Prompt"
                value={config.systemPrompt}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    system_prompt: e.target.value,
                  }))
                }
                placeholder="Define how the bot should behave and respond to users..."
                helperText="This prompt defines the bot's core behavior and instructions"
              />
            </Paper>

            {/* Context Data */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Psychology color="primary" />
                <Typography variant="h6">Context Data</Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Knowledge base items that the bot can reference during
                conversations
              </Typography>

              {/* Add new context data */}
              <Stack direction="row" spacing={2} mb={3}>
                <TextField
                  fullWidth
                  label="Add context data"
                  value={newContextData}
                  onChange={(e) => setNewContextData(e.target.value)}
                  placeholder="e.g., Event planning best practices..."
                  onKeyPress={(e) => e.key === "Enter" && addContextData()}
                />
                <Button
                  variant="contained"
                  onClick={addContextData}
                  startIcon={<Add />}
                  disabled={!newContextData.trim()}
                >
                  Add
                </Button>
              </Stack>

              {/* Display context data chips */}
              <Box>
                {config.contextData.length === 0 ? (
                  <Alert severity="info">No context data added yet</Alert>
                ) : (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {config.contextData.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        onDelete={() => removeContextData(index)}
                        deleteIcon={<Delete />}
                        variant="outlined"
                        sx={{ maxWidth: 300 }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>

            {/* Personality Traits */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Psychology color="secondary" />
                <Typography variant="h6">Personality Traits</Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Define the bot's personality characteristics and communication
                style
              </Typography>

              {/* Add new personality trait */}
              <Stack direction="row" spacing={2} mb={3}>
                <TextField
                  fullWidth
                  label="Add personality trait"
                  value={newPersonalityTrait}
                  onChange={(e) => setNewPersonalityTrait(e.target.value)}
                  placeholder="e.g., Professional, Friendly, Helpful..."
                  onKeyPress={(e) => e.key === "Enter" && addPersonalityTrait()}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={addPersonalityTrait}
                  startIcon={<Add />}
                  disabled={!newPersonalityTrait.trim()}
                >
                  Add
                </Button>
              </Stack>

              {/* Display personality trait chips */}
              <Box>
                {config.personality.traits.length === 0 ? (
                  <Alert severity="info">
                    No personality traits defined yet
                  </Alert>
                ) : (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {config.personality.traits.map((trait: any, index: any) => (
                      <Chip
                        key={index}
                        label={trait}
                        onDelete={() => removePersonalityTrait(index)}
                        deleteIcon={<Delete />}
                        color="secondary"
                        variant="outlined"
                        sx={{ maxWidth: 200 }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Stack>

          <Divider sx={{ my: 4 }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={saveConfig}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                size="large"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
              <Button
                variant="outlined"
                onClick={loadConfig}
                startIcon={<Refresh />}
                size="large"
              >
                Reload
              </Button>
            </Stack>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setResetDialogOpen(true)}
              startIcon={<RestoreFromTrash />}
              size="large"
            >
              Reset to Defaults
            </Button>
          </Stack>
        </Paper>

        {/* Reset Confirmation Dialog */}
        <Dialog
          open={resetDialogOpen}
          onClose={() => setResetDialogOpen(false)}
        >
          <DialogTitle>Reset Bot Configuration</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to reset the bot configuration to default
              values? This action cannot be undone and will overwrite all
              current settings.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={resetConfig}
              color="error"
              variant="contained"
              disabled={saving}
            >
              {saving ? "Resetting..." : "Reset"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default BotConfigPage;
