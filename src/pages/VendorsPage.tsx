import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  LocationOn,
  Phone,
  Email,
  Language,
  Star,
  Add,
  Search,
  FilterList,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { vendorAPI, type Vendor } from "../services/api";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1",
    },
    background: {
      default: "#f9fafb",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
  },
});

const VendorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    city: "",
    state: "",
    search: "",
    min_rating: "",
    sort_by: "rating",
    sort_order: "desc" as "asc" | "desc",
  });

  const categories = [
    "catering",
    "venue",
    "photography",
    "entertainment",
    "decoration",
    "transportation",
    "planning",
    "other",
  ];

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        per_page: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      };

      const response = await vendorAPI.list(params);

      if (response.success) {
        setVendors(response.data);
        setTotalPages(response.pagination.last_page);
      }
    } catch (err) {
      setError("Failed to fetch vendors. Please try again.");
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    setPage(1);
    fetchVendors();
  };

  const formatPrice = (vendor: Vendor) => {
    return `$${vendor.pricing.baseRate}/${vendor.pricing.period}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      catering: "#ff6b6b",
      venue: "#4ecdc4",
      photography: "#45b7d1",
      entertainment: "#96ceb4",
      decoration: "#ffeaa7",
      transportation: "#dda0dd",
      planning: "#98d8c8",
      other: "#f7dc6f",
    };
    return colors[category] || "#e0e0e0";
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Event Vendors
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Find the perfect vendors for your event
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Stack spacing={3}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FilterList sx={{ mr: 1 }} />
              Filters
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "flex-end",
              }}
            >
              <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                <TextField
                  fullWidth
                  label="Search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search vendors..."
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Box>

              <Box sx={{ flex: "0 1 150px" }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: "0 1 120px" }}>
                <TextField
                  fullWidth
                  label="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                />
              </Box>

              <Box sx={{ flex: "0 1 80px" }}>
                <TextField
                  fullWidth
                  label="State"
                  value={filters.state}
                  onChange={(e) => handleFilterChange("state", e.target.value)}
                />
              </Box>

              <Box sx={{ flex: "0 1 150px" }}>
                <FormControl fullWidth>
                  <InputLabel>Min Rating</InputLabel>
                  <Select
                    value={filters.min_rating}
                    label="Min Rating"
                    onChange={(e) =>
                      handleFilterChange("min_rating", e.target.value)
                    }
                  >
                    <MenuItem value="">Any Rating</MenuItem>
                    <MenuItem value="4.0">4+ Stars</MenuItem>
                    <MenuItem value="4.5">4.5+ Stars</MenuItem>
                    <MenuItem value="4.8">4.8+ Stars</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: "0 1 100px" }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  sx={{ height: "56px" }}
                >
                  Search
                </Button>
              </Box>
            </Box>
          </Stack>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Vendors Grid */}
        {!loading && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: 3,
                mb: 4,
              }}
            >
              {vendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ flexGrow: 1 }}
                      >
                        {vendor.name}
                      </Typography>
                      <Chip
                        label={vendor.category}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(vendor.category),
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Rating
                        value={vendor.rating}
                        readOnly
                        precision={0.1}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {vendor.rating} ({vendor.reviews} reviews)
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {vendor.description}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationOn
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {vendor.location.city}, {vendor.location.state}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Star
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {formatPrice(vendor)}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      {vendor.specialties
                        .slice(0, 3)
                        .map((specialty, index) => (
                          <Chip
                            key={index}
                            label={specialty}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                    </Box>
                  </CardContent>

                  <CardActions
                    sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                  >
                    <Box>
                      {vendor.contact.phone && (
                        <IconButton
                          size="small"
                          href={`tel:${vendor.contact.phone}`}
                        >
                          <Phone fontSize="small" />
                        </IconButton>
                      )}
                      {vendor.contact.email && (
                        <IconButton
                          size="small"
                          href={`mailto:${vendor.contact.email}`}
                        >
                          <Email fontSize="small" />
                        </IconButton>
                      )}
                      {vendor.contact.website && (
                        <IconButton
                          size="small"
                          href={vendor.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Language fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Button variant="contained" size="small">
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            {/* No Results */}
            {vendors.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No vendors found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Try adjusting your filters or search terms
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Add Vendor FAB */}
        <Box sx={{ position: "fixed", bottom: 24, right: 24 }}>
          <Button
            onClick={() => navigate("/vendors/add")}
            variant="contained"
            startIcon={<Add />}
            sx={{
              borderRadius: "24px",
              px: 3,
              py: 1.5,
              background: "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
            }}
          >
            Add Vendor
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default VendorsPage;
