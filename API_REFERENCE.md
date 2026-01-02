# API Reference

Complete API documentation for the Qwik + Payload CMS application.

---

## GraphQL API

### Base URL
```
POST http://localhost:3001/graphql
```

### Authentication
Include access token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Queries

### Get All Products

Fetch all products with variants, images, and metadata.

**Request**:
```graphql
query GetProducts {
  Products {
    docs {
      id
      title
      description
      basePrice
      image {
        url
        alt
      }
      variants {
        sku
        name
        color
        size
        price
        stock
        isAvailable
      }
      category
      tags {
        tag
      }
      featured
      createdAt
      updatedAt
    }
    totalDocs
    totalPages
    hasNextPage
    hasPrevPage
  }
}
```

**Response**:
```json
{
  "data": {
    "Products": {
      "docs": [
        {
          "id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "title": "Sample Product",
          "description": "A great product",
          "basePrice": 29.99,
          "image": {
            "url": "https://example.com/image.jpg",
            "alt": "Product Image"
          },
          "variants": [
            {
              "sku": "PROD-SKU-001",
              "name": "Red Small",
              "color": "Red",
              "size": "S",
              "price": 29.99,
              "stock": 10,
              "isAvailable": true
            }
          ],
          "category": "Electronics",
          "tags": [
            { "tag": "popular" },
            { "tag": "new" }
          ],
          "featured": true,
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "totalDocs": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### Get Product by ID

Fetch a single product with full details.

**Request**:
```graphql
query GetProduct($id: String!) {
  Products(where: { id: { equals: $id } }) {
    docs {
      id
      title
      description
      basePrice
      image {
        url
        alt
      }
      variants {
        sku
        name
        color
        size
        price
        stock
        isAvailable
      }
      category
      tags {
        tag
      }
      featured
      createdAt
      updatedAt
    }
  }
}
```

**Variables**:
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response**:
```json
{
  "data": {
    "Products": {
      "docs": [
        {
          "id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "title": "Sample Product",
          "description": "A great product",
          "basePrice": 29.99,
          "variants": [
            {
              "sku": "PROD-SKU-001",
              "name": "Red Small",
              "color": "Red",
              "size": "S",
              "price": 29.99,
              "stock": 10,
              "isAvailable": true
            },
            {
              "sku": "PROD-SKU-002",
              "name": "Blue Medium",
              "color": "Blue",
              "size": "M",
              "price": 34.99,
              "stock": 5,
              "isAvailable": true
            }
          ]
        }
      ]
    }
  }
}
```

---

### Get Featured Products

Fetch only featured products (for homepage showcase).

**Request**:
```graphql
query GetFeaturedProducts {
  Products(where: { featured: { equals: true } }, limit: 6) {
    docs {
      id
      title
      description
      basePrice
      image {
        url
        alt
      }
      variants {
        sku
        name
        price
        stock
      }
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "Products": {
      "docs": [
        {
          "id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "title": "Featured Product",
          "description": "This is featured",
          "basePrice": 49.99,
          "image": {
            "url": "https://example.com/image.jpg",
            "alt": "Product"
          },
          "variants": [
            {
              "sku": "FEATURED-001",
              "name": "Default",
              "price": 49.99,
              "stock": 20
            }
          ]
        }
      ]
    }
  }
}
```

---

## REST API

### Authentication Endpoints

#### Initiate Zitadel Login

Generates authorization URL to redirect user to Zitadel login page.

**Endpoint**:
```
GET /api/auth/zitadel-login
```

**Headers**:
```
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "authUrl": "https://zitadel.example.com/oauth/v2/authorize?client_id=...&redirect_uri=...&scope=openid+profile+email&state=...",
  "state": "random-state-string-for-csrf-protection"
}
```

**Usage in Frontend**:
```typescript
const response = await fetch('/api/auth/zitadel-login');
const data = await response.json();
window.location.href = data.authUrl;
```

---

#### Handle OAuth Callback

Exchanges authorization code for tokens and user info.

**Endpoint**:
```
POST /api/auth/zitadel-callback
```

**Headers**:
```
Content-Type: application/json
Authorization: (optional)
```

**Request Body**:
```json
{
  "code": "authorization-code-from-zitadel",
  "state": "state-from-zitadel"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-value",
  "userInfo": {
    "sub": "zitadel-user-id",
    "email": "user@example.com",
    "email_verified": true,
    "name": "John Doe",
    "picture": "https://example.com/avatar.jpg"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Authentication failed"
}
```

**Usage in Frontend**:
```typescript
const code = new URLSearchParams(location.search).get('code');
const response = await fetch('/api/auth/zitadel-callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, state })
});
const data = await response.json();
localStorage.setItem('access_token', data.accessToken);
```

---

#### Refresh Access Token

Refresh an expired access token using refresh token.

**Endpoint**:
```
POST /api/auth/refresh
```

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refreshToken": "refresh-token-value"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token",
  "expiresIn": 3600
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Refresh token expired or invalid"
}
```

---

#### Logout

Clears user session.

**Endpoint**:
```
POST /api/auth/logout
```

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Usage in Frontend**:
```typescript
await fetch('/api/auth/logout', { method: 'POST' });
localStorage.removeItem('access_token');
window.location.href = '/';
```

---

## REST API (Payload Auto-Generated)

Payload automatically generates REST endpoints for all collections.

### Products Endpoints

#### List All Products
```
GET /api/products
GET /api/products?page=1&limit=10&sort=-createdAt
```

**Response**:
```json
{
  "docs": [...],
  "totalDocs": 25,
  "totalPages": 3,
  "page": 1,
  "pagingCounter": 1,
  "hasNextPage": true,
  "hasPrevPage": false,
  "nextPage": 2,
  "prevPage": null
}
```

---

