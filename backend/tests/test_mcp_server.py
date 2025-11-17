"""
Unit tests for MCP Server
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import json

from main import app
from database import get_db, init_db
from mcp_server import tool_registry, sanitize_input, validate_request_size
from fastapi import Request
from unittest.mock import Mock

client = TestClient(app)

class TestMCPSecurity:
    """Test MCP server security features"""

    def test_sanitize_input_string(self):
        """Test input sanitization"""
        # Test HTML sanitization
        malicious_input = "<script>alert('xss')</script>Hello"
        sanitized = sanitize_input(malicious_input)
        assert "<script>" not in sanitized
        assert "Hello" in sanitized

    def test_sanitize_input_dict(self):
        """Test dictionary input sanitization"""
        input_data = {
            "name": "<b>Bold</b> Name",
            "description": "Normal description",
            "nested": {
                "value": "<script>evil()</script>"
            }
        }
        sanitized = sanitize_input(input_data)
        assert "<b>" not in sanitized["name"]
        assert "<script>" not in sanitized["nested"]["value"]

    def test_sanitize_input_list(self):
        """Test list input sanitization"""
        input_data = ["<b>Item 1</b>", "Item 2", "<script>evil</script>"]
        sanitized = sanitize_input(input_data)
        assert "<b>" not in sanitized[0]
        assert "<script>" not in sanitized[2]

class TestMCPTools:
    """Test MCP tool functionality"""

    def test_tool_registry_initialization(self):
        """Test that tools are properly registered"""
        assert len(tool_registry.tools) > 0
        assert "search_products" in tool_registry.tools
        assert "get_escrow_status" in tool_registry.tools

    def test_tool_parameter_validation(self):
        """Test tool parameter validation"""
        # Test valid parameters
        valid_params = {"product_id": 123}
        validated = tool_registry.validate_tool_params("get_product_details", valid_params)
        assert validated["product_id"] == 123

        # Test missing required parameters
        with pytest.raises(Exception):  # Should raise ValidationError
            tool_registry.validate_tool_params("get_product_details", {})

        # Test type conversion
        params_with_string = {"product_id": "456"}
        validated = tool_registry.validate_tool_params("get_product_details", params_with_string)
        assert validated["product_id"] == 456  # Should be converted to int

    def test_tool_permissions(self):
        """Test tool permission checking"""
        # Public tools should have 'read' permission
        assert tool_registry.get_required_permission("search_products") == "read"

        # Authenticated tools should have 'write' permission
        assert tool_registry.get_required_permission("create_product") == "write"

class TestMCPAPI:
    """Test MCP API endpoints"""

    def test_mcp_root_endpoint_business_only(self):
        """Test MCP root endpoint requires business tier"""
        response = client.get("/mcp/")
        assert response.status_code == 401  # No auth provided

    def test_mcp_business_user_access(self, business_user_token):
        """Test business user can access MCP endpoints"""
        response = client.get("/mcp/", headers={"Authorization": f"Bearer {business_user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "user_tier" in data
        assert data["user_tier"] == "business"
        assert data["access_level"] == "business"

    def test_list_tools_endpoint_business_only(self, business_user_token):
        """Test tools listing endpoint requires business tier"""
        response = client.get("/mcp/tools", headers={"Authorization": f"Bearer {business_user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "tools" in data
        assert isinstance(data["tools"], list)
        assert len(data["tools"]) > 0

        # Check tool structure includes permission info
        tool = data["tools"][0]
        assert "name" in tool
        assert "description" in tool
        assert "input_schema" in tool
        assert "permission" in tool
        assert "user_tier" in data
        assert data["user_tier"] == "business"

    def test_tool_call_without_auth(self):
        """Test tool call without authentication should fail"""
        response = client.post("/mcp/tools/search_products/call", json={"parameters": {}})
        assert response.status_code == 401

    def test_tool_call_business_only(self, business_user_token):
        """Test tool calls require business tier"""
        response = client.post("/mcp/tools/search_products/call",
                              json={"parameters": {}},
                              headers={"Authorization": f"Bearer {business_user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "tool_name" in data
        assert "result" in data
        assert "success" in data

class TestMCPIntegration:
    """Test MCP integration with database"""

    def test_search_products_tool(self, db_session):
        """Test search products tool execution"""
        # This would require setting up test data
        # For now, just test the tool exists and can be called
        tool = tool_registry.get_tool("search_products")
        assert tool is not None
        assert "handler" in tool

    def test_escrow_tools_available(self):
        """Test that escrow tools are available"""
        escrow_tools = [
            "get_escrow_status",
            "release_escrow",
            "dispute_escrow",
            "get_project_escrow_status",
            "fund_project_escrow",
            "release_project_payment",
            "submit_project_work",
            "approve_project_work"
        ]

        for tool_name in escrow_tools:
            assert tool_name in tool_registry.tools
            tool = tool_registry.get_tool(tool_name)
            assert tool is not None
            assert "description" in tool

class TestMCPRateLimiting:
    """Test rate limiting functionality"""

    def test_rate_limit_configuration(self):
        """Test rate limit configuration"""
        from mcp_server import RateLimitConfig
        config = RateLimitConfig()
        assert config.requests_per_minute == 60
        assert config.requests_per_hour == 1000
        assert config.burst_limit == 10

class TestMCPValidation:
    """Test input validation"""

    def test_request_size_validation(self):
        """Test request size validation"""
        # Create a mock request with large body
        mock_request = Mock(spec=Request)
        mock_request.headers = {"content-length": "2000000"}  # 2MB

        with pytest.raises(Exception):  # Should raise HTTPException
            validate_request_size(mock_request)

    def test_message_validation(self):
        """Test MCP message validation"""
        from mcp_server import MCPRequest

        # Test too many messages
        too_many_messages = [{"role": "user", "content": f"Message {i}"} for i in range(60)]

        with pytest.raises(Exception):  # Should raise ValidationError
            MCPRequest(messages=too_many_messages, tools=[])

if __name__ == "__main__":
    pytest.main([__file__])
