import pytest

@pytest.fixture
def manager_headers(client):
    client.post("/auth/register", json={"name": "U Mgr", "email": "u_mgr@test.com", "password": "pass", "role": "MANAGER"})
    token = client.post("/auth/login", data={"username": "u_mgr@test.com", "password": "pass"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_customers(client, manager_headers):
    client.post("/auth/register", json={"name": "Cust 1", "email": "c1@test.com", "password": "pass", "role": "CUSTOMER"})
    
    res = client.get("/manager/customers", headers=manager_headers)
    assert res.status_code == 200
    users = res.json()
    assert isinstance(users, list)
    assert any(u["email"] == "c1@test.com" for u in users)

def test_get_technicians(client, manager_headers):
    client.post("/auth/register", json={"name": "Tech 1", "email": "t1@test.com", "password": "pass", "role": "TECHNICIAN"})
    
    res = client.get("/manager/technicians", headers=manager_headers)
    assert res.status_code == 200
    techs = res.json()
    # Get user emails from the response
    user_emails = [t["user"]["email"] for t in techs]
    assert "t1@test.com" in user_emails
