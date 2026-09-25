import requests
import sqlite3
import uuid
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
DB_PATH = "test.db"

def get_db_connection():
    return sqlite3.connect(DB_PATH)

def generate_email(prefix="test"):
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"

def run_test_1():
    print("--- TEST 1: FORGOT PASSWORD ---")
    email = generate_email("customer")
    password = "oldpassword123"
    
    # 1. Register and Login
    requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test Customer",
        "email": email,
        "phone": "1234567890",
        "password": password,
        "role": "CUSTOMER"
    })
    
    # 2. Click Forgot Password
    res = requests.post(f"{BASE_URL}/auth/forgot-password", json={"email": email})
    assert res.status_code == 200
    
    # Manually extract token from DB for testing purposes
    # Since we can't easily intercept the print output, let's bypass by creating our own JWT if needed
    # Actually, let's just use the python script to generate the token
    from jose import jwt
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"sub": email, "type": "reset", "exp": expire}
    reset_token = jwt.encode(to_encode, "mysecretkey12345", algorithm="HS256")
    
    # 4. Reset password
    new_password = "newpassword456"
    res = requests.post(f"{BASE_URL}/auth/reset-password", json={
        "token": reset_token,
        "new_password": new_password
    })
    assert res.status_code == 200
    
    # 5. Verify old password no longer works
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    assert res.status_code == 401
    
    # 6. Verify normal login works with new password
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": new_password})
    assert res.status_code == 200
    print("TEST 1 PASSED\n")
    return email, new_password, res.json()["access_token"]


def run_test_2(customer_token):
    print("--- TEST 2: CUSTOMER 20-MINUTE RULE ---")
    headers = {"Authorization": f"Bearer {customer_token}"}
    
    # Create request
    res = requests.post(f"{BASE_URL}/customer/requests", headers=headers, json={
        "title": "Fix my AC",
        "description": "It is broken",
        "category_id": 1,
        "priority": "HIGH",
        "address": "123 Main St"
    })
    if res.status_code != 201:
        print(f"Failed to create request: {res.json()}")
    assert res.status_code == 201
    req_id = res.json()["id"]
    
    # Edit within 20 mins
    res = requests.patch(f"{BASE_URL}/customer/requests/{req_id}", headers=headers, json={
        "title": "Fix my AC now"
    })
    assert res.status_code == 200
    
    # Fast forward time > 20 mins
    conn = get_db_connection()
    c = conn.cursor()
    past_time = (datetime.utcnow() - timedelta(minutes=25)).strftime("%Y-%m-%d %H:%M:%S")
    c.execute("UPDATE service_requests SET created_at = ? WHERE id = ?", (past_time, req_id))
    conn.commit()
    conn.close()
    
    # Try edit after 20 mins
    res = requests.patch(f"{BASE_URL}/customer/requests/{req_id}", headers=headers, json={
        "title": "Too late"
    })
    assert res.status_code == 400
    assert "20 minutes" in res.json()["detail"]
    
    # Try delete after 20 mins
    res = requests.delete(f"{BASE_URL}/customer/requests/{req_id}", headers=headers)
    assert res.status_code == 400
    assert "20 minutes" in res.json()["detail"]
    
    print("TEST 2 PASSED\n")

def run_test_3(customer_token):
    print("--- TEST 3: MANAGER 30-MINUTE RULE ---")
    # Register Manager (if not exists)
    manager_email = "manager@example.com"
    requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Manager",
        "email": manager_email,
        "phone": "0000000000",
        "password": "pass",
        "role": "MANAGER"
    })
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": manager_email, "password": "pass"})
    manager_token = res.json()["access_token"]
    manager_headers = {"Authorization": f"Bearer {manager_token}"}
    
    # Customer creates a request
    customer_headers = {"Authorization": f"Bearer {customer_token}"}
    res = requests.post(f"{BASE_URL}/customer/requests", headers=customer_headers, json={
        "title": "Broken Heater",
        "description": "Cold",
        "category_id": 1,
        "priority": "MEDIUM",
        "address": "456 Oak St"
    })
    req_id = res.json()["id"]
    
    # Register a technician via Manager
    tech_email = generate_email("tech_30")
    res = requests.post(f"{BASE_URL}/manager/technicians", headers=manager_headers, json={
        "name": "Tech One",
        "email": tech_email,
        "phone": "5555555555",
        "password": "tech",
        "specialization": "HVAC",
        "experience": "5 Years",
        "availability": "Available"
    })
    
    # If 400 occurs (limit reached or email exists), we fetch existing
    if res.status_code == 400:
        tech_list = requests.get(f"{BASE_URL}/manager/technicians", headers=manager_headers).json()
        tech_id = tech_list[-1]["id"]
    else:
        tech_id = res.json()["id"]
        
    # Manager tries assigning before 30 mins
    res = requests.post(f"{BASE_URL}/assignments", headers=manager_headers, json={
        "request_id": req_id,
        "technician_id": tech_id
    })
    assert res.status_code == 400
    assert "30 minutes" in res.json()["detail"]
    
    # Fast forward time > 30 mins
    conn = get_db_connection()
    c = conn.cursor()
    past_time = (datetime.utcnow() - timedelta(minutes=35)).strftime("%Y-%m-%d %H:%M:%S")
    c.execute("UPDATE service_requests SET created_at = ? WHERE id = ?", (past_time, req_id))
    conn.commit()
    conn.close()
    
    # Manager assigns after 30 mins
    res = requests.post(f"{BASE_URL}/assignments", headers=manager_headers, json={
        "request_id": req_id,
        "technician_id": tech_id
    })
    assert res.status_code == 200
    print("TEST 3 PASSED\n")


def run_test_4():
    print("--- TEST 4: SIX TECHNICIANS ---")
    manager_email = "manager@example.com"
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": manager_email, "password": "pass"})
    manager_token = res.json()["access_token"]
    manager_headers = {"Authorization": f"Bearer {manager_token}"}
    
    # Get current technicians count
    existing = requests.get(f"{BASE_URL}/manager/technicians", headers=manager_headers).json()
    count = len(existing)
    
    # Add technicians up to 6
    for i in range(count, 6):
        res = requests.post(f"{BASE_URL}/manager/technicians", headers=manager_headers, json={
            "name": f"Tech {i}",
            "email": generate_email(f"tech{i}"),
            "phone": "1111111111",
            "password": "tech",
            "specialization": "General",
            "experience": "1 Year",
            "availability": "Available"
        })
        assert res.status_code == 201
        
    # Add 7th technician (should fail)
    res = requests.post(f"{BASE_URL}/manager/technicians", headers=manager_headers, json={
        "name": "Tech 7",
        "email": generate_email("tech7"),
        "phone": "2222222222",
        "password": "tech",
        "specialization": "General",
        "experience": "1 Year",
        "availability": "Available"
    })
    assert res.status_code == 400
    assert "Maximum limit" in res.json()["detail"]
    print("TEST 4 PASSED\n")

if __name__ == "__main__":
    email, pwd, token = run_test_1()
    run_test_2(token)
    run_test_3(token)
    run_test_4()
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
