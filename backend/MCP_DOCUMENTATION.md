# MCP Server Documentation

## Overview

The Avalanche Platform MCP (Model Context Protocol) Server enables AI assistants to interact with the Avalanche platform through a standardized protocol. **This server is restricted to Business tier users only**, providing premium access to platform management tools for enterprise users.

## Access Requirements

**🔒 Business Tier Only**: Only users with `ai_tier = "business"` can access MCP features. Free and Pro tier users will receive a 403 Forbidden response with the message: "Access restricted to Business tier users only. Please upgrade your plan to access MCP features."

## Features

### ✅ Implemented Features

- **Multi-method Authentication**: JWT Bearer tokens and API key authentication
- **Rate Limiting**: Configurable request limits with burst protection
- **Input Sanitization**: HTML cleaning and SQL injection prevention
- **Tool Registry**: Decorator-based tool registration with permission management
- **Parameter Validation**: Pydantic-based validation with type conversion
- **Security Headers**: XSS protection, CSRF prevention, content type validation
- **OpenAI Integration**: Direct integration with OpenAI Assistants API
- **Comprehensive Tool Set**: 20+ tools covering products, users, guilds, projects, and escrow
- **Error Handling**: Structured error responses with logging
- **Request Size Limits**: DoS protection with configurable limits

### 🔧 Core Tools Available

#### Products Tools
- `search_products` - Search products with filters
- `get_product_details` - Get detailed product information
- `create_product` - Create new product listings (authenticated)
- `update_product` - Update existing products (ownership required)

#### Users Tools
- `search_users` - Search users by name/email
- `get_user_profile` - Get user profile details
- `update_user_profile` - Update user profile (authenticated)

#### Guilds Tools
- `search_guilds` - Search guilds with filters
- `get_guild_details` - Get detailed guild information
- `join_guild` - Join a guild (authenticated)
- `create_guild` - Create new guild (authenticated)

#### Projects Tools
- `search_projects` - Search projects with filters
- `get_project_details` - Get project information
- `create_project` - Create new project (authenticated)
- `apply_to_project` - Apply to work on project (authenticated)

#### Escrow Tools
- `get_escrow_status` - Get escrow transaction status
- `release_escrow` - Release funds to seller (buyer approval)
- `dispute_escrow` - Raise dispute on escrow
- `get_project_escrow_status` - Get project escrow status
- `fund_project_escrow` - Fund project escrow (owner only)
- `release_project_payment` - Release payment to freelancer (owner only)
- `submit_project_work` - Submit work for approval (freelancer only)
- `approve_project_work` - Approve submitted work (owner only)

## Authentication

### JWT Bearer Token Authentication
```http
Authorization: Bearer <jwt_token>
```

### API Key Authentication
```http
X-API-Key: <api_key>
X-API-Secret: <api_secret>
X-Signature: <hmac_signature>
X-Timestamp: <unix_timestamp>
```

## API Endpoints

### Core MCP Endpoints

#### GET `/mcp/`
Health check and server information
```json
{
  "message": "Avalanche MCP Server is running",
  "version": "1.0.0",
  "protocol": "MCP",
  "tools_available": 20
}
```

#### GET `/mcp/tools`
List all available tools
```json
{
  "tools": [
    {
      "name": "search_products",
      "description": "Search for products with optional filters",
      "input_schema": {
        "type": "object",
        "properties": {
          "search": {"type": "string"},
          "category": {"type": "string"},
          "min_price": {"type": "number"},
          "max_price": {"type": "number"},
          "limit": {"type": "integer", "default": 10}
        }
      }
    }
  ]
}
```

#### POST `/mcp/tools/{tool_name}/call`
Execute a specific tool
```json
// Request
{
  "parameters": {
    "search": "laptop",
    "min_price": 500,
    "limit": 5
  }
}

// Response
{
  "tool_name": "search_products",
  "result": {
    "products": [...],
    "count": 5
  },
  "success": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### POST `/mcp/chat/completions`
MCP-compatible chat completions endpoint

### OpenAI Integration Endpoints

#### POST `/mcp/openai/chat`
Chat with OpenAI Assistant that has MCP tools
```json
// Request
{
  "message": "Find me laptops under $1000",
  "thread_id": "optional_thread_id"
}

