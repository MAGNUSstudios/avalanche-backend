"""
AI-Powered Recommendations Service
Uses embeddings and user behavior to recommend relevant content
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from openai import OpenAI
import os
import logging

from database import User, Project, Guild, Product
import qdrant_service

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_user_profile_embedding(user: User, db: Session) -> Optional[List[float]]:
    """
    Generate an embedding representing a user's interests and profile
    """
    if not qdrant_service.openai_client:
        return None

    # Collect user's profile information
    profile_parts = []

    # Add user bio if available
    if hasattr(user, 'bio') and user.bio:
        profile_parts.append(user.bio)

    # Add user's skills if available
    if hasattr(user, 'skills') and user.skills:
        profile_parts.append(f"Skills: {user.skills}")

    # Get projects the user has created or participated in
    user_projects = db.query(Project).filter(Project.owner_id == user.id).limit(5).all()
    for project in user_projects:
        if project.title:
            profile_parts.append(project.title)
        if project.description:
            profile_parts.append(project.description)

    # Combine all profile information
    if not profile_parts:
        # Fallback: use a generic professional interest profile
        profile_text = "Professional interested in technology and collaboration"
    else:
        profile_text = " ".join(profile_parts)

    # Generate embedding
    try:
        embedding = qdrant_service.get_embedding(profile_text)
        return embedding
    except Exception as e:
        logger.error(f"Error generating user profile embedding: {e}")
        return None


def recommend_projects_for_user(
    user: User,
    db: Session,
    limit: int = 10,
    exclude_own: bool = True
) -> List[Dict[str, Any]]:
    """
    Recommend projects based on user's profile and interests
    """
    if not qdrant_service.qdrant_client or not qdrant_service.openai_client:
        logger.warning("Recommendations not available. Qdrant or OpenAI not configured.")
        return []

    try:
        # Generate user profile embedding
        user_embedding = generate_user_profile_embedding(user, db)
        if not user_embedding:
            return []

        # Search for similar projects in Qdrant
        results = qdrant_service.qdrant_client.search(
            collection_name=qdrant_service.PROJECTS_COLLECTION,
            query_vector=user_embedding,
            limit=limit * 2,  # Get more to filter out user's own projects
            score_threshold=0.6
        )

        # Format and filter results
        recommendations = []
        for result in results:
            project_id = result.payload.get("project_id")

            # Skip user's own projects if requested
            if exclude_own and result.payload.get("owner_id") == user.id:
                continue

            # Get full project details from database
            project = db.query(Project).filter(Project.id == project_id).first()
            if project:
                recommendations.append({
                    "project_id": project_id,
                    "title": result.payload.get("title"),
                    "description": result.payload.get("description"),
                    "score": result.score,
                    "reason": "Based on your interests and profile",
                    "project": {
                        "id": project.id,
                        "title": project.title,
                        "description": project.description,
                        "status": project.status,
                        "budget": project.budget,
                        "deadline": project.deadline,
                        "owner_id": project.owner_id,
                        "created_at": project.created_at,
                    }
                })

            if len(recommendations) >= limit:
                break

        logger.info(f"Generated {len(recommendations)} project recommendations for user {user.id}")
        return recommendations

    except Exception as e:
        logger.error(f"Error generating project recommendations: {e}")
        return []


def recommend_similar_projects(
    project_id: int,
    db: Session,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Find projects similar to a given project
    """
    if not qdrant_service.qdrant_client:
        return []

    try:
        # Get the project
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return []

        # Generate embedding for this project
        text = f"{project.title}\n{project.description or ''}"
        embedding = qdrant_service.get_embedding(text)
        if not embedding:
            return []

        # Search for similar projects
        results = qdrant_service.qdrant_client.search(
            collection_name=qdrant_service.PROJECTS_COLLECTION,
            query_vector=embedding,
            limit=limit + 1,  # +1 to exclude the project itself
            score_threshold=0.7
        )

        # Format results, excluding the original project
        similar_projects = []
        for result in results:
            result_project_id = result.payload.get("project_id")

            # Skip the original project
            if result_project_id == project_id:
                continue

            # Get full project details
            similar_project = db.query(Project).filter(Project.id == result_project_id).first()
            if similar_project:
                similar_projects.append({
                    "project_id": result_project_id,
                    "title": result.payload.get("title"),
                    "description": result.payload.get("description"),
                    "score": result.score,
                    "project": {
                        "id": similar_project.id,
                        "title": similar_project.title,
                        "description": similar_project.description,
                        "status": similar_project.status,
                        "budget": similar_project.budget,
                        "deadline": similar_project.deadline,
                        "owner_id": similar_project.owner_id,
                        "created_at": similar_project.created_at,
                    }
                })

            if len(similar_projects) >= limit:
                break

        return similar_projects

    except Exception as e:
        logger.error(f"Error finding similar projects: {e}")
        return []


