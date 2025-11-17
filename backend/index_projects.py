"""
Script to index all projects in the database into Qdrant for semantic search
"""
from database import get_db, Project
import qdrant_service

def index_all_projects():
    """Index all active projects into Qdrant"""
    db = next(get_db())

    try:
        # Get all active projects
        projects = db.query(Project).filter(Project.status == "active").all()

        print(f"Found {len(projects)} active projects to index")

        indexed_count = 0
        failed_count = 0

        for project in projects:
            try:
                success = qdrant_service.index_project(
                    project_id=project.id,
                    title=project.title,
                    description=project.description or "",
                    metadata={
                        "status": project.status,
                        "budget": float(project.budget) if project.budget else 0,
                        "owner_id": project.owner_id
                    }
                )

                if success:
                    indexed_count += 1
                    print(f"✅ Indexed: {project.title} (ID: {project.id})")
                else:
                    failed_count += 1
                    print(f"❌ Failed to index: {project.title} (ID: {project.id})")

            except Exception as e:
                failed_count += 1
                print(f"❌ Error indexing {project.title}: {str(e)}")

        print(f"\n📊 Indexing complete:")
        print(f"   ✅ Successfully indexed: {indexed_count}")
        print(f"   ❌ Failed: {failed_count}")
        print(f"   📦 Total projects: {len(projects)}")

    finally:
        db.close()

if __name__ == "__main__":
    index_all_projects()