// Response
{
  "response": "I found several laptops under $1000. Here are the top results...",
  "thread_id": "thread_123",
  "status": "completed",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### GET `/mcp/openai/tools`
Get tools available to OpenAI Assistant

#### POST `/mcp/openai/assistant/create`
Create a new OpenAI Assistant with MCP tools

## Security Features

### Input Validation
- HTML tag stripping using bleach
- SQL injection pattern detection
- String length limits (10,000 characters max)
- List size limits (100 items max)
- Type validation and conversion

### Rate Limiting
- 60 requests per minute per user
- 1000 requests per hour per user
- 10 requests per burst (10-second window)
- Automatic cleanup of old request records

### Authentication Security
- JWT token validation
- HMAC signature verification for API keys
- Timestamp validation (5-minute window)
- Secure API key generation

### Request Security
- Request size limits (1MB max)
- Security headers (XSS, CSRF, content-type protection)
- Request sanitization middleware

## Usage Examples

### Search Products
```python
import requests

response = requests.post(
    "http://localhost:8000/mcp/tools/search_products/call",
    json={
        "parameters": {
            "search": "wireless headphones",
            "max_price": 200,
            "limit": 10
        }
    },
    headers={
        "Authorization": "Bearer your_jwt_token"
    }
)

results = response.json()
print(f"Found {results['result']['count']} products")
```

### Create Product
```python
response = requests.post(
    "http://localhost:8000/mcp/tools/create_product/call",
    json={
        "parameters": {
            "name": "Wireless Gaming Mouse",
            "description": "High-precision wireless gaming mouse",
            "price": 79.99,
            "category": "Electronics"
        }
    },
    headers={
        "Authorization": "Bearer your_jwt_token"
    }
)
```

### Escrow Operations
```python
# Check escrow status
response = requests.post(
    "http://localhost:8000/mcp/tools/get_escrow_status/call",
    json={
        "parameters": {
            "order_id": 12345
        }
    },
    headers={
        "Authorization": "Bearer your_jwt_token"
    }
)

# Release escrow funds
response = requests.post(
    "http://localhost:8000/mcp/tools/release_escrow/call",
    json={
        "parameters": {
            "order_id": 12345
        }
    },
    headers={
        "Authorization": "Bearer your_jwt_token"
    }
)
```

## OpenAI Integration

### Setting up OpenAI Assistant
```python
from backend.mcp_openai_integration import create_avalanche_assistant

# Create assistant with MCP tools
assistant_id = await create_avalanche_assistant()
print(f"Created assistant: {assistant_id}")
```

### Chat with MCP-enabled Assistant
```python
from backend.mcp_openai_integration import chat_with_avalanche_assistant

# Start conversation
result = await chat_with_avalanche_assistant(
    "Help me find web development projects under $5000"
)

print(result["response"])
thread_id = result["thread_id"]

# Continue conversation
result2 = await chat_with_avalanche_assistant(
    "Can you create a project for a React dashboard?",
    thread_id=thread_id
)
```

## Configuration

### Environment Variables
```bash
# OpenAI Integration
OPENAI_API_KEY=your_openai_api_key

# MCP Server
MCP_SERVER_URL=http://localhost:8000
MCP_API_KEY=your_api_key
MCP_API_SECRET=your_api_secret

# Security
MAX_REQUEST_SIZE=1048576  # 1MB
MAX_STRING_LENGTH=10000
MAX_LIST_LENGTH=100
```

### Security Configuration
```python
from backend.mcp_server import SECURITY_CONFIG

# Customize security settings
SECURITY_CONFIG.update({
    "max_request_size": 2 * 1024 * 1024,  # 2MB
    "max_string_length": 50000,  # 50k characters
    "sql_injection_patterns": [
        # Add custom patterns
        r';\s*--', r';\s*/\*', r'union\s+select'
    ]
})
```

## Testing

### Running Tests
```bash
cd backend
python -m pytest tests/test_mcp_server.py -v
```

### Test Coverage
- Security validation functions
- Tool parameter validation
- API endpoint responses
- Authentication flows
- Rate limiting
- Input sanitization

## Deployment

### Production Checklist
- [ ] Set secure environment variables
- [ ] Configure rate limiting based on load
- [ ] Set up monitoring and logging
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up API key management
- [ ] Implement proper database for API keys
- [ ] Configure Redis for rate limiting (production)
- [ ] Set up health checks
- [ ] Configure backup and recovery

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Monitoring

### Health Checks
- GET `/mcp/` - Server health and tool count
- Tool execution logging
- Rate limit monitoring
- Error rate tracking

### Metrics to Monitor
- Request rate per endpoint
- Tool execution success/failure rates
- Authentication failure rates
- Rate limit hits
- Response times

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check JWT token validity
   - Verify API key credentials
   - Ensure timestamp is within 5-minute window

2. **Rate Limit Exceeded**
   - Wait for rate limit reset
   - Implement exponential backoff
   - Consider upgrading rate limits

3. **Tool Execution Failed**
   - Check tool parameters against schema
   - Verify user permissions
   - Check database connectivity

4. **OpenAI Integration Issues**
   - Verify OPENAI_API_KEY is set
   - Check API quota and billing
   - Ensure assistant has proper tools configured

## Contributing

### Adding New Tools
1. Define tool function with proper typing
2. Add to tool registry with permissions
3. Update parameter validation schema
4. Add unit tests
5. Update documentation

### Security Considerations
- Always validate input parameters
- Use parameterized queries for database operations
- Implement proper error handling
- Log security events
- Regular security audits

## License

This MCP server implementation is part of the Avalanche Platform.
