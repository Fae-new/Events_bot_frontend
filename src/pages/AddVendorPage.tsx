import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import {
  Business,
  LocationOn,
  Phone,
  AttachMoney,
  Star,
  Save,
  Cancel,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { vendorAPI, type Vendor } from "../services/api";
import { ArrayInput } from "../components/ArrayInput";

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

interface VendorFormData {
  name: string;
  category: string;
  description: string;
  services: string[];
  specialties: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    serviceRadius: number;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  pricing: {
    baseRate: number;
    period: string;
    minimumOrder: string;
  };
  availability: {
    leadTime: number;
    seasonalRestrictions: string[];
  };
  credentials: {
    licensed: boolean;
    insured: boolean;
    yearsInBusiness: number;
  };
  rating: number;
  reviews: number;
}

interface ValidationErrors {
  [key: string]: string;
}

const AddVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    category: "catering",
    description: "",
    services: [""],
    specialties: [""],
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      serviceRadius: 0,
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    pricing: {
      baseRate: 0,
      period: "hour",
      minimumOrder: "",
    },
    availability: {
      leadTime: 1,
      seasonalRestrictions: [""],
    },
    credentials: {
      licensed: false,
      insured: false,
      yearsInBusiness: 0,
    },
    rating: 4.0,
    reviews: 0,
  });

  const categories = [
    { value: "catering", label: "Catering" },
    { value: "venue", label: "Venue" },
    { value: "photography", label: "Photography" },
    { value: "entertainment", label: "Entertainment" },
    { value: "decoration", label: "Decoration" },
    { value: "transportation", label: "Transportation" },
    { value: "planning", label: "Planning" },
    { value: "other", label: "Other" },
  ];

  const periods = [
    { value: "hour", label: "Per Hour" },
    { value: "day", label: "Per Day" },
    { value: "event", label: "Per Event" },
    { value: "project", label: "Per Project" },
  ];

  // Generic handler for nested state updates
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    path: string
  ) => {
    const { value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prevData) => {
      const newData = { ...prevData };
      let target: any = newData;
      const pathParts = path.split(".");

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!target[part]) {
          target[part] = {};
        }
        target = target[part];
      }

      const finalKey = pathParts[pathParts.length - 1];
      target[finalKey] = type === "checkbox" ? checked : value;
      return newData;
    });
  };

  // Array input handlers
  const handleArrayInputChange = (
    field: string,
    index: number,
    value: string
  ) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let target: any = newData;
      const pathParts = field.split(".");

      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]];
      }

      const finalKey = pathParts[pathParts.length - 1];
      target[finalKey][index] = value;
      return newData;
    });
  };

  const handleArrayInputAdd = (field: string) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let target: any = newData;
      const pathParts = field.split(".");

      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]];
      }

      const finalKey = pathParts[pathParts.length - 1];
      target[finalKey].push("");
      return newData;
    });
  };

  const handleArrayInputRemove = (field: string, index: number) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let target: any = newData;
      const pathParts = field.split(".");

      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]];
      }

      const finalKey = pathParts[pathParts.length - 1];
      target[finalKey].splice(index, 1);
      return newData;
    });
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Vendor name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.location.address.trim())
      newErrors.address = "Address is required.";
    if (!formData.location.city.trim()) newErrors.city = "City is required.";
    if (!formData.location.state.trim()) newErrors.state = "State is required.";
    if (!formData.location.zipCode.trim())
      newErrors.zipCode = "ZIP code is required.";
    if (!formData.contact.phone.trim()) newErrors.phone = "Phone is required.";
    if (!formData.contact.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
      newErrors.email = "Email format is invalid.";
    }

    // Numeric validations
    if (formData.pricing.baseRate <= 0) {
      newErrors.baseRate = "Base rate must be greater than 0.";
    }
    if (formData.location.serviceRadius <= 0) {
      newErrors.serviceRadius = "Service radius must be greater than 0.";
    }
    if (formData.availability.leadTime <= 0) {
      newErrors.leadTime = "Lead time must be greater than 0.";
    }

    // Array fields validation
    const nonEmptyServices = formData.services.filter((s) => s.trim());
    if (nonEmptyServices.length === 0) {
      newErrors.services = "At least one service is required.";
    }

    const nonEmptySpecialties = formData.specialties.filter((s) => s.trim());
    if (nonEmptySpecialties.length === 0) {
      newErrors.specialties = "At least one specialty is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    try {
      setLoading(true);

      // Clean up data before submission
      const cleanedData = {
        ...formData,
        services: formData.services.filter((service) => service.trim()),
        specialties: formData.specialties.filter((specialty) =>
          specialty.trim()
        ),
        availability: {
          leadTime: Number(formData.availability.leadTime),
          seasonal_restrictions:
            formData.availability.seasonalRestrictions.filter(
              (restriction: string) => restriction.trim()
            ),
        },
        location: {
          ...formData.location,
          zip_code: formData.location.zipCode,
          service_radius: Number(formData.location.serviceRadius),
        },
        pricing: {
          ...formData.pricing,
          minimumOrder: formData.pricing.minimumOrder,
        },
        credentials: {
          ...formData.credentials,
          years_in_business: Number(formData.credentials.yearsInBusiness),
        },
        rating: Number(formData.rating),
        reviews: Number(formData.reviews),
      };

      const response = await vendorAPI.create(
        cleanedData as Omit<Vendor, "id" | "created_at">
      );

      if (response.success) {
        toast.success("Vendor added successfully!");
        setTimeout(() => {
          navigate("/vendors");
        }, 2000);
      } else {
        toast.error("Failed to add vendor. Please try again.");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      toast.error("Error adding vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <Business color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" component="h1" fontWeight="600">
                Add New Vendor
              </Typography>
            </Stack>
            <Typography variant="body1" color="textSecondary">
              Add a new vendor to the platform with their services and details
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Star color="primary" />
                <Typography variant="h6">Basic Information</Typography>
              </Stack>
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => handleInputChange(e, "category")}
                    required
                  >
                    {categories.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange(e, "description")}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                />
              </Stack>
            </Paper>

            {/* Services & Specialties */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 3 }}
            >
              <Box flex={1}>
                <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                  <ArrayInput
                    field="services"
                    label="Services Offered"
                    placeholder="e.g., Wedding catering, Corporate events"
                    addbtnText="Add Service"
                    icon={Business}
                    value={formData.services}
                    error={errors.services}
                    onChange={handleArrayInputChange}
                    onAdd={handleArrayInputAdd}
                    onRemove={handleArrayInputRemove}
                  />
                </Paper>
              </Box>
              <Box flex={1}>
                <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                  <ArrayInput
                    field="specialties"
                    label="Specialties"
                    placeholder="e.g., Italian cuisine, Outdoor events"
                    addbtnText="Add Specialty"
                    icon={Star}
                    value={formData.specialties}
                    error={errors.specialties}
                    onChange={handleArrayInputChange}
                    onAdd={handleArrayInputAdd}
                    onRemove={handleArrayInputRemove}
                  />
                </Paper>
              </Box>
            </Stack>

            {/* Location */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <LocationOn color="primary" />
                <Typography variant="h6">Location & Service Area</Typography>
              </Stack>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange(e, "location.address")}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                />
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange(e, "location.city")}
                    error={!!errors.city}
                    helperText={errors.city}
                    required
                  />
                  <TextField
                    fullWidth
                    label="State"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange(e, "location.state")}
                    error={!!errors.state}
                    helperText={errors.state}
                    required
                  />
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={formData.location.zipCode}
                    onChange={(e) => handleInputChange(e, "location.zipCode")}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode}
                    required
                  />
                </Stack>
                <TextField
                  label="Service Radius (miles)"
                  type="number"
                  value={formData.location.serviceRadius}
                  onChange={(e) =>
                    handleInputChange(e, "location.serviceRadius")
                  }
                  error={!!errors.serviceRadius}
                  helperText={errors.serviceRadius}
                  InputProps={{ inputProps: { min: 1 } }}
                  required
                  sx={{ maxWidth: 300 }}
                />
              </Stack>
            </Paper>

            {/* Contact Information */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Phone color="primary" />
                <Typography variant="h6">Contact Information</Typography>
              </Stack>
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange(e, "contact.phone")}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleInputChange(e, "contact.email")}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Stack>
                <TextField
                  fullWidth
                  label="Website"
                  type="url"
                  value={formData.contact.website}
                  onChange={(e) => handleInputChange(e, "contact.website")}
                  placeholder="https://website.com"
                />
              </Stack>
            </Paper>

            {/* Pricing */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <AttachMoney color="primary" />
                <Typography variant="h6">Pricing</Typography>
              </Stack>
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField
                    label="Base Rate"
                    type="number"
                    value={formData.pricing.baseRate}
                    onChange={(e) => handleInputChange(e, "pricing.baseRate")}
                    error={!!errors.baseRate}
                    helperText={errors.baseRate}
                    InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                    required
                  />
                  <TextField
                    select
                    label="Period"
                    value={formData.pricing.period}
                    onChange={(e) => handleInputChange(e, "pricing.period")}
                  >
                    {periods.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="Minimum Order"
                    value={formData.pricing.minimumOrder}
                    onChange={(e) =>
                      handleInputChange(e, "pricing.minimumOrder")
                    }
                    placeholder="e.g., $500, 2 hours"
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* Availability & Credentials */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 3 }}
            >
              <Box flex={1}>
                <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" mb={3}>
                    Availability
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      label="Lead Time (days)"
                      type="number"
                      value={formData.availability.leadTime}
                      onChange={(e) =>
                        handleInputChange(e, "availability.leadTime")
                      }
                      error={!!errors.leadTime}
                      helperText={errors.leadTime}
                      InputProps={{ inputProps: { min: 1 } }}
                      required
                    />
                    <ArrayInput
                      field="availability.seasonalRestrictions"
                      label="Seasonal Restrictions"
                      placeholder="e.g., Not available in winter"
                      addbtnText="Add Restriction"
                      icon={Star}
                      value={formData.availability.seasonalRestrictions}
                      onChange={handleArrayInputChange}
                      onAdd={handleArrayInputAdd}
                      onRemove={handleArrayInputRemove}
                    />
                  </Stack>
                </Paper>
              </Box>
              <Box flex={1}>
                <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" mb={3}>
                    Credentials
                  </Typography>
                  <Stack spacing={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.credentials.licensed}
                          onChange={(e) =>
                            handleInputChange(e, "credentials.licensed")
                          }
                        />
                      }
                      label="Licensed"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.credentials.insured}
                          onChange={(e) =>
                            handleInputChange(e, "credentials.insured")
                          }
                        />
                      }
                      label="Insured"
                    />
                    <TextField
                      label="Years in Business"
                      type="number"
                      value={formData.credentials.yearsInBusiness}
                      onChange={(e) =>
                        handleInputChange(e, "credentials.yearsInBusiness")
                      }
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Stack>
                </Paper>
              </Box>
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate("/vendors")}
                startIcon={<Cancel />}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save />}
                size="large"
              >
                {loading ? "Adding Vendor..." : "Add Vendor"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default AddVendorPage;
