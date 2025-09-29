# Vendor Brief Management API Documentation

## Overview

This documentation covers all endpoints for managing vendor brief distribution, response tracking, and vendor communication within the Attend Agent system. These APIs enable complete workflow management from event brief creation through vendor response collection.

## Base URL

All endpoints are prefixed with `/api`

---

## 1. Send Event Brief to Vendors

### Endpoint

**POST** `/api/conversations/{conversationId}/send-brief-to-vendors`

### Purpose

Sends an event brief to specified vendors or auto-selects top-rated vendors. This endpoint handles duplicate submissions by updating existing records instead of creating new ones.

### URL Parameters

| Parameter        | Type   | Required | Description                                         |
| ---------------- | ------ | -------- | --------------------------------------------------- |
| `conversationId` | string | Yes      | The conversation ID associated with the event brief |

### Request Body

```json
{
  "vendor_ids": [1, 2, 3, 4] // Optional: Array of vendor IDs
}
```

### Request Body Parameters

| Parameter      | Type    | Required     | Description                                                                                                |
| -------------- | ------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `vendor_ids`   | array   | **Required** | Array of vendor IDs to send the brief to. Each ID must be a valid integer that exists in the vendors table |
| `vendor_ids.*` | integer | Yes          | Individual vendor ID (must exist in vendors table)                                                         |

### Request Headers

```
Content-Type: application/json
Accept: application/json
```

### Behavior Details

#### Auto-Selection Logic (if vendor_ids is empty)

- Selects vendors with rating >= 4.0
- Limits to top 10 vendors
- Orders by rating (highest first)

#### Duplicate Handling

- If an event brief was already sent to a vendor, the system **updates** the existing record instead of creating a duplicate
- Updates include: brief_data, reset response to null, status to 'sent', new sent_at timestamp
- Response includes `action` field indicating whether record was 'created' or 'updated'

#### Validation Rules

- `vendor_ids` array is required
- Each vendor ID must be an integer
- Each vendor ID must exist in the vendors table
- Conversation must exist and have an associated event brief

### Success Response (200 OK)

```json
{
  "success": true,
  "conversation_id": "conv_12345",
  "data": {
    "success": true,
    "message": "Event brief sent to 3 vendors",
    "total_sent": 3,
    "total_failed": 0,
    "sent_briefs": [
      {
        "vendor_id": 1,
        "vendor_name": "Premium Catering Co",
        "sent_brief_id": 15,
        "status": "sent",
        "action": "created"
      },
      {
        "vendor_id": 2,
        "vendor_name": "Elite Event Services",
        "sent_brief_id": 12,
        "status": "sent",
        "action": "updated"
      }
    ],
    "event_brief_id": 7,
    "event_brief_title": "Corporate Annual Gala",
    "brief_id": "conv_12345_1693747200",
    "status": "pending_responses"
  }
}
```

### Response Fields Explanation

| Field                       | Type    | Description                                             |
| --------------------------- | ------- | ------------------------------------------------------- |
| `success`                   | boolean | Overall operation success status                        |
| `conversation_id`           | string  | The conversation ID that was processed                  |
| `data.message`              | string  | Human-readable success message with counts              |
| `data.total_sent`           | integer | Number of vendors successfully contacted                |
| `data.total_failed`         | integer | Number of vendors that failed to receive the brief      |
| `data.sent_briefs`          | array   | Detailed results for each vendor                        |
| `data.sent_briefs[].action` | string  | Either "created" (new) or "updated" (duplicate handled) |
| `data.event_brief_id`       | integer | ID of the event brief that was sent                     |
| `data.brief_id`             | string  | Unique identifier for this sending operation            |
| `data.status`               | string  | Current status ("pending_responses")                    |

### Error Responses

