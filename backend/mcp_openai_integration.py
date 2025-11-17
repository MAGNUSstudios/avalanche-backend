"""
MCP OpenAI Integration
Provides MCP client functionality for OpenAI Assistants
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from openai import OpenAI
import httpx

from database import get_db, User
from mcp_server import tool_registry
from auth import get_current_user_optional

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None

class MCPOpenAIClient:
    """MCP Client for OpenAI Assistants integration"""

    def __init__(self):
        self.base_url = os.getenv("MCP_SERVER_URL", "http://localhost:8000")
        self.api_key = os.getenv("MCP_API_KEY")
        self.api_secret = os.getenv("MCP_API_SECRET")

    def _generate_hmac_signature(self, api_key: str, api_secret: str, request_body: str, timestamp: str) -> str:
        """Generate HMAC signature for API authentication"""
        import hashlib
        import hmac

        message = f"{timestamp}.{request_body}"
        signature = hmac.new(
            api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        return signature

    def _get_auth_headers(self, request_body: str = "") -> Dict[str, str]:
        """Get authentication headers for MCP requests"""
        import time

        headers = {}
        if self.api_key and self.api_secret:
            timestamp = str(int(time.time()))
            signature = self._generate_hmac_signature(self.api_key, self.api_secret, request_body, timestamp)

            headers.update({
                "X-API-Key": self.api_key,
                "X-API-Secret": self.api_secret,
                "X-Signature": signature,
                "X-Timestamp": timestamp
            })

        return headers

    async def call_mcp_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool via HTTP"""
        url = f"{self.base_url}/mcp/tools/{tool_name}/call"

        request_body = json.dumps({"parameters": parameters})
        headers = self._get_auth_headers(request_body)
        headers["Content-Type"] = "application/json"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, content=request_body, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"MCP tool call failed: {e}")
                raise

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available MCP tools"""
        tools = []
        for tool_name, tool_info in tool_registry.tools.items():
            tools.append({
                "type": "function",
                "function": {
                    "name": tool_name,
                    "description": tool_info["description"],
                    "parameters": tool_info["input_schema"]
                }
            })
        return tools

    def create_assistant_with_mcp_tools(self, name: str, instructions: str, model: str = "gpt-4o-mini") -> str:
        """Create an OpenAI Assistant with MCP tools"""
        if not openai_client:
            raise ValueError("OpenAI client not configured")

        tools = self.get_available_tools()

        assistant = openai_client.beta.assistants.create(
            name=name,
            instructions=instructions,
            model=model,
            tools=tools
        )

        logger.info(f"Created OpenAI Assistant with MCP tools: {assistant.id}")
        return assistant.id

    async def handle_tool_call(self, tool_call: Dict[str, Any]) -> Dict[str, Any]:
        """Handle a tool call from OpenAI Assistant"""
        tool_name = tool_call["function"]["name"]
        parameters = json.loads(tool_call["function"]["arguments"])

        logger.info(f"Handling tool call: {tool_name} with params: {parameters}")

        try:
            result = await self.call_mcp_tool(tool_name, parameters)
            return {
                "tool_call_id": tool_call["id"],
                "output": json.dumps(result)
            }
        except Exception as e:
            logger.error(f"Tool call failed: {e}")
            return {
                "tool_call_id": tool_call["id"],
                "output": json.dumps({"error": str(e)})
            }

    async def run_assistant_conversation(self, assistant_id: str, user_message: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
        """Run a conversation with an OpenAI Assistant that has MCP tools"""
        if not openai_client:
            raise ValueError("OpenAI client not configured")

        # Create or retrieve thread
        if thread_id:
            thread = openai_client.beta.threads.retrieve(thread_id)
        else:
            thread = openai_client.beta.threads.create()
            thread_id = thread.id

        # Add user message to thread
        openai_client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_message
        )

        # Run the assistant
        run = openai_client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id
        )

        # Wait for completion and handle tool calls
        while run.status in ["queued", "in_progress"]:
            run = openai_client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )

            if run.status == "requires_action":
                # Handle tool calls
                tool_outputs = []
                if hasattr(run.required_action, 'submit_tool_outputs') and run.required_action.submit_tool_outputs.tool_calls:
                    for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                        output = await self.handle_tool_call(tool_call)
                        tool_outputs.append(output)

                    # Submit tool outputs
                    openai_client.beta.threads.runs.submit_tool_outputs(
                        thread_id=thread_id,
                        run_id=run.id,
                        tool_outputs=tool_outputs
                    )

        # Get the final response
        messages = openai_client.beta.threads.messages.list(thread_id=thread_id)
        assistant_message = None

        for message in messages.data:
            if message.role == "assistant":
                assistant_message = message
                break

        response_content = ""
        if assistant_message and assistant_message.content:
            for content_block in assistant_message.content:
                if content_block.type == "text":
                    response_content += content_block.text.value

        return {
            "thread_id": thread_id,
            "response": response_content,
            "status": run.status
        }

# Global MCP OpenAI client instance
mcp_openai_client = MCPOpenAIClient()

# Example usage functions
async def create_avalanche_assistant() -> str:
    """Create an OpenAI Assistant configured for Avalanche platform interactions"""
    instructions = """
    You are an AI assistant for the Avalanche platform, a comprehensive freelancing and marketplace platform.

    You have access to various tools to help users interact with the platform:
    - Search and browse products, projects, guilds, and users
    - Create new listings, projects, and guild posts
    - Manage escrow transactions and payments
    - Get platform statistics and recommendations

    Always be helpful, professional, and ensure user safety and platform integrity.
    When performing actions, confirm with the user and explain what you're doing.
    """

    assistant_id = mcp_openai_client.create_assistant_with_mcp_tools(
        name="Avalanche Platform Assistant",
        instructions=instructions,
        model="gpt-4o-mini"
    )

    return assistant_id

async def chat_with_avalanche_assistant(user_message: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
    """Chat with the Avalanche assistant (create one if it doesn't exist)"""
    # For demo purposes, create a new assistant each time
    # In production, you'd store and reuse assistant IDs
    assistant_id = await create_avalanche_assistant()

    result = await mcp_openai_client.run_assistant_conversation(
        assistant_id=assistant_id,
        user_message=user_message,
        thread_id=thread_id
    )

    return result

# FastAPI integration
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/mcp/openai",
    tags=["MCP OpenAI Integration"]
)

