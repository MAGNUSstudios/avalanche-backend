"""
Demo Script: Test Semantic Search with Real Data
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def demo_semantic_search():
    """
    Demonstrate semantic search functionality
    """
    print("=" * 60)
    print("SEMANTIC SEARCH DEMO")
    print("=" * 60)

    # Demo 1: Search for AI/ML projects
    print("\n1. Searching for AI/Machine Learning projects...")
    print("-" * 60)

    response = requests.get(
        f"{BASE_URL}/search/projects",
        params={
            "query": "artificial intelligence machine learning",
            "limit": 5,
            "score_threshold": 0.5
        }
    )

    if response.status_code == 200:
        data = response.json()
        print(f"Query: '{data['query']}'")
        print(f"Found {data['count']} results\n")

        if data['count'] > 0:
            for i, result in enumerate(data['results'], 1):
                print(f"{i}. {result['title']}")
                print(f"   Score: {result['score']:.3f}")
                print(f"   Description: {result['description'][:100]}...")
                print()
        else:
            print("No results found. Try indexing some projects first!")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

    # Demo 2: Search for web development products
    print("\n2. Searching for web development tools...")
    print("-" * 60)

    response = requests.get(
        f"{BASE_URL}/search/products",
        params={
            "query": "web development tools frameworks",
            "limit": 5,
            "score_threshold": 0.5
        }
    )

    if response.status_code == 200:
        data = response.json()
        print(f"Query: '{data['query']}'")
        print(f"Found {data['count']} results\n")

        if data['count'] > 0:
            for i, result in enumerate(data['results'], 1):
                print(f"{i}. {result['name']}")
                print(f"   Score: {result['score']:.3f}")
                print(f"   Description: {result['description'][:100]}...")
                print()
        else:
            print("No results found. Try indexing some products first!")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

    # Demo 3: Search for developer communities
    print("\n3. Searching for developer communities...")
    print("-" * 60)

    response = requests.get(
        f"{BASE_URL}/search/guilds",
        params={
            "query": "software developers programming community",
            "limit": 5,
            "score_threshold": 0.5
        }
    )

    if response.status_code == 200:
        data = response.json()
        print(f"Query: '{data['query']}'")
        print(f"Found {data['count']} results\n")

        if data['count'] > 0:
            for i, result in enumerate(data['results'], 1):
                print(f"{i}. {result['name']}")
                print(f"   Score: {result['score']:.3f}")
                print(f"   Description: {result['description'][:100]}...")
                print()
        else:
            print("No results found. Try indexing some guilds first!")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("\n1. Create projects, products, or guilds via the API/frontend")
    print("2. Index them using: POST /index/{type}/{id}")
    print("3. Search will return semantically similar results!")
    print("\nDashboard: http://localhost:6333/dashboard")
    print("API Docs: http://localhost:8000/docs")
    print("=" * 60)


if __name__ == "__main__":
    try:
        demo_semantic_search()
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to backend server.")
        print("Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"ERROR: {e}")