#### 422 Unprocessable Entity (Validation Error)

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "vendor_ids": ["The vendor ids field is required."],
    "vendor_ids.0": ["The selected vendor ids.0 is invalid."]
  }
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to send brief to vendors: Conversation not found"
}
```

#### Common Error Scenarios

- **Conversation not found**: The provided conversationId doesn't exist
- **No event brief found**: The conversation doesn't have an associated event brief
- **Invalid vendor IDs**: One or more vendor IDs don't exist in the database
- **No vendors found**: The vendor_ids array resolves to no valid vendors

### Backend Process Flow

1. **Validate Request**: Check vendor_ids array and individual vendor existence
2. **Lookup Conversation**: Verify conversation exists
3. **Find Event Brief**: Locate event brief associated with the conversation
4. **Process Vendors**: For each vendor:
   - Check for existing sent_event_briefs record
   - If exists: Update with new data and reset response
   - If new: Create new sent_event_briefs record
5. **Log Operations**: Record success/failure for each vendor
6. **Return Results**: Compile summary with detailed per-vendor results

### Integration Notes

- This endpoint integrates with the `VendorResponseService` class
- Creates or updates records in the `sent_event_briefs` table
- Supports future integration with external vendor backend systems
- All operations are logged for debugging and audit purposes

### Example cURL Request

```bash
curl -X POST http://your-domain.com/api/conversations/conv_12345/send-brief-to-vendors \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "vendor_ids": [1, 2, 3]
  }'
