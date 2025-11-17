"""
Seed script to add sample messages to the database
"""

from database import SessionLocal, User, Message
from datetime import datetime, timedelta
import random

def seed_messages():
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.query(User).all()
        
        if len(users) < 2:
            print("Need at least 2 users to create sample messages")
            return
        
        # Sample conversation content
        conversation_templates = [
            ("Hey! I saw your project in the guild. Looks really interesting!", 
             "Thanks! I've been working on it for a while. Would love to collaborate!",
             "Definitely! When can we chat more about it?",
             "How about tomorrow afternoon?"),
            
            ("Hi! Are you still looking for team members?",
             "Yes! What's your experience level?",
             "I've been coding for about 3 years, mostly in Python and React",
             "Perfect! Let me add you to our guild"),
            
            ("Thanks for the feedback on my post!",
             "No problem! Your ideas are really innovative",
             "I appreciate that. Want to grab coffee sometime?",
             "Sounds great!"),
        ]
        
        messages_created = 0
        
        # Create conversations between random pairs of users
        for i in range(min(3, len(users) - 1)):
            user1 = users[i]
            user2 = users[i + 1]
            
            # Pick a random conversation template
            conversation = random.choice(conversation_templates)
            
            # Create messages in the conversation
            base_time = datetime.utcnow() - timedelta(days=random.randint(1, 7))
            
            for idx, content in enumerate(conversation):
                # Alternate between sender and recipient
                sender = user1 if idx % 2 == 0 else user2
                recipient = user2 if idx % 2 == 0 else user1
                
                message = Message(
                    content=content,
                    sender_id=sender.id,
                    recipient_id=recipient.id,
                    created_at=base_time + timedelta(minutes=idx * 15),
                    is_read=(idx < len(conversation) - 1)  # Last message unread
                )
                
                db.add(message)
                messages_created += 1
        
        db.commit()
        print(f"✅ Successfully created {messages_created} sample messages!")
        print(f"📨 Created conversations between {min(3, len(users) - 1)} pairs of users")
        
    except Exception as e:
        print(f"❌ Error seeding messages: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_messages()
