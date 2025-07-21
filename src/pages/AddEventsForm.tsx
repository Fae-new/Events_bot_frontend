import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Rating,
} from "@mui/material";
import {
  LocationOn,
  AttachMoney,
  Group,
  Event,
  Phone,
  DirectionsCar,
  Restaurant,
  VolumeUp,
  Accessible,
  Park,
  Star,
} from "@mui/icons-material";
import { ArrayInput } from "../components/ArrayInput";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

// Ensure Tailwind CSS is loaded in your project for these classes to work.
// For example, in your public/index.html, you might have:
// <script src="https://cdn.tailwindcss.com"></script>
// Or, if using a build system, ensure your Tailwind setup is correct.

interface EventCenter {
  name: string;
  location: {
    city: string;
    state: string;
    address: string;
    coordinates: { lat: string; lng: string };
  };
  capacity: {
    seated: string;
    standing: string;
    cocktail: string;
  };
  amenities: string[];
  pricing: {
    baseRate: string;
    currency: string;
    period: string;
    additionalFees: string[];
  };
  availability: {
    timeSlots: string[];
    blackoutDates: string[];
  };
  eventTypes: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  features: {
    parking: { spaces: string; free: boolean };
    catering: { inHouse: boolean; preferredVendors: string[] };
    av: { included: boolean; equipment: string[] };
    accessibility: boolean;
    outdoor: boolean;
  };
  rating: number;
  reviews: number;
}

interface ValidationErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  seated?: string;
  standing?: string;
  cocktail?: string;
  baseRate?: string;
  phone?: string;
  email?: string;
  amenities?: string;
  eventTypes?: string;
  timeSlots?: string;
  additionalFees?: string;
  // Add more specific error types if needed for nested fields
}

interface EventCenterFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: EventCenter | null;
}

