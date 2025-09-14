#!/usr/bin/env python3
import requests
import json
import time

# Test update functionality
def test_update_project():
    base_url = "http://localhost:8888"
    
    # Test data
    project_id = "d848420b-17c4-4e50-b7af-7e9a8cffc768"
    
    # Create a session to handle cookies
    session = requests.Session()
    
    # First, get the current project data
    print("1. Getting current project data...")
    response = session.get(f"{base_url}/vre/collab/projects")
    print(f"Response status: {response.status_code}")
    print(f"Response content: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Response data type: {type(data)}")
        print(f"Response data: {data}")
        
        if isinstance(data, dict) and data.get('success'):
            projects = data.get('projects', [])
            project = next((p for p in projects if p['id'] == project_id), None)
            if project:
                print(f"Current project: {json.dumps(project, indent=2)}")
            else:
                print(f"Project {project_id} not found")
                return
        elif isinstance(data, list):
            # Direct list of projects
            project = next((p for p in data if p['id'] == project_id), None)
            if project:
                print(f"Current project: {json.dumps(project, indent=2)}")
            else:
                print(f"Project {project_id} not found")
                return
        else:
            print(f"Failed to get projects: {data}")
            return
    else:
        print(f"Failed to get projects: {response.status_code}")
        return
    
    # Get CSRF token from cookies
    csrf_token = None
    for cookie in session.cookies:
        if cookie.name == '_xsrf':
            csrf_token = cookie.value
            break
    
    print(f"CSRF token: {csrf_token}")
    
    # Update the project
    print("\n2. Updating project...")
    update_data = {
        "_action": "update",
        "id": project_id,
        "name": "Updated Project Name",
        "description": "Updated project description",
        "owner": "Updated Owner",
        "tags": ["updated", "test"],
        "phases": ["ideation-planning", "collaboration-coproduction"],
        "modules": ["ideaBoard", "clustering", "voting"]
    }
    
    headers = {'Content-Type': 'application/json'}
    if csrf_token:
        headers['X-XSRFToken'] = csrf_token
    
    response = session.post(
        f"{base_url}/vre/collab/projects",
        json=update_data,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print("Project updated successfully!")
            print(f"Updated project: {json.dumps(data.get('project'), indent=2)}")
        else:
            print(f"Failed to update project: {data.get('error')}")
    else:
        print(f"Failed to update project: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Verify the update
    print("\n3. Verifying update...")
    time.sleep(1)  # Wait a bit for the update to be processed
    
    response = requests.get(f"{base_url}/vre/collab/projects")
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            projects = data.get('projects', [])
            project = next((p for p in projects if p['id'] == project_id), None)
            if project:
                print(f"Updated project: {json.dumps(project, indent=2)}")
            else:
                print(f"Project {project_id} not found after update")
        else:
            print(f"Failed to get projects: {data.get('error')}")
    else:
        print(f"Failed to get projects: {response.status_code}")

if __name__ == "__main__":
    test_update_project()
