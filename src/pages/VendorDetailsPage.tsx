import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
  TextField,
  Collapse,
} from "@mui/material";
import {
  ArrowBack,
  Schedule,
  CheckCircle,
  Send,
  Reply,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { API_BASE_URL } from "../services/api";
import ReactMarkdown from "react-markdown";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1",
    },
    background: {
      default: "#f9fafb",
    },
  },
});

interface SentBrief {
  sent_brief_id: number;
  chat_id: string;
  status: string;
  response: string | null;
  sent_at: string;
  response_received_at: string | null;
  has_response: boolean;
  event_brief: {
    id: number;
    title: string;
    brief_content: string;
    status: string;
    conversation_id: string;
    last_updated: string;
    created_at: string;
  } | null;
  brief_data_sent: any;
}

interface VendorBriefsResponse {
  success: boolean;
  vendor_id: number;
  vendor_name: string;
  vendor_category: string;
  total_briefs_received: number;
  data: SentBrief[];
}

const VendorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendorBriefs, setVendorBriefs] = useState<VendorBriefsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseForm, setResponseForm] = useState<{
    [key: number]: {
      open: boolean;
      text: string;
      submitting: boolean;
      title: string;
    };
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorBriefs = async () => {
      if (!id) {
        setError("Invalid vendor ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/vendors/${id}/sent-briefs`
        );
        const data = await response.json();

        if (data.success) {
          setVendorBriefs(data);
        } else {
          setError(data.error || "Failed to fetch vendor briefs");
        }
      } catch (err) {
        setError("Failed to fetch vendor briefs");
        console.error("Error fetching vendor briefs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorBriefs();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleResponseForm = (briefId: number) => {
    setResponseForm((prev) => ({
      ...prev,
      [briefId]: {
        open: !prev[briefId]?.open,
        text: prev[briefId]?.text || "",
        title: prev[briefId]?.title || "",
        submitting: false,
      },
    }));
  };

  const handleResponseTextChange = (briefId: number, text: string) => {
    setResponseForm((prev) => ({
      ...prev,
      [briefId]: {
        ...prev[briefId],
        text,
      },
    }));
  };

  const handleTitleChange = (briefId: number, title: string) => {
    setResponseForm((prev) => ({
      ...prev,
      [briefId]: {
        ...prev[briefId],
        title,
      },
    }));
  };

  const submitResponse = async (brief: SentBrief) => {
    if (!id || !brief.event_brief) return;

    const responseText = responseForm[brief.sent_brief_id]?.text?.trim();
    const responseTitle = responseForm[brief.sent_brief_id]?.title?.trim();
    if (!responseText || !responseTitle) {
      setError("Please enter a title and response before submitting.");
      return;
    }

    // Set submitting state
    setResponseForm((prev) => ({
      ...prev,
      [brief.sent_brief_id]: {
        ...prev[brief.sent_brief_id],
        submitting: true,
      },
    }));

    try {
      const response = await fetch(
        `https://stagging.useattend.com/app/v1/vendor/brief/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: "1",
            vendor_id: id,
            conversation_id: brief.event_brief.conversation_id,
            sender: "vendor",
            title: responseTitle,
            event_code: brief.event_brief.conversation_id,
            content: responseText,
          }),
        }
      );

      if (response.ok) {
        // Set success message BEFORE refreshing briefs and closing form
        setSuccessMessage("Response submitted successfully!");

        // Close the form
        setResponseForm((prev) => ({
          ...prev,
          [brief.sent_brief_id]: {
            open: false,
            text: "",
            submitting: false,
            title: "",
          },
        }));

        // Refresh the vendor briefs data
        const updatedResponse = await fetch(
          `${API_BASE_URL}/vendors/${id}/sent-briefs`
        );
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setVendorBriefs(updatedData);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.statusText || "Failed to submit response");
      }
    } catch (err) {
      setError("Failed to submit response");
      console.error("Error submitting response:", err);
    } finally {
      // Reset submitting state
      setResponseForm((prev) => ({
        ...prev,
        [brief.sent_brief_id]: {
          ...prev[brief.sent_brief_id],
          submitting: false,
        },
      }));
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (error || !vendorBriefs) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Vendor not found"}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/vendors")}
          >
            Back to Vendors
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/vendors"
            onClick={(e) => {
              e.preventDefault();
              navigate("/vendors");
            }}
            sx={{ cursor: "pointer" }}
          >
            Vendors
          </Link>
          <Typography color="text.primary">
            {vendorBriefs.vendor_name}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/vendors")}
          sx={{ mb: 3 }}
        >
          Back to Vendors
        </Button>

        {/* Success Message */}
        {successMessage && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              position: "fixed",
              top: 80,
              left: 0,
              right: 0,
              zIndex: 9999,
            }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && !loading && vendorBriefs && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Vendor Header */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {vendorBriefs.vendor_name}
                </Typography>
                <Chip
                  label={
                    vendorBriefs.vendor_category.charAt(0).toUpperCase() +
                    vendorBriefs.vendor_category.slice(1)
                  }
                  color="primary"
                  sx={{ mr: 2 }}
                />
                <Chip
                  label={`${vendorBriefs.total_briefs_received} briefs received`}
                  variant="outlined"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Event Briefs */}
        <Typography variant="h5" gutterBottom>
          Event Briefs Sent to this Vendor
        </Typography>

        {vendorBriefs.data.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No event briefs sent to this vendor yet
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {vendorBriefs.data.map((brief) => (
              <Card
                key={brief.sent_brief_id}
                sx={{
                  border: brief.has_response ? "2px solid #4caf50" : undefined,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {brief.event_brief?.title ||
                          `Brief #${brief.sent_brief_id}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Chat ID: {brief.chat_id}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip
                          size="small"
                          label={brief.status}
                          color={brief.has_response ? "success" : "warning"}
                          icon={
                            brief.has_response ? <CheckCircle /> : <Schedule />
                          }
                        />
                        <Chip
                          size="small"
                          label={`Sent: ${formatDate(brief.sent_at)}`}
                          variant="outlined"
                        />
                        {brief.response_received_at && (
                          <Chip
                            size="small"
                            label={`Responded: ${formatDate(
                              brief.response_received_at
                            )}`}
                            variant="outlined"
                            color="success"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Event Brief Content */}
                  {brief.event_brief && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Event Details:
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: "#f5f5f5",
                          p: 2,
                          borderRadius: 1,
                        }}
                      >
                        <ReactMarkdown>
                          {brief.event_brief.brief_content}
                        </ReactMarkdown>
                      </Box>
                    </Box>
                  )}

                  {/* Vendor Response */}
                  {brief.has_response && brief.response ? (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        color="success.main"
                      >
                        Vendor Response:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          backgroundColor: "#e8f5e8",
                          p: 2,
                          borderRadius: 1,
                          border: "1px solid #4caf50",
                        }}
                      >
                        {brief.response}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Reply />}
                          onClick={() =>
                            toggleResponseForm(brief.sent_brief_id)
                          }
                        >
                          {responseForm[brief.sent_brief_id]?.open
                            ? "Cancel"
                            : "Respond"}
                        </Button>
                      </Box>

                      {/* Response Form */}
                      <Collapse
                        in={responseForm[brief.sent_brief_id]?.open || false}
                      >
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Submit your response:
                          </Typography>
                          <TextField
                            fullWidth
                            label="Title"
                            value={
                              responseForm[brief.sent_brief_id]?.title || ""
                            }
                            onChange={(e) =>
                              handleTitleChange(
                                brief.sent_brief_id,
                                e.target.value
                              )
                            }
                            placeholder="Enter a title for your response..."
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={
                              responseForm[brief.sent_brief_id]?.text || ""
                            }
                            onChange={(e) =>
                              handleResponseTextChange(
                                brief.sent_brief_id,
                                e.target.value
                              )
                            }
                            placeholder="Enter your response to this event brief..."
                            sx={{ mb: 2 }}
                          />
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              startIcon={<Send />}
                              onClick={() => submitResponse(brief)}
                              disabled={
                                responseForm[brief.sent_brief_id]?.submitting ||
                                !responseForm[
                                  brief.sent_brief_id
                                ]?.text?.trim() ||
                                !responseForm[
                                  brief.sent_brief_id
                                ]?.title?.trim()
                              }
                            >
                              {responseForm[brief.sent_brief_id]?.submitting
                                ? "Submitting..."
                                : "Submit Response"}
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() =>
                                toggleResponseForm(brief.sent_brief_id)
                              }
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default VendorDetailsPage;