const EventCenterForm = ({
  onSubmit,
  isLoading = false,
  initialData = null,
}: EventCenterFormProps) => {
  const [formData, setFormData] = useState<EventCenter>(
    initialData || {
      name: "",
      location: {
        city: "",
        state: "",
        address: "",
        coordinates: { lat: "", lng: "" },
      },
      capacity: {
        seated: "",
        standing: "",
        cocktail: "",
      },
      amenities: [""],
      pricing: {
        baseRate: "",
        currency: "USD",
        period: "day",
        additionalFees: [""],
      },
      availability: {
        timeSlots: [""],
        blackoutDates: [""],
      },
      eventTypes: [""],
      contact: {
        phone: "",
        email: "",
        website: "",
      },
      features: {
        parking: { spaces: "", free: true },
        catering: { inHouse: false, preferredVendors: [""] },
        av: { included: false, equipment: [""] },
        accessibility: false,
        outdoor: false,
      },
      rating: 4.0,
      reviews: 0,
    }
  );

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Generic handler for nested state updates
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    path: string
  ) => {
    const { value, type, checked } = e.target as HTMLInputElement;
    setFormData((prevData) => {
      const newData = { ...prevData };
      let target: any = newData;
      const pathParts = path.split(".");

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!target[part]) {
          target[part] = {}; // Initialize if undefined
        }
        target = target[part];
      }

      const finalKey = pathParts[pathParts.length - 1];
      target[finalKey] = type === "checkbox" ? checked : value;
      return newData;
    });
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.location.address.trim())
      newErrors.address = "Address is required.";
    if (!formData.location.city.trim()) newErrors.city = "City is required.";
    if (!formData.location.state.trim()) newErrors.state = "State is required.";

    // Capacity validation
    if (!formData.capacity.seated || parseInt(formData.capacity.seated) <= 0) {
      newErrors.seated = "Seated capacity must be greater than 0.";
    }
    if (
      !formData.capacity.standing ||
      parseInt(formData.capacity.standing) <= 0
    ) {
      newErrors.standing = "Standing capacity must be greater than 0.";
    }
    if (
      !formData.capacity.cocktail ||
      parseInt(formData.capacity.cocktail) <= 0
    ) {
      newErrors.cocktail = "Cocktail capacity must be greater than 0.";
    }

    // Pricing validation
    if (
      !formData.pricing.baseRate ||
      parseFloat(formData.pricing.baseRate) <= 0
    ) {
      newErrors.baseRate = "Base rate must be greater than 0.";
    }

    // Contact validation
    if (!formData.contact.phone.trim()) newErrors.phone = "Phone is required.";
    if (!formData.contact.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
      newErrors.email = "Email format is invalid.";
    }

    // Array fields validation
    const nonEmptyAmenities = formData.amenities.filter((a) => a.trim());
    if (nonEmptyAmenities.length === 0)
      newErrors.amenities = "At least one amenity is required.";

    const nonEmptyEventTypes = formData.eventTypes.filter((et) => et.trim());
    if (nonEmptyEventTypes.length === 0)
      newErrors.eventTypes = "At least one event type is required.";

    const nonEmptyTimeSlots = formData.availability.timeSlots.filter((ts) =>
      ts.trim()
    );
    if (nonEmptyTimeSlots.length === 0)
      newErrors.timeSlots = "At least one time slot is required.";

    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    // Clean up data before submission
    const cleanedData = {
      ...formData,
      capacity: {
        seated: parseInt(formData.capacity.seated),
        standing: parseInt(formData.capacity.standing),
        cocktail: parseInt(formData.capacity.cocktail),
      },
      pricing: {
        ...formData.pricing,
        baseRate: parseFloat(formData.pricing.baseRate),
        additionalFees: formData.pricing.additionalFees.filter((fee) =>
          fee.trim()
        ),
      },
      amenities: formData.amenities.filter((amenity) => amenity.trim()),
      eventTypes: formData.eventTypes.filter((type) => type.trim()),
      availability: {
        timeSlots: formData.availability.timeSlots.filter((slot) =>
          slot.trim()
        ),
        blackoutDates: formData.availability.blackoutDates.filter((date) =>
          date.trim()
        ),
      },
      features: {
        ...formData.features,
        parking: {
          ...formData.features.parking,
          spaces: parseInt(formData.features.parking.spaces) || 0,
        },
        catering: {
          ...formData.features.catering,
          preferredVendors: formData.features.catering.preferredVendors.filter(
            (v) => v.trim()
          ),
        },
        av: {
          ...formData.features.av,
          equipment: formData.features.av.equipment.filter((eq) => eq.trim()),
        },
      },
      location: {
        ...formData.location,
        coordinates:
          formData.location.coordinates.lat && formData.location.coordinates.lng
            ? {
                lat: parseFloat(formData.location.coordinates.lat),
                lng: parseFloat(formData.location.coordinates.lng),
              }
            : undefined, // Set to undefined if coordinates are not provided
      },
    };

    try {
      await onSubmit({ eventCenter: cleanedData });
      toast.success(
        initialData
          ? "Event center updated successfully!"
          : "Event center added successfully!"
      );
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const updateArrayField = (
    field: string,
    index: number,
    value: string,
    _subField: string | null = null
  ) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const fieldPath = field.split(".");
      let target: any = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        target = target[fieldPath[i]];
      }
      const arrayField = fieldPath[fieldPath.length - 1];
      const newArray = [...target[arrayField]];
      newArray[index] = value;
      target[arrayField] = newArray;
      return newData;
    });
  };

  const addArrayItem = (field: string, defaultValue: string = "") => {
    setFormData((prev) => {
      const newData = { ...prev };
      const fieldPath = field.split(".");
      let target: any = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        target = target[fieldPath[i]];
      }
      const arrayField = fieldPath[fieldPath.length - 1];
      target[arrayField] = [...target[arrayField], defaultValue];
      return newData;
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const fieldPath = field.split(".");
      let target: any = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        target = target[fieldPath[i]];
      }
      const arrayField = fieldPath[fieldPath.length - 1];
      target[arrayField] = target[arrayField].filter(
        (_: any, i: number) => i !== index
      );
      return newData;
    });
  };

  // Helper function to get nested value from form data
  // const getNestedValue = (obj: any, path: string): any => {
  //   return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  // };

  const handleArrayInputChange = (
    field: string,
    index: number,
    value: string
  ) => {
    updateArrayField(field, index, value);
  };

  const handleArrayInputAdd = (field: string) => {
    addArrayItem(field);
  };

  const handleArrayInputRemove = (field: string, index: number) => {
    removeArrayItem(field, index);
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
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            {initialData ? "Edit Event Center" : "Add New Event Center"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 4 }}
          >
            {/* Basic Information */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Star color="primary" />
                <Typography variant="h6">Basic Information</Typography>
              </Stack>
              <Stack
                spacing={3}
                direction={{ xs: "column", md: "row" }}
                sx={{ width: "100%" }}
              >
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Box>
                <Box flex={1}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    value={formData.rating}
                    onChange={(_e, newValue) => {
                      handleInputChange(
                        { target: { value: newValue } } as any,
                        "rating"
                      );
                    }}
                    precision={0.5}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Location */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <LocationOn color="primary" />
                <Typography variant="h6">Location</Typography>
              </Stack>
              <Stack spacing={3}>
                <Box>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.location.address}
                    onChange={(e) => handleInputChange(e, "location.address")}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                  />
                </Box>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.location.city}
                      onChange={(e) => handleInputChange(e, "location.city")}
                      error={!!errors.city}
                      helperText={errors.city}
                      required
                    />
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="State"
                      value={formData.location.state}
                      onChange={(e) => handleInputChange(e, "location.state")}
                      error={!!errors.state}
                      helperText={errors.state}
                      required
                    />
                  </Box>
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      type="number"
                      value={formData.location.coordinates.lat}
                      onChange={(e) =>
                        handleInputChange(e, "location.coordinates.lat")
                      }
                      InputProps={{ inputProps: { step: "any" } }}
                    />
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      type="number"
                      value={formData.location.coordinates.lng}
                      onChange={(e) =>
                        handleInputChange(e, "location.coordinates.lng")
                      }
                      InputProps={{ inputProps: { step: "any" } }}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Capacity */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Group color="primary" />
                <Typography variant="h6">Capacity</Typography>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="Seated"
                    type="number"
                    value={formData.capacity.seated}
                    onChange={(e) => handleInputChange(e, "capacity.seated")}
                    error={!!errors.seated}
                    helperText={errors.seated}
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Box>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="Standing"
                    type="number"
                    value={formData.capacity.standing}
                    onChange={(e) => handleInputChange(e, "capacity.standing")}
                    error={!!errors.standing}
                    helperText={errors.standing}
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Box>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="Cocktail"
                    type="number"
                    value={formData.capacity.cocktail}
                    onChange={(e) => handleInputChange(e, "capacity.cocktail")}
                    error={!!errors.cocktail}
                    helperText={errors.cocktail}
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Box>
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
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Base Rate"
                      type="number"
                      value={formData.pricing.baseRate}
                      onChange={(e) => handleInputChange(e, "pricing.baseRate")}
                      error={!!errors.baseRate}
                      helperText={errors.baseRate}
                      required
                      InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                    />
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      select
                      label="Currency"
                      value={formData.pricing.currency}
                      onChange={(e) => handleInputChange(e, "pricing.currency")}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                      <MenuItem value="NGN">NGN</MenuItem>
                    </TextField>
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      select
                      label="Period"
                      value={formData.pricing.period}
                      onChange={(e) => handleInputChange(e, "pricing.period")}
                    >
                      <MenuItem value="hour">Per Hour</MenuItem>
                      <MenuItem value="day">Per Day</MenuItem>
                      <MenuItem value="event">Per Event</MenuItem>
                    </TextField>
                  </Box>
                </Stack>
                <Box>
                  <ArrayInput
                    field="pricing.additionalFees"
                    label="Additional Fees"
                    addbtnText="Add Fee"
                    placeholder="e.g., Cleaning fee, Security deposit"
                    icon={AttachMoney}
                    value={formData.pricing.additionalFees}
                    error={errors.additionalFees}
                    onChange={handleArrayInputChange}
                    onAdd={handleArrayInputAdd}
                    onRemove={handleArrayInputRemove}
                  />
                </Box>
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
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.contact.phone}
                      onChange={(e) => handleInputChange(e, "contact.phone")}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      required
                    />
                  </Box>
                  <Box flex={1}>
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
                  </Box>
                </Stack>
                <Box>
                  <TextField
                    fullWidth
                    label="Website"
                    type="url"
                    value={formData.contact.website}
                    onChange={(e) => handleInputChange(e, "contact.website")}
                    placeholder="https://website.com"
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Features */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Star color="primary" />
                <Typography variant="h6">Features</Typography>
              </Stack>
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  {/* Parking */}
                  <Box flex={1}>
                    <Box sx={{ mb: 3 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        mb={2}
                      >
                        <DirectionsCar color="primary" />
                        <Typography variant="subtitle1">Parking</Typography>
                      </Stack>
                      <TextField
                        fullWidth
                        label="Number of Spaces"
                        type="number"
                        value={formData.features.parking.spaces}
                        onChange={(e) =>
                          handleInputChange(e, "features.parking.spaces")
                        }
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{ mb: 2 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.features.parking.free}
                            onChange={(e) =>
                              handleInputChange(e, "features.parking.free")
                            }
                          />
                        }
                        label="Free parking available"
                      />
                    </Box>
                  </Box>

                  {/* Accessibility & Outdoor */}
                  <Box flex={1}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Environment
                      </Typography>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.features.accessibility}
                              onChange={(e) =>
                                handleInputChange(e, "features.accessibility")
                              }
                            />
                          }
                          label={
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Accessible color="primary" />
                              <Typography>Wheelchair accessible</Typography>
                            </Stack>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.features.outdoor}
                              onChange={(e) =>
                                handleInputChange(e, "features.outdoor")
                              }
                            />
                          }
                          label={
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Park color="primary" />
                              <Typography>Outdoor space available</Typography>
                            </Stack>
                          }
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Stack>

                {/* Catering */}
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={2}
                    >
                      <Restaurant color="primary" />
                      <Typography variant="subtitle1">Catering</Typography>
                    </Stack>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.features.catering.inHouse}
                          onChange={(e) =>
                            handleInputChange(e, "features.catering.inHouse")
                          }
                        />
                      }
                      label="In-house catering available"
                      sx={{ mb: 2 }}
                    />
                    <ArrayInput
                      field="features.catering.preferredVendors"
                      label="Preferred Vendors"
                      addbtnText="Add Vendor"
                      placeholder="Vendor name"
                      icon={Restaurant}
                      value={formData.features.catering.preferredVendors}
                      onChange={handleArrayInputChange}
                      onAdd={handleArrayInputAdd}
                      onRemove={handleArrayInputRemove}
                    />
                  </Box>
                </Box>

                {/* AV Equipment */}
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={2}
                    >
                      <VolumeUp color="primary" />
                      <Typography variant="subtitle1">
                        Audio/Visual Equipment
                      </Typography>
                    </Stack>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.features.av.included}
                          onChange={(e) =>
                            handleInputChange(e, "features.av.included")
                          }
                        />
                      }
                      label="AV equipment included"
                      sx={{ mb: 2 }}
                    />
                    <ArrayInput
                      field="features.av.equipment"
                      label="Available Equipment"
                      addbtnText="Add Equipment"
                      placeholder="e.g., Projector, Sound system"
                      icon={VolumeUp}
                      value={formData.features.av.equipment}
                      onChange={handleArrayInputChange}
                      onAdd={handleArrayInputAdd}
                      onRemove={handleArrayInputRemove}
                    />
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* Amenities & Event Types */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 3 }}
            >
              <Box flex={1}>
                <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                  <ArrayInput
                    field="amenities"
                    label="Amenities"
                    placeholder="e.g., WiFi, Kitchen, Restrooms"
                    addbtnText="Add Amenity"
                    icon={Star}
                    value={formData.amenities}
                    error={errors.amenities}
                    onChange={handleArrayInputChange}
                    onAdd={handleArrayInputAdd}
                    onRemove={handleArrayInputRemove}
                  />
                </Paper>
              </Box>
              <Box flex={1}>
                <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                  <ArrayInput
                    field="eventTypes"
                    label="Event Types"
                    placeholder="e.g., Wedding, Corporate, Birthday"
                    addbtnText="Add Event Type"
                    icon={Event}
                    value={formData.eventTypes}
                    error={errors.eventTypes}
                    onChange={handleArrayInputChange}
                    onAdd={handleArrayInputAdd}
                    onRemove={handleArrayInputRemove}
                  />
                </Paper>
              </Box>
            </Stack>

            {/* Availability */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Event color="primary" />
                <Typography variant="h6">Availability</Typography>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                <Box flex={1}>
                  <ArrayInput
                    field="availability.timeSlots"
                    label="Time Slots"
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    addbtnText="Add Time Slot"
                    icon={Event}
                    value={formData.availability.timeSlots}
                    error={errors.timeSlots}
                    onChange={handleArrayInputChange}
                    onAdd={handleArrayInputAdd}
                    onRemove={handleArrayInputRemove}
                  />
                </Box>
                <Box flex={1}>
                  <ArrayInput
                    field="availability.blackoutDates"
                    label="Blackout Dates"
                    addbtnText="Add Blackout Date"
                    placeholder="e.g., 2024-12-25 (YYYY-MM-DD)"
                    icon={Event}
                    value={formData.availability.blackoutDates}
                    onChange={handleArrayInputChange}
                    onAdd={handleArrayInputAdd}
                    onRemove={handleArrayInputRemove}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Submit Button */}
            <Box sx={{ mt: 4 }}>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as any);
                }}
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 2,
                  fontSize: "1.1rem",
                }}
              >
                {isLoading
                  ? "Saving..."
                  : initialData
                    ? "Update Event Center"
                    : "Add Event Center"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default EventCenterForm;
