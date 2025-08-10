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
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { vendorAPI, type Vendor } from "../services/api";

interface VendorListProps {
  vendors?: Vendor[];
  vendorIds?: number[];
}

const VendorList: React.FC<VendorListProps> = ({ vendors, vendorIds }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(
    null
  );
  const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendors by IDs if vendorIds are provided
  useEffect(() => {
    const fetchVendors = async () => {
      if (!vendorIds || vendorIds.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const response = await vendorAPI.getByIds(vendorIds);
        if (response.success && response.data) {
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

  const handleSendBrief = () => {
    if (selectedVendor) {
      // TODO: Implement send brief functionality
      console.log("Send brief to vendor:", selectedVendor);
      // You can add your brief sending logic here
    }
    handleMenuClose();
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
        <MenuItem onClick={handleSendBrief}>Send Brief</MenuItem>
      </Menu>
    </Box>
  );
};

export default VendorList;
