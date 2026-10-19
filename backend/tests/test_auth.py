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

def test_forgot_password_and_reset_flow(client):
    email = "forgot@test.com"
    old_password = "oldpassword123"
    new_password = "newpassword456"

    # Register user
    client.post(
        "/auth/register",
        json={
            "name": "Forgot User",
            "email": email,
            "password": old_password,
            "role": "CUSTOMER"
        }
    )

    # Forgot password with unregistered email should return 404
    non_existent = client.post("/auth/forgot-password", json={"email": "nonexistent@test.com"})
    assert non_existent.status_code == 404

    # Forgot password with registered email should return reset_token
    forgot_res = client.post("/auth/forgot-password", json={"email": email})
    assert forgot_res.status_code == 200
    data = forgot_res.json()
    assert "reset_token" in data
    assert data["reset_token"] is not None
    assert data["email"] == email

    # Reset password with valid token
    reset_res = client.post("/auth/reset-password", json={
        "token": data["reset_token"],
        "new_password": new_password
    })
    assert reset_res.status_code == 200

    # Old password no longer works
    old_login = client.post("/auth/login", data={"username": email, "password": old_password})
    assert old_login.status_code == 401

    # New password works
    new_login = client.post("/auth/login", data={"username": email, "password": new_password})
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()