```

### Database Impact

- **Creates/Updates**: `sent_event_briefs` table records
- **References**: Links to `vendors`, `event_briefs`, and `conversations` tables
- **Timestamps**: Tracks `sent_at` and manages `response_received_at`

---

## 2. Get Vendor Responses

### Endpoint

**GET** `/api/conversations/{conversationId}/vendor-responses`

### Purpose

Retrieves all vendor responses for a specific event brief associated with a conversation. This endpoint provides real-time response data with comprehensive statistics and vendor details, including contact information, ratings, and response status.

### URL Parameters

| Parameter        | Type   | Required | Description                                         |
| ---------------- | ------ | -------- | --------------------------------------------------- |
| `conversationId` | string | Yes      | The conversation ID associated with the event brief |

### Request Headers

```
Accept: application/json
```

### Response Data Flow

1. **Conversation Lookup**: Validates the conversation exists
2. **Event Brief Discovery**: Finds the event brief associated with the conversation
3. **Sent Briefs Retrieval**: Gets all vendor briefs sent for this event brief
4. **Data Transformation**: Enriches vendor data with contact info, ratings, and response details
5. **Statistics Calculation**: Computes response rates and vendor counts

### Success Response (200 OK)

```json
{
  "success": true,
  "conversation_id": "conv_12345",
  "data": {
    "success": true,
    "event_brief_id": 7,
    "event_brief_title": "Corporate Annual Gala",
    "conversation_id": "conv_12345",
    "responses": [
      {
        "vendor_id": 1,
        "vendor_name": "Premium Catering Co",
        "category": "catering",
        "response_status": "responded",
        "response_message": "We can provide full catering services for 200 guests at $85 per person",
        "sent_brief_id": 15,
        "status": "responded",
        "sent_at": "2025-09-02T14:30:00.000Z",
        "response_time": "2025-09-02T16:45:30.000Z",
        "contact_info": {
          "phone": "+1-555-0123",
          "email": "contact@premiumcatering.com"
        },
        "vendor_rating": 4.8,
        "brief_data_sent": {
          "title": "Corporate Annual Gala",
          "content": "We need catering for 200 people...",
          "status": "active"
        }
      },
      {
        "vendor_id": 2,
        "vendor_name": "Elite Event Services",
        "category": "event_planning",
        "response_status": "pending",
        "response_message": "No response yet",
        "sent_brief_id": 16,
        "status": "sent",
        "sent_at": "2025-09-02T14:30:00.000Z",
        "response_time": null,
        "contact_info": {
          "phone": "+1-555-0456",
          "email": "info@eliteevents.com"
        },
        "vendor_rating": 4.5,
        "brief_data_sent": {
          "title": "Corporate Annual Gala",
          "content": "We need event planning services...",
          "status": "active"
        }
      }
    ],
    "summary": {
      "total_responses": 2,
      "responded_vendors": 1,
      "pending_vendors": 1,
      "response_rate": 50.0
    }
  }
}
```

### Response Fields Explanation

#### Root Level

| Field             | Type    | Description                             |
| ----------------- | ------- | --------------------------------------- |
| `success`         | boolean | Overall operation success status        |
| `conversation_id` | string  | The conversation ID that was queried    |
| `data`            | object  | Contains all response data and metadata |

#### Data Object

| Field               | Type    | Description                      |
| ------------------- | ------- | -------------------------------- |
| `success`           | boolean | Service operation success status |
| `event_brief_id`    | integer | ID of the event brief            |
| `event_brief_title` | string  | Title/name of the event brief    |
| `conversation_id`   | string  | Associated conversation ID       |
| `responses`         | array   | Array of vendor response objects |
| `summary`           | object  | Statistical summary of responses |

#### Individual Response Object

| Field                | Type         | Description                                              |
| -------------------- | ------------ | -------------------------------------------------------- |
| `vendor_id`          | integer      | Unique vendor identifier                                 |
| `vendor_name`        | string       | Vendor business name                                     |
| `category`           | string       | Vendor service category (catering, event_planning, etc.) |
| `response_status`    | string       | Either "responded" or "pending"                          |
| `response_message`   | string       | Vendor's response text or "No response yet"              |
| `sent_brief_id`      | integer      | ID of the sent_event_briefs record                       |
| `status`             | string       | Database status ("sent", "responded", etc.)              |
| `sent_at`            | string       | ISO timestamp when brief was sent                        |
| `response_time`      | string\|null | ISO timestamp when response was received                 |
| `contact_info`       | object       | Vendor contact details                                   |
| `contact_info.phone` | string\|null | Vendor phone number                                      |
| `contact_info.email` | string\|null | Vendor email address                                     |
| `vendor_rating`      | number       | Vendor rating (0-5 scale)                                |
| `brief_data_sent`    | object       | The actual brief data sent to vendor                     |

#### Summary Statistics

| Field               | Type    | Description                                 |
| ------------------- | ------- | ------------------------------------------- |
| `total_responses`   | integer | Total number of vendors contacted           |
| `responded_vendors` | integer | Number of vendors who have responded        |
| `pending_vendors`   | integer | Number of vendors still pending response    |
| `response_rate`     | number  | Percentage of vendors who responded (0-100) |

### Response Status Logic

- **response_status**: Determined by calling `SentEventBrief.hasResponse()` method
- **response_message**: Shows actual vendor response or "No response yet"
- **status**: Database field showing record status ("sent", "responded", etc.)

### Data Ordering

- Results are ordered by `sent_at` timestamp in descending order (newest first)
- This shows the most recent vendor communications first

### Error Responses

#### 500 Internal Server Error - Conversation Not Found

```json
{
  "success": false,
  "error": "Failed to fetch vendor responses: Conversation not found"
}
```

#### 500 Internal Server Error - No Event Brief

```json
{
  "success": false,
  "error": "Failed to fetch vendor responses: No event brief found for this conversation"
}
```

#### Common Error Scenarios

- **Invalid Conversation ID**: The conversationId doesn't exist in the database
- **No Event Brief**: The conversation exists but has no associated event brief
- **Database Connection Issues**: Temporary database connectivity problems

### Empty Response Handling

If no vendors have been contacted yet, the endpoint returns:

```json
{
  "success": true,
  "conversation_id": "conv_12345",
  "data": {
    "success": true,
    "event_brief_id": 7,
    "event_brief_title": "Corporate Annual Gala",
    "conversation_id": "conv_12345",
    "responses": [],
    "summary": {
      "total_responses": 0,
      "responded_vendors": 0,
      "pending_vendors": 0,
      "response_rate": 0
    }
  }
}
```

### Database Relationships

This endpoint leverages the following relationships:

- `SentEventBrief` → `Vendor` (eager loaded with `with('vendor')`)
- `EventBrief` → `Conversation`
- Queries are optimized with proper indexing on foreign keys

### Real-time Considerations

- Data is fetched in real-time from the database
- No caching layer - always returns current state
- Response times are optimized through eager loading and indexed queries

### Integration Notes

- Used by frontend dashboards to show vendor response status
- Supports polling for real-time updates
- Contains all data needed for vendor communication tracking
- Brief data includes the exact information sent to each vendor

### Example cURL Request

```bash
curl -X GET http://your-domain.com/api/conversations/conv_12345/vendor-responses \
  -H "Accept: application/json"
