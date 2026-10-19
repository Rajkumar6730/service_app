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

def test_service_unavailability_feature(client, auth_headers, manager_headers):
    # 1. Customer creates request
    create_res = client.post(
        "/service-requests",
        headers=auth_headers,
        data={
            "category_id": 1,
            "title": "AC Not Cooling",
            "description": "Urgent AC repair needed",
            "priority": "HIGH",
            "address": "456 Palm St"
        }
    )
    assert create_res.status_code == 201
    req_id = create_res.json()["id"]

    # 2. Unauthenticated user receives 401
    unauth_res = client.post(f"/manager/requests/{req_id}/mark-unavailable")
    assert unauth_res.status_code == 401

    # 3. Customer receives 403 trying to access manager-only endpoint
    forbidden_res = client.post(f"/manager/requests/{req_id}/mark-unavailable", headers=auth_headers)
    assert forbidden_res.status_code == 403

    # 4. Invalid request ID returns 404
    notfound_res = client.post("/manager/requests/999999/mark-unavailable", headers=manager_headers)
    assert notfound_res.status_code == 404

    # 5. Manager marks service unavailable successfully
    mark_res = client.post(f"/manager/requests/{req_id}/mark-unavailable", headers=manager_headers)
    assert mark_res.status_code == 200
    marked_data = mark_res.json()
    assert marked_data["service_unavailable"] is True
    assert marked_data["unavailability_message"] == "⚠️ Currently this service is not available."
    # Ensure request status was NOT altered to COMPLETED or another status
    assert marked_data["status"] == "NEW"

    # 6. Idempotent: repeated clicks do not cause error or duplicate notifications
    repeat_res = client.post(f"/manager/requests/{req_id}/mark-unavailable", headers=manager_headers)
    assert repeat_res.status_code == 200

    # 7. Customer sees the unavailability message in /service-requests/my
    my_requests_res = client.get("/service-requests/my", headers=auth_headers)
    assert my_requests_res.status_code == 200
    my_items = my_requests_res.json()["items"]
    target_req = next((r for r in my_items if r["id"] == req_id), None)
    assert target_req is not None
    assert target_req["service_unavailable"] is True
    assert target_req["unavailability_message"] == "⚠️ Currently this service is not available."

    # 8. Notification was sent to the customer
    notif_res = client.get("/notifications", headers=auth_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert any("⚠️ Currently this service is not available." in n["message"] for n in notifs)

    # 9. Manager can mark service available again if status changes
    restore_res = client.post(f"/manager/requests/{req_id}/mark-available", headers=manager_headers)
    assert restore_res.status_code == 200
    restored_data = restore_res.json()
    assert restored_data["service_unavailable"] is False
    assert restored_data["unavailability_message"] is None

