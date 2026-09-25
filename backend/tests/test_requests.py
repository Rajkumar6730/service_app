import pytest

@pytest.fixture
def auth_headers(client):
    # Register and login a customer
    client.post(
        "/auth/register",
        json={
            "name": "Req Customer",
            "email": "req_customer@test.com",
            "password": "password123",
            "role": "CUSTOMER"
        }
    )
    res = client.post(
        "/auth/login",
        data={"username": "req_customer@test.com", "password": "password123"}
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def manager_headers(client):
    client.post(
        "/auth/register",
        json={
            "name": "Req Manager",
            "email": "req_manager@test.com",
            "password": "password123",
            "role": "MANAGER"
        }
    )
    res = client.post(
        "/auth/login",
        data={"username": "req_manager@test.com", "password": "password123"}
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_service_request(client, auth_headers):
    response = client.post(
        "/service-requests",
        headers=auth_headers,
        data={
            "category_id": 1,
            "title": "Fix my sink",
            "description": "It is leaking",
            "priority": "HIGH",
            "address": "123 Test St"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Fix my sink"
    assert data["status"] == "NEW"

def test_view_own_requests(client, auth_headers):
    # Create request first
    client.post(
        "/service-requests",
        headers=auth_headers,
        data={
            "category_id": 1,
            "title": "Fix my sink 2",
            "description": "It is leaking again",
            "priority": "HIGH",
            "address": "123 Test St"
        }
    )
    
    response = client.get("/service-requests/my", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 1

def test_manager_authorization(client, auth_headers, manager_headers):
    # Customer tries to access manager route
    res1 = client.get("/manager/requests", headers=auth_headers)
    assert res1.status_code == 403
    
    # Manager accesses manager route
    res2 = client.get("/manager/requests", headers=manager_headers)
    assert res2.status_code == 200

def test_feedback_rules(client, auth_headers, manager_headers):
    # Create request
    req = client.post(
        "/service-requests",
        headers=auth_headers,
        data={
            "category_id": 1,
            "title": "Test Feedback",
            "description": "Desc",
            "priority": "LOW",
            "address": "Address"
        }
    )
    req_id = req.json()["id"]

    # Try to give feedback on NEW request
    res = client.post(
        f"/feedback/{req_id}",
        headers=auth_headers,
        json={"rating": 5, "comment": "Great"}
    )
    # Should fail because it's not COMPLETED
    assert res.status_code == 400