```

### Use Cases

1. **Dashboard Display**: Show vendor response status on event management dashboards
2. **Progress Tracking**: Monitor how many vendors have responded to event briefs
3. **Vendor Management**: Access vendor contact information and ratings
4. **Response Analysis**: Calculate response rates and vendor performance metrics
5. **Follow-up Actions**: Identify vendors who haven't responded for follow-up communications

---

## 3. Search Vendors by Name

### Endpoint

**GET** `/api/vendors/search`

### Purpose

Searches for vendors by name using partial or exact matching. This endpoint enables vendor discovery and selection for event brief distribution.

### Query Parameters

| Parameter | Type    | Required | Description                                                             |
| --------- | ------- | -------- | ----------------------------------------------------------------------- |
| `name`    | string  | **Yes**  | Search term for vendor name (1-255 characters)                          |
| `exact`   | boolean | No       | Whether to perform exact matching (default: false for partial matching) |

### Request Headers

```
Accept: application/json
```

### Search Logic

- **Partial Matching** (default): Uses `LIKE %search%` to find vendors containing the search term
- **Exact Matching** (`exact=true`): Performs case-insensitive exact name matching
- **Results Ordering**: Orders by vendor rating in descending order (highest rated first)

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Catering Co",
      "category": "catering",
      "rating": 4.8,
      "contact": {
        "phone": "+1-555-0123",
        "email": "contact@premiumcatering.com"
      },
      "address": "123 Main St, City, State 12345",
      "description": "Full-service catering for events of all sizes",
      "created_at": "2025-08-15T10:30:00.000Z",
      "updated_at": "2025-09-01T14:20:00.000Z"
    },
    {
      "id": 5,
      "name": "Elite Catering Services",
      "category": "catering",
      "rating": 4.5,
      "contact": {
        "phone": "+1-555-0789",
        "email": "info@elitecatering.com"
      },
      "address": "456 Oak Ave, City, State 12345",
      "description": "Luxury catering and event management",
      "created_at": "2025-07-20T08:15:00.000Z",
      "updated_at": "2025-08-28T16:45:00.000Z"
    }
  ],
  "search_term": "catering",
  "exact_match": false,
  "total_found": 2
}
```

### Empty Results Response (200 OK)

```json
{
  "success": true,
  "message": "No vendors found with that name",
  "data": [],
  "search_term": "nonexistent",
  "exact_match": false,
  "total_found": 0
}
```

### Response Fields Explanation

| Field         | Type    | Description                                   |
| ------------- | ------- | --------------------------------------------- |
| `success`     | boolean | Operation success status                      |
| `data`        | array   | Array of matching vendor objects              |
| `search_term` | string  | The search term that was used                 |
| `exact_match` | boolean | Whether exact matching was performed          |
| `total_found` | integer | Number of vendors found                       |
| `message`     | string  | Human-readable message (only when no results) |

### Error Responses

#### 422 Unprocessable Entity (Validation Error)

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to search vendors: Database connection error"
}
```

### Example Requests

```bash
# Partial search for catering vendors
curl -X GET "http://your-domain.com/api/vendors/search?name=catering" \
  -H "Accept: application/json"

# Exact match search
curl -X GET "http://your-domain.com/api/vendors/search?name=Premium%20Catering%20Co&exact=true" \
  -H "Accept: application/json"