def recommend_guilds_for_user(
    user: User,
    db: Session,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Recommend guilds/communities based on user's interests
    """
    if not qdrant_service.qdrant_client or not qdrant_service.openai_client:
        return []

    try:
        # Generate user profile embedding
        user_embedding = generate_user_profile_embedding(user, db)
        if not user_embedding:
            return []

        # Search for relevant guilds
        results = qdrant_service.qdrant_client.search(
            collection_name=qdrant_service.GUILDS_COLLECTION,
            query_vector=user_embedding,
            limit=limit,
            score_threshold=0.6
        )

        # Format results
        recommendations = []
        for result in results:
            guild_id = result.payload.get("guild_id")
            guild = db.query(Guild).filter(Guild.id == guild_id).first()

            if guild:
                recommendations.append({
                    "guild_id": guild_id,
                    "name": result.payload.get("name"),
                    "description": result.payload.get("description"),
                    "score": result.score,
                    "reason": "Matches your interests",
                    "guild": {
                        "id": guild.id,
                        "name": guild.name,
                        "description": guild.description,
                        "owner_id": guild.owner_id,
                        "created_at": guild.created_at,
                    }
                })

        return recommendations

    except Exception as e:
        logger.error(f"Error recommending guilds: {e}")
        return []


def recommend_products_for_project(
    project: Project,
    db: Session,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Recommend products/tools that might be useful for a project
    """
    if not qdrant_service.qdrant_client:
        return []

    try:
        # Generate embedding for project
        text = f"{project.title}\n{project.description or ''}"
        embedding = qdrant_service.get_embedding(text)
        if not embedding:
            return []

        # Search for relevant products
        results = qdrant_service.qdrant_client.search(
            collection_name=qdrant_service.PRODUCTS_COLLECTION,
            query_vector=embedding,
            limit=limit,
            score_threshold=0.6
        )

        # Format results
        recommendations = []
        for result in results:
            product_id = result.payload.get("product_id")
            product = db.query(Product).filter(Product.id == product_id).first()

            if product:
                recommendations.append({
                    "product_id": product_id,
                    "name": result.payload.get("name"),
                    "description": result.payload.get("description"),
                    "score": result.score,
                    "reason": "Relevant to your project",
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "description": product.description,
                        "price": product.price,
                        "image_url": product.image_url,
                        "seller_id": product.seller_id,
                        "created_at": product.created_at,
                    }
                })

        return recommendations

    except Exception as e:
        logger.error(f"Error recommending products: {e}")
        return []


def get_trending_projects(
    db: Session,
    user: Optional[User] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Get trending projects with personalization if user is provided
    """
    try:
        # Get recent projects with high engagement (placeholder logic)
        # In production, track views, applications, etc.
        trending = db.query(Project).order_by(
            Project.created_at.desc()
        ).limit(limit * 2).all()

        if not user or not qdrant_service.openai_client:
            # Return without personalization
            return [
                {
                    "project_id": p.id,
                    "title": p.title,
                    "description": p.description,
                    "score": 1.0,
                    "reason": "Trending",
                    "project": {
                        "id": p.id,
                        "title": p.title,
                        "description": p.description,
                        "status": p.status,
                        "budget": p.budget,
                        "deadline": p.deadline,
                        "owner_id": p.owner_id,
                        "created_at": p.created_at,
                    }
                }
                for p in trending[:limit]
            ]

        # Personalize trending based on user profile
        user_embedding = generate_user_profile_embedding(user, db)
        if not user_embedding:
            return []

        # Score each trending project based on relevance to user
        scored_projects = []
        for project in trending:
            text = f"{project.title}\n{project.description or ''}"
            project_embedding = qdrant_service.get_embedding(text)

            if project_embedding:
                # Calculate cosine similarity
                import numpy as np
                score = np.dot(user_embedding, project_embedding) / (
                    np.linalg.norm(user_embedding) * np.linalg.norm(project_embedding)
                )

                scored_projects.append({
                    "project_id": project.id,
                    "title": project.title,
                    "description": project.description,
                    "score": float(score),
                    "reason": "Trending and relevant to you",
                    "project": {
                        "id": project.id,
                        "title": project.title,
                        "description": project.description,
                        "status": project.status,
                        "budget": project.budget,
                        "deadline": project.deadline,
                        "owner_id": project.owner_id,
                        "created_at": project.created_at,
                    }
                })

        # Sort by relevance score
        scored_projects.sort(key=lambda x: x["score"], reverse=True)
        return scored_projects[:limit]

    except Exception as e:
        logger.error(f"Error getting trending projects: {e}")
        return []