@router.post("/chat")
async def openai_assistant_chat(
    message: str,
    thread_id: Optional[str] = None,
    user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Chat with OpenAI Assistant that has access to MCP tools"""
    try:
        result = await chat_with_avalanche_assistant(message, thread_id)

        return {
            "response": result["response"],
            "thread_id": result["thread_id"],
            "status": result["status"],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"OpenAI assistant chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Assistant chat failed: {str(e)}")

@router.get("/tools")
async def get_openai_tools():
    """Get tools available to OpenAI Assistant"""
    tools = mcp_openai_client.get_available_tools()
    return {"tools": tools}

@router.post("/assistant/create")
async def create_openai_assistant(
    name: str = "Avalanche Assistant",
    instructions: Optional[str] = None
):
    """Create a new OpenAI Assistant with MCP tools"""
    if not instructions:
        instructions = """
        You are an AI assistant for the Avalanche platform.
        Help users interact with products, projects, guilds, and escrow services.
        Always prioritize user safety and platform integrity.
        """

    try:
        assistant_id = mcp_openai_client.create_assistant_with_mcp_tools(
            name=name,
            instructions=instructions
        )

        return {
            "assistant_id": assistant_id,
            "message": "Assistant created successfully with MCP tools"
        }

    except Exception as e:
        logger.error(f"Failed to create assistant: {e}")
        raise HTTPException(status_code=500, detail=f"Assistant creation failed: {str(e)}")