```

### Use Cases

1. **Vendor Discovery**: Find vendors by service type or business name
2. **Auto-complete**: Power search suggestions in frontend interfaces
3. **Vendor Selection**: Enable users to search and select specific vendors for event briefs
4. **Category Filtering**: Find all vendors in a specific category

---

## 4. Get Event Briefs Sent to Vendor

### Endpoint

**GET** `/api/vendors/{vendorId}/sent-briefs`

### Purpose

Retrieves all event briefs that have been sent to a specific vendor, including full brief details, response status, and historical data. This provides a complete vendor communication history.

### URL Parameters

| Parameter  | Type    | Required | Description                            |
| ---------- | ------- | -------- | -------------------------------------- |
| `vendorId` | integer | Yes      | The vendor ID to fetch sent briefs for |

### Request Headers

```
Accept: application/json
```

### Success Response (200 OK)

```json
{
  "success": true,
  "vendor_id": 1,
  "vendor_name": "Premium Catering Co",
  "vendor_category": "catering",
  "total_briefs_received": 3,
  "data": [
    {
      "sent_brief_id": 25,
      "chat_id": "conv_67890",
      "status": "responded",
      "response": "We can provide full catering for 150 guests at $75 per person",
      "sent_at": "2025-09-02T10:00:00.000Z",
      "response_received_at": "2025-09-02T14:30:00.000Z",
      "has_response": true,
      "event_brief": {
        "id": 12,
        "title": "Company Quarterly Meeting",
        "brief_content": "Need catering for quarterly meeting with 150 attendees...",
        "status": "active",
        "conversation_id": "conv_67890",
        "last_updated": "2025-09-02T09:45:00.000Z",
        "created_at": "2025-09-02T09:30:00.000Z"
      },
      "brief_data_sent": {
        "title": "Company Quarterly Meeting",
        "content": "Need catering for quarterly meeting with 150 attendees...",
        "status": "active"
      }
    },
    {
      "sent_brief_id": 18,
      "chat_id": "conv_12345",
      "status": "sent",
      "response": null,
      "sent_at": "2025-09-01T16:20:00.000Z",
      "response_received_at": null,
      "has_response": false,
      "event_brief": {
        "id": 7,
        "title": "Corporate Annual Gala",
        "brief_content": "Planning annual corporate gala for 200 guests...",
        "status": "active",
        "conversation_id": "conv_12345",
        "last_updated": "2025-09-01T16:15:00.000Z",
        "created_at": "2025-09-01T15:30:00.000Z"
      },
      "brief_data_sent": {
        "title": "Corporate Annual Gala",
        "content": "Planning annual corporate gala for 200 guests...",
        "status": "active"
      }
    }
  ]
}
```

### Response Fields Explanation

#### Root Level

| Field                   | Type    | Description                                |
| ----------------------- | ------- | ------------------------------------------ |
| `success`               | boolean | Operation success status                   |
| `vendor_id`             | integer | The vendor ID that was queried             |
| `vendor_name`           | string  | Name of the vendor                         |
| `vendor_category`       | string  | Vendor's service category                  |
| `total_briefs_received` | integer | Total number of briefs sent to this vendor |
| `data`                  | array   | Array of sent brief objects                |

#### Sent Brief Object

| Field                  | Type         | Description                                     |
| ---------------------- | ------------ | ----------------------------------------------- |
| `sent_brief_id`        | integer      | Unique ID of the sent_event_briefs record       |
| `chat_id`              | string       | Conversation ID where the brief originated      |
| `status`               | string       | Current status ("sent", "responded", etc.)      |
| `response`             | string\|null | Vendor's response message (null if no response) |
| `sent_at`              | string       | ISO timestamp when brief was sent               |
| `response_received_at` | string\|null | ISO timestamp when response was received        |
| `has_response`         | boolean      | Whether vendor has responded                    |
| `event_brief`          | object\|null | Full event brief details                        |
| `brief_data_sent`      | object       | Snapshot of brief data sent to vendor           |

#### Event Brief Object

| Field             | Type    | Description                    |
| ----------------- | ------- | ------------------------------ |
| `id`              | integer | Event brief ID                 |
| `title`           | string  | Brief title                    |
| `brief_content`   | string  | Full brief content/description |
| `status`          | string  | Brief status                   |
| `conversation_id` | string  | Associated conversation ID     |
| `last_updated`    | string  | ISO timestamp of last update   |
| `created_at`      | string  | ISO timestamp of creation      |

### Data Ordering

- Results are ordered by `sent_at` timestamp in descending order (newest first)
- Shows the most recent communications with the vendor first

### Error Responses

#### 404 Not Found (Vendor Not Found)

```json
{
  "success": false,
  "error": "Vendor not found"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch sent briefs for vendor: Database connection error"
}
```

### Empty Results

If no briefs have been sent to the vendor:

```json
{
  "success": true,
  "vendor_id": 1,
  "vendor_name": "Premium Catering Co",
  "vendor_category": "catering",
  "total_briefs_received": 0,
  "data": []
}
```

### Example cURL Request

```bash
curl -X GET http://your-domain.com/api/vendors/1/sent-briefs \
  -H "Accept: application/json"
