import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { vendorAPI, type Vendor, API_BASE_URL } from "../services/api";

interface VendorListProps {
  vendors?: Vendor[];
  vendorIds?: number[];
  conversationId?: string;
}

const VendorList: React.FC<VendorListProps> = ({
  vendors,
  vendorIds,
  conversationId,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(
    null
  );
  const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingBrief, setSendingBrief] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch vendors by IDs if vendorIds are provided
  useEffect(() => {
    const fetchVendors = async () => {
      if (!vendorIds || vendorIds.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const response = await vendorAPI.getByIds(
          vendorIds,
          conversationId as string,
          "1"
        );
        console.log("Fetched vendors:", response);
        if (response.success && response.data) {
          console.log(response.data[0]);
          setFetchedVendors(response.data);
        } else {
          setError("Failed to fetch vendor data");
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Failed to fetch vendor data");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [vendorIds]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    vendor: Vendor
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendor(vendor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVendor(null);
  };

  const handleSendBrief = async () => {
    if (!selectedVendor || !conversationId) {
      setError("No conversation ID provided or vendor selected");
      handleMenuClose();
      return;
    }

    setSendingBrief(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/send-brief-to-vendors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: "1",
            vendor_ids: [selectedVendor.id],
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          `Event brief successfully sent to ${selectedVendor.name}!`
        );

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || "Failed to send brief to vendor");
      }
    } catch (err) {
      setError("Failed to send brief to vendor");
      console.error("Error sending brief:", err);
    } finally {
      setSendingBrief(false);
      handleMenuClose();
    }
  };

  // Determine which vendors to display
  const displayVendors = vendors || fetchedVendors;

  // Loading state
  if (loading) {
    return (
      <Box sx={{ mt: 2, p: 2, textAlign: "center" }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading vendors...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ mt: 2, p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!displayVendors || displayVendors.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No vendors found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Pricing</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Specialties</TableCell>
              <TableCell>Sent Brief</TableCell>
              <TableCell>Response</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell>{vendor.rating}</TableCell>
                <TableCell>
                  {vendor.location
                    ? `${vendor.location.city}, ${vendor.location.state} (${vendor.location.serviceRadius}km)`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {vendor.contact
                    ? `${vendor.contact.email || "No email"} | ${
                        vendor.contact.phone || "No phone"
                      }`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {vendor.pricing
                    ? `$${vendor.pricing.baseRate}/${vendor.pricing.period}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {vendor.services ? vendor.services.join(", ") : "N/A"}
                </TableCell>
                <TableCell>
                  {vendor.specialties ? vendor.specialties.join(", ") : "N/A"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={vendor.has_been_sent_brief ? "Sent" : "Not Sent"}
                    color={vendor.has_been_sent_brief ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {vendor?.response?.content ? (
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {vendor.response.content}
                    </Typography>
                  ) : (
                    <Chip label="Not Responded" color="warning" size="small" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(event) => handleMenuClick(event, vendor)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={handleSendBrief}
          disabled={sendingBrief || !conversationId}
          title={!conversationId ? "No conversation context available" : ""}
        >
          {sendingBrief ? "Sending..." : "Send Brief"}
        </MenuItem>
        {!conversationId && (
          <Typography
            variant="caption"
            sx={{ px: 2, py: 1, color: "text.secondary", fontSize: "0.7rem" }}
          >
            No conversation context
          </Typography>
        )}
      </Menu>
    </Box>
  );
};

export default VendorList;
