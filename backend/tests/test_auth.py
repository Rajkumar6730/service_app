def test_register_customer(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Test Customer",
            "email": "customer@test.com",
            "password": "password123",
            "role": "CUSTOMER"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Customer"
    assert data["email"] == "customer@test.com"
    assert data["role"] == "CUSTOMER"

def test_login_success(client):
    # Ensure user exists
    client.post(
        "/auth/register",
        json={
            "name": "Login Test",
            "email": "login@test.com",
            "password": "password123",
            "role": "CUSTOMER"
        }
    )
    
    response = client.post(
        "/auth/login",
        data={
            "username": "login@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client):
    client.post(
        "/auth/register",
        json={
            "name": "Invalid Test",
            "email": "invalid@test.com",
            "password": "password123",
            "role": "CUSTOMER"
        }
    )
    
    response = client.post(
        "/auth/login",
        data={
            "username": "invalid@test.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_protected_route_without_token(client):
    response = client.get("/service-requests/my")
    assert response.status_code == 401
