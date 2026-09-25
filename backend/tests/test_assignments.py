import pytest

@pytest.fixture
def auth_tokens(client):
    # Register Manager
    client.post("/auth/register", json={"name": "Mgr", "email": "mgr@test.com", "password": "pass", "role": "MANAGER"})
    mgr_token = client.post("/auth/login", data={"username": "mgr@test.com", "password": "pass"}).json()["access_token"]

    # Register Technician
    client.post("/auth/register", json={"name": "Tech", "email": "tech@test.com", "password": "pass", "role": "TECHNICIAN"})
    tech_token = client.post("/auth/login", data={"username": "tech@test.com", "password": "pass"}).json()["access_token"]

    # Register Customer
    client.post("/auth/register", json={"name": "Cust", "email": "cust@test.com", "password": "pass", "role": "CUSTOMER"})
    cust_token = client.post("/auth/login", data={"username": "cust@test.com", "password": "pass"}).json()["access_token"]
    
    # Get user IDs
    users_res = client.get("/manager/customers", headers={"Authorization": f"Bearer {mgr_token}"})
    cust_id = next(u["id"] for u in users_res.json() if u["email"] == "cust@test.com")
    
    techs_res = client.get("/manager/technicians", headers={"Authorization": f"Bearer {mgr_token}"})
    tech_profile_id = next(u["id"] for u in techs_res.json() if u["user"]["email"] == "tech@test.com")

    return {
        "manager": {"Authorization": f"Bearer {mgr_token}"},
        "technician": {"Authorization": f"Bearer {tech_token}"},
        "customer": {"Authorization": f"Bearer {cust_token}"},
        "tech_profile_id": tech_profile_id,
        "cust_user_id": cust_id
    }

def test_technician_authorization(client, auth_tokens):
    # Technician accesses technician route
    res = client.get("/technician/requests", headers=auth_tokens["technician"])
    assert res.status_code == 200
    
    # Customer tries to access technician route
    res2 = client.get("/technician/requests", headers=auth_tokens["customer"])
    assert res2.status_code == 403

def test_technician_assignment_and_transitions(client, auth_tokens):
    # 1. Customer creates request
    req = client.post(
        "/service-requests",
        headers=auth_tokens["customer"],
        data={
            "category_id": 1,
            "title": "Broken AC",
            "description": "Please fix",
            "priority": "HIGH",
            "address": "123 AC St"
        }
    )
    req_id = req.json()["id"]

    # 2. Manager assigns technician
    assign_res = client.post(
        "/assignments",
        headers=auth_tokens["manager"],
        json={"request_id": req_id, "technician_id": auth_tokens["tech_profile_id"], "notes": "Fix it."}
    )
    assert assign_res.status_code in [200, 201]

    # Status should now be ASSIGNED
    # 3. Technician accepts (Valid transition ASSIGNED -> ACCEPTED)
    res_accept = client.post(
        f"/technician/requests/{req_id}/status",
        headers=auth_tokens["technician"],
        json={"status": "ACCEPTED", "remarks": "I will do it"}
    )
    assert res_accept.status_code == 200
    assert res_accept.json()["status"] == "ACCEPTED"

    # 4. Invalid transition (ACCEPTED -> NEW)
    res_invalid = client.post(
        f"/technician/requests/{req_id}/status",
        headers=auth_tokens["technician"],
        json={"status": "NEW", "remarks": "Invalid"}
    )
    assert res_invalid.status_code == 400

    # 5. Technician starts work (ACCEPTED -> IN_PROGRESS)
    res_progress = client.post(
        f"/technician/requests/{req_id}/status",
        headers=auth_tokens["technician"],
        json={"status": "IN_PROGRESS", "remarks": "Working on it"}
    )
    assert res_progress.status_code == 200

    # 6. Technician completes work (IN_PROGRESS -> COMPLETED)
    res_complete = client.post(
        f"/technician/requests/{req_id}/status",
        headers=auth_tokens["technician"],
        json={"status": "COMPLETED", "remarks": "Done"}
    )
    assert res_complete.status_code == 200