#### Get Single Product
```
GET /api/products/:id
```

**Response**:
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "Sample Product",
  "description": "A great product",
  "basePrice": 29.99,
  "variants": [...],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### Create Product (Admin Only)
```
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "New Product",
  "description": "Product description",
  "basePrice": 49.99,
  "category": "Electronics",
  "variants": [
    {
      "sku": "NEW-001",
      "name": "Default",
      "price": 49.99,
      "stock": 10,
      "isAvailable": true
    }
  ]
}
```

---

#### Update Product (Admin Only)
```
PATCH /api/products/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Updated Title",
  "basePrice": 59.99
}
```

---

#### Delete Product (Admin Only)
```
DELETE /api/products/:id
Authorization: Bearer <admin-token>
```

---

## Matrix Chat API

### Client Library Integration

The frontend uses `matrix-js-sdk` which provides methods for Matrix API operations.

### Initialize Chat Client

```typescript
import { getMatrixClient } from '~/lib/matrix-client';

const client = getMatrixClient();
await client.init(userId, accessToken);
```

---

### Get Joined Rooms

```typescript
const rooms = await client.getRooms();
// Returns: MatrixRoom[]
```

**Response Example**:
```typescript
[
  {
    id: "!room1:matrix.example.com",
    name: "General Chat",
    topic: "General discussion room"
  },
  {
    id: "!room2:matrix.example.com",
    name: "Support",
    topic: "Customer support"
  }
]
```

---

### Join or Create Room

```typescript
const roomId = await client.joinOrCreateRoom('general');
// Returns: room ID
```

---

### Load Message History

```typescript
const messages = await client.loadMessages(limit = 20);
// Returns: MatrixMessage[]
```

**Response Example**:
```typescript
[
  {
    id: "$event1",
    content: {
      body: "Hello everyone!",
      msgtype: "m.text"
    },
    sender: "@user1:matrix.example.com",
    timestamp: 1705334400000,
    type: "m.room.message"
  },
  {
    id: "$event2",
    content: {
      body: "Hi there!",
      msgtype: "m.text"
    },
    sender: "@user2:matrix.example.com",
    timestamp: 1705334460000,
    type: "m.room.message"
  }
]
```

---

### Send Message

```typescript
await client.sendMessage('Hello, world!');
```

---

### Subscribe to Message Updates

```typescript
client.onMessagesUpdate((messages) => {
  console.log('Messages updated:', messages);
});
```

---

### Leave Room

```typescript
await client.leaveRoom();
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Meaning | Solution |
|--------|---------|----------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Login required or token expired |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Contact support |

### Error Response Format

```json
{
  "error": "Error message",
  "message": "More detailed explanation",
  "extensions": {
    "code": "ERROR_CODE"
  }
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, implement:

- Max 100 requests per minute per IP for authentication
- Max 1000 requests per hour per user for GraphQL
- Max 500 requests per hour per user for file uploads

---

## CORS Configuration

Frontend can make requests to backend if CORS is properly configured.

**Allowed Origins**:
```
http://localhost:5173
http://localhost:5174
https://yourdomain.com
```

**Allowed Methods**:
```
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

**Allowed Headers**:
```
Content-Type
Authorization
```

---

## Pagination

### GraphQL Pagination

```graphql
query {
  Products(
    page: 1
    limit: 10
    sort: "-createdAt"
  ) {
    docs { ... }
    totalDocs
    totalPages
    hasNextPage
    hasPrevPage
  }
}
```

### REST Pagination

```
GET /api/products?page=1&limit=10&sort=-createdAt
```

---

## Sorting

### Available Sort Fields

- `title`: Product title
- `basePrice`: Base price (ascending: low to high, descending: high to low)
- `createdAt`: Creation date
- `featured`: Featured status

### Sort Examples

```graphql
# Ascending
sort: "basePrice"

# Descending
sort: "-basePrice"
```

```
GET /api/products?sort=-basePrice
```

---

## Filtering

### GraphQL Filtering

```graphql
query {
  Products(
    where: {
      featured: { equals: true }
      category: { equals: "Electronics" }
      basePrice: { less_than: 100 }
    }
  ) {
    docs { ... }
  }
}
```

---

## Response Caching

### GraphQL Cache Headers

```
Cache-Control: public, max-age=300
```

Frontend should cache GraphQL responses locally for 5 minutes.

---

## Webhooks (Future Feature)

Currently not implemented. Can be added for:
- Product updates
- Order changes
- User registration
- Chat mentions

---

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
// Import utilities
import { graphqlClient, getProducts } from '~/lib/graphql-client';
import { authService } from '~/lib/auth';
import { getMatrixClient } from '~/lib/matrix-client';

// Get products
const products = await getProducts(authService.getAccessToken());

// Get single product
const product = await getProductById('product-id');

// Initialize chat
const matrixClient = getMatrixClient();
await matrixClient.init(userId, accessToken);
const messages = await matrixClient.loadMessages(20);
```

---

## Testing API with cURL

### Get Products
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { Products { docs { id title basePrice } } }"
  }'
```

### Login
```bash
curl -X GET http://localhost:3001/api/auth/zitadel-login
```

### Send Message via Matrix
```bash
curl -X POST https://matrix.example.com/_matrix/client/r0/rooms/!room:example.com/send/m.room.message \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "msgtype": "m.text",
    "body": "Hello!"
  }'
```

---

## API Versioning

Current API version: **v1**

Future versions may be released at:
- `/graphql` (GraphQL - no versioning needed)
- `/api/v2/*` (REST - with version prefix)

---

## Support

For API issues:
1. Check error messages in response body
2. Verify environment variables are set correctly
3. Check browser console for client-side errors
4. Check server logs for backend errors
5. Review SETUP_GUIDE.md for configuration help
