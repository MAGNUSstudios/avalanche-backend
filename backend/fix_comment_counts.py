"""
Fix comment counts for all posts by counting actual comments in the database
"""

from database import SessionLocal, Post, Comment

def fix_comment_counts():
    db = SessionLocal()
    try:
        # Get all posts
        posts = db.query(Post).all()
        
        updated_count = 0
        for post in posts:
            # Count ALL comments (including replies) for this post
            actual_count = db.query(Comment).filter(
                Comment.post_id == post.id
            ).count()
            
            if post.comments_count != actual_count:
                print(f"Post ID {post.id}: Current count = {post.comments_count}, Actual count = {actual_count}")
                post.comments_count = actual_count
                updated_count += 1
        
        if updated_count > 0:
            db.commit()
            print(f"\n✅ Updated comment counts for {updated_count} posts")
        else:
            print("\n✅ All post comment counts are correct")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Fixing comment counts for all posts...")
    fix_comment_counts()
