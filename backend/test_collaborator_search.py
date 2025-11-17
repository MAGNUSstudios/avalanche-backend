"""
Test collaborator search functionality
"""

from database import engine, User
from sqlalchemy.orm import Session
import ai_assistant

# Create database session
db = Session(engine)

# Get a test user (or None for anonymous)
test_user = db.query(User).first()

# Test the intent detection
test_message = "Find a collaborator"
intent = ai_assistant.detect_intent(test_message)
print(f"🎯 Intent detected: {intent}")

# Test the full chat response
print("\n📝 Testing full chat response...")
result = ai_assistant.chat_with_ai(
    message=test_message,
    user=test_user,
    db=db,
    conversation_history=[],
    session_id="test-session-123"
)

print(f"\n✅ Response: {result['response'][:500]}")
print(f"\n📊 Full result keys: {result.keys()}")

if 'context' in result:
    print(f"\n🔍 Context sources: {result.get('context', {}).get('sources', [])}")
    if 'collaborators' in result.get('context', {}):
        collaborators = result['context']['collaborators']
        print(f"\n👥 Found {len(collaborators)} collaborators:")
        for collab in collaborators[:3]:  # Show first 3
            print(f"   - {collab['name']} ({collab['email']})")

db.close()
