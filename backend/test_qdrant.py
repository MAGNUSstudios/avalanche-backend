"""
Test script for Qdrant integration
"""

import qdrant_service
from dotenv import load_dotenv
import os

load_dotenv()

def test_qdrant_connection():
    """Test Qdrant connection"""
    print("=" * 50)
    print("Testing Qdrant Integration")
    print("=" * 50)

    # Check environment variables
    print("\n1. Environment Variables:")
    print(f"   QDRANT_URL: {os.getenv('QDRANT_URL')}")
    print(f"   QDRANT_API_KEY: {'Set' if os.getenv('QDRANT_API_KEY') else 'Not set'}")
    print(f"   OPENAI_API_KEY: {'Set' if os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY') != 'your-openai-api-key-here' else 'Not set'}")

    # Check client initialization
    print("\n2. Client Status:")
    print(f"   Qdrant Client: {'Initialized' if qdrant_service.qdrant_client else 'Not initialized'}")
    print(f"   OpenAI Client: {'Initialized' if qdrant_service.openai_client else 'Not initialized'}")

    # Try to get embedding (if OpenAI is configured)
    if qdrant_service.openai_client:
        print("\n3. Testing OpenAI Embeddings:")
        try:
            embedding = qdrant_service.get_embedding("Test project for AI development")
            if embedding:
                print(f"   ✓ Successfully generated embedding (dimension: {len(embedding)})")
            else:
                print("   ✗ Failed to generate embedding")
        except Exception as e:
            print(f"   ✗ Error: {e}")
    else:
        print("\n3. OpenAI Embeddings:")
        print("   ⚠ OpenAI client not initialized. Set OPENAI_API_KEY in .env")

    # Check collections (if Qdrant is running)
    if qdrant_service.qdrant_client:
        print("\n4. Testing Qdrant Collections:")
        try:
            collections = qdrant_service.qdrant_client.get_collections()
            print(f"   ✓ Connected to Qdrant")
            print(f"   Collections found: {[col.name for col in collections.collections]}")
        except Exception as e:
            print(f"   ⚠ Could not connect to Qdrant: {e}")
            print("   Note: Make sure Qdrant is running at http://localhost:6333")
    else:
        print("\n4. Qdrant Collections:")
        print("   ⚠ Qdrant client not initialized")

    # Summary
    print("\n" + "=" * 50)
    print("Summary:")
    print("=" * 50)

    if not qdrant_service.openai_client:
        print("⚠ Set your OpenAI API key in .env to enable semantic search")
        print("  OPENAI_API_KEY=your-actual-openai-api-key")

    if not qdrant_service.qdrant_client:
        print("⚠ Start Qdrant to enable vector database:")
        print("  Option 1 (Docker): docker run -p 6333:6333 qdrant/qdrant")
        print("  Option 2 (Binary): Download from https://qdrant.tech/documentation/quick-start/")

    if qdrant_service.openai_client and qdrant_service.qdrant_client:
        print("✓ All systems ready for semantic search!")

    print("=" * 50)

if __name__ == "__main__":
    test_qdrant_connection()