```

### Use Cases

1. **Vendor Portal**: Show vendors all briefs they've received
2. **Communication History**: Track all interactions with a specific vendor
3. **Response Analysis**: Analyze vendor response patterns and timing
4. **Account Management**: Manage vendor relationships and communication history

---

## 5. Submit Vendor Response

### Endpoint

**POST** `/api/vendors/{vendorId}/event-briefs/{eventBriefId}/respond`

### Purpose

Allows vendors to submit responses to event briefs they've received. This endpoint updates the response status and timestamps in the sent_event_briefs table.

### URL Parameters

| Parameter      | Type    | Required | Description                           |
| -------------- | ------- | -------- | ------------------------------------- |
| `vendorId`     | integer | Yes      | The vendor ID submitting the response |
| `eventBriefId` | integer | Yes      | The event brief ID being responded to |

### Request Body

```json
{
  "response": "We can provide full catering services for 200 guests at $85 per person. Our menu includes appetizers, main course, desserts, and beverages. Available dates: Sept 15-30, 2025."
}
```

### Request Body Parameters

| Parameter  | Type   | Required | Description                                     |
| ---------- | ------ | -------- | ----------------------------------------------- |
| `response` | string | **Yes**  | Vendor's response message (max 5000 characters) |

### Request Headers

```
Content-Type: application/json
Accept: application/json
```

### Validation Rules

- `response` field is required and must be a string
- Maximum length of 5000 characters
- Vendor and event brief combination must exist in sent_event_briefs table
- Cannot submit duplicate responses (prevents overwriting existing responses)

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Response submitted successfully",
  "data": {
    "sent_brief_id": 15,
    "vendor_id": 1,
    "vendor_name": "Premium Catering Co",
    "event_brief_id": 7,
    "event_brief_title": "Corporate Annual Gala",
    "chat_id": "conv_12345",
    "response": "We can provide full catering services for 200 guests at $85 per person. Our menu includes appetizers, main course, desserts, and beverages. Available dates: Sept 15-30, 2025.",
    "status": "responded",
    "sent_at": "2025-09-02T14:30:00.000Z",
    "response_received_at": "2025-09-02T16:45:30.000Z"
  }
}
```

### Response Fields Explanation

| Field                       | Type    | Description                                  |
| --------------------------- | ------- | -------------------------------------------- |
| `success`                   | boolean | Operation success status                     |
| `message`                   | string  | Human-readable success message               |
| `data`                      | object  | Updated sent brief data                      |
| `data.sent_brief_id`        | integer | ID of the sent_event_briefs record           |
| `data.vendor_id`            | integer | Vendor ID that submitted response            |
| `data.vendor_name`          | string  | Vendor business name                         |
| `data.event_brief_id`       | integer | Event brief ID responded to                  |
| `data.event_brief_title`    | string  | Title of the event brief                     |
| `data.chat_id`              | string  | Conversation ID                              |
| `data.response`             | string  | The submitted response text                  |
| `data.status`               | string  | Updated status ("responded")                 |
| `data.sent_at`              | string  | ISO timestamp when brief was originally sent |
| `data.response_received_at` | string  | ISO timestamp when response was submitted    |

### Backend Process

1. **Validation**: Validates request data and parameters
2. **Record Lookup**: Finds sent_event_briefs record for vendor/brief combination
3. **Duplicate Check**: Ensures no response has already been submitted
4. **Update Record**: Uses `markAsResponded()` method to update status and timestamps
5. **Return Data**: Returns updated record with full details

### Error Responses

#### 422 Unprocessable Entity (Validation Error)

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "response": ["The response field is required."]
  }
}
```

#### 404 Not Found (No Sent Brief Found)

```json
{
  "success": false,
  "error": "No event brief found sent to this vendor"
}
```

#### 409 Conflict (Duplicate Response)

```json
{
  "success": false,
  "error": "Response has already been submitted for this event brief",
  "existing_response": "We can provide catering services for $80 per person",
  "response_submitted_at": "2025-09-01T15:30:00.000Z"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to submit response: Database connection error"
}
```

### Database Updates

When a response is submitted, the system:

1. **Updates Response Field**: Sets the response text
2. **Changes Status**: Updates status to "responded"
3. **Sets Timestamp**: Records response_received_at with current timestamp
4. **Maintains History**: Preserves original sent_at timestamp

### Example cURL Request

```bash
curl -X POST http://your-domain.com/api/vendors/1/event-briefs/7/respond \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "response": "We can provide full catering services for 200 guests at $85 per person. Menu includes appetizers, main course, desserts, and beverages."
  }'
```

### Integration Notes

- Uses the `SentEventBrief.markAsResponded()` method for consistent updates
- Eager loads vendor and event brief relationships for complete response data
- Prevents duplicate responses to maintain data integrity
- All operations are logged for audit purposes

### Use Cases

1. **Vendor Portal**: Enable vendors to respond to received event briefs
2. **Response Collection**: Centralize vendor responses for event planning
3. **Status Tracking**: Update brief status when vendors respond
4. **Communication Workflow**: Complete the vendor communication cycle

---

_This completes the vendor brief management endpoint documentation. The system now provides comprehensive APIs for the entire vendor communication workflow from brief distribution through response collection._
