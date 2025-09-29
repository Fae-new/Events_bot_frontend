import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { API_BASE_URL } from "../services/api";

interface VendorContact {
  email: string;
  phone: string;
  website: string | null;
}

interface VendorInfo {
  name: string;
  category: string;
  contact: VendorContact;
  rating: string;
}

interface VendorResponse {
  id: number | null;
  user_id: string;
  vendor_id: string | number;
  sender: string;
  event_code: string;
  title: string;
  content: string | null;
  conversation_id: string;
  timestamp: string;
  vendor_info: VendorInfo;
}

interface VendorResponseUiProps {
  conversationId: string;
  userId: string;
}

// Group responses by vendor_id
function groupByVendor(responses: VendorResponse[]) {
  const groups: { [vendorId: string]: VendorResponse[] } = {};
  responses.forEach((resp) => {
    const key = String(resp.vendor_id);
    if (!groups[key]) groups[key] = [];
    groups[key].push(resp);
  });
  return groups;
}

const VendorResponseUi: React.FC<VendorResponseUiProps> = ({
  conversationId,
  userId,
}) => {
  const [responses, setResponses] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          API_BASE_URL +
            `/conversations/${conversationId}/vendor-responses/${userId}`
        );
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.responses)) {
          setResponses(data.data.responses);
        } else {
          setError("Failed to fetch vendor responses");
        }
      } catch (err) {
        setError("Failed to fetch vendor responses");
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [conversationId, userId]);

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!responses.length) {
    return <Typography>No vendor responses found.</Typography>;
  }

  const grouped = groupByVendor(responses);

  return (
    <Box sx={{ mt: 2 }}>
      {Object.entries(grouped).map(([vendorId, vendorResponses]) => {
        const vendor = vendorResponses[0].vendor_info;
        return (
          <Card key={vendorId} sx={{ mb: 4 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar>{vendor.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{vendor.name}</Typography>
                  <Chip
                    label={vendor.category}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip label={`Rating: ${vendor.rating}`} size="small" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Email: {vendor.contact.email} | Phone:{" "}
                    {vendor.contact.phone}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              {vendorResponses.map((resp) => (
                <Box key={resp.id ?? Math.random()} sx={{ mb: 2, pl: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    Vendor Response
                  </Typography>

                  {resp.content ? (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {resp.content}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontStyle: "italic" }}
                    >
                      No response yet
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {resp.timestamp}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default VendorResponseUi;
