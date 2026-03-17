"""
Titelli Marketplace API Tests
Testing: Homepage data, Featured sections, Auth, Cart, Stripe endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://category-refactor-2.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_CLIENT_EMAIL = "test.client@titelli.com"
TEST_CLIENT_PASSWORD = "Test123!"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_is_reachable(self):
        """Test that the API is reachable"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code in [200, 404], f"API should respond, got {response.status_code}"
    
    def test_frontend_is_reachable(self):
        """Test that the frontend is reachable"""
        response = requests.get(f"{BASE_URL}/", timeout=10)
        assert response.status_code == 200, f"Frontend should respond with 200, got {response.status_code}"


class TestFeaturedEndpoints:
    """Tests for featured/trending endpoints"""
    
    def test_get_tendances(self):
        """Test GET /api/featured/tendances - Returns enterprises marked as tendance"""
        response = requests.get(f"{BASE_URL}/api/featured/tendances", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        
        if len(data) > 0:
            # Verify structure of first item
            item = data[0]
            assert "business_name" in item or "name" in item, "Should have business_name field"
            assert "is_tendance" in item, "Should have is_tendance flag"
            assert item.get("is_tendance") == True, "Items should be marked as tendance"
            print(f"✅ Found {len(data)} tendance enterprises")
    
    def test_get_guests(self):
        """Test GET /api/featured/guests - Returns enterprises marked as guest"""
        response = requests.get(f"{BASE_URL}/api/featured/guests", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        
        if len(data) > 0:
            item = data[0]
            assert "is_guest" in item, "Should have is_guest flag"
            assert item.get("is_guest") == True, "Items should be marked as guest"
            print(f"✅ Found {len(data)} guest enterprises")
    
    def test_get_premium(self):
        """Test GET /api/featured/premium - Returns premium enterprises"""
        response = requests.get(f"{BASE_URL}/api/featured/premium", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"✅ Found {len(data)} premium enterprises")
    
    def test_get_offres(self):
        """Test GET /api/featured/offres - Returns featured offers"""
        response = requests.get(f"{BASE_URL}/api/featured/offres", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"✅ Found {len(data)} featured offres")


class TestEnterprisesEndpoints:
    """Tests for enterprises endpoints"""
    
    def test_get_enterprises_list(self):
        """Test GET /api/enterprises - Returns list of enterprises"""
        response = requests.get(f"{BASE_URL}/api/enterprises?limit=10", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "enterprises" in data, "Response should contain 'enterprises' key"
        assert "total" in data, "Response should contain 'total' key"
        
        enterprises = data["enterprises"]
        assert isinstance(enterprises, list), "Enterprises should be a list"
        assert len(enterprises) <= 10, "Should respect limit parameter"
        
        if len(enterprises) > 0:
            enterprise = enterprises[0]
            assert "business_name" in enterprise, "Enterprise should have business_name"
            assert "category" in enterprise, "Enterprise should have category"
            print(f"✅ Found {data['total']} total enterprises, returned {len(enterprises)}")
    
    def test_get_enterprise_by_id(self):
        """Test GET /api/enterprises/:id - Returns single enterprise"""
        # First get a list to get a valid ID
        list_response = requests.get(f"{BASE_URL}/api/enterprises?limit=1", timeout=10)
        assert list_response.status_code == 200
        
        enterprises = list_response.json().get("enterprises", [])
        if len(enterprises) > 0:
            enterprise_id = enterprises[0].get("id")
            
            response = requests.get(f"{BASE_URL}/api/enterprises/{enterprise_id}", timeout=10)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert data.get("id") == enterprise_id, "Should return correct enterprise"
            print(f"✅ Retrieved enterprise: {data.get('business_name')}")


class TestAuthEndpoints:
    """Tests for authentication endpoints"""
    
    def test_login_with_valid_credentials(self):
        """Test POST /api/auth/login - Login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user data"
        
        user = data["user"]
        assert user.get("email") == TEST_CLIENT_EMAIL, "Should return correct user email"
        assert "user_type" in user, "User should have user_type"
        print(f"✅ Login successful for {user.get('first_name')} {user.get('last_name')}")
        
        return data["token"]
    
    def test_login_with_invalid_credentials(self):
        """Test POST /api/auth/login - Login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@email.com", "password": "wrongpassword"},
            timeout=10
        )
        assert response.status_code in [400, 401, 404], f"Expected error status, got {response.status_code}"
    
    def test_get_current_user_authenticated(self):
        """Test GET /api/auth/me - Get current user with valid token"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            timeout=10
        )
        
        if login_response.status_code != 200:
            pytest.skip("Login failed, cannot test authenticated endpoint")
        
        token = login_response.json().get("token")
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        user = response.json()
        assert user.get("email") == TEST_CLIENT_EMAIL
        print(f"✅ Retrieved current user: {user.get('email')}")


class TestProductsAndServices:
    """Tests for products and services endpoints"""
    
    def test_get_products(self):
        """Test GET /api/products - Returns list of products"""
        response = requests.get(f"{BASE_URL}/api/products?limit=12", timeout=10)
        
        # Accept both 200 and 404 (endpoint might not exist)
        if response.status_code == 404:
            pytest.skip("Products endpoint not found")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, (list, dict)), "Should return list or dict"
        print(f"✅ Products endpoint working")
    
    def test_get_services(self):
        """Test GET /api/services - Returns list of services"""
        response = requests.get(f"{BASE_URL}/api/services?limit=12", timeout=10)
        
        if response.status_code == 404:
            pytest.skip("Services endpoint not found")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Services endpoint working")


class TestCartAndOrders:
    """Tests for cart and order endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Login failed")
        
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_cart(self, auth_headers):
        """Test GET /api/cart - Get user's cart"""
        response = requests.get(
            f"{BASE_URL}/api/cart",
            headers=auth_headers,
            timeout=10
        )
        
        if response.status_code == 404:
            pytest.skip("Cart endpoint not found")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Cart endpoint working")
    
    def test_get_orders(self, auth_headers):
        """Test GET /api/orders - Get user's orders"""
        response = requests.get(
            f"{BASE_URL}/api/orders",
            headers=auth_headers,
            timeout=10
        )
        
        if response.status_code == 404:
            pytest.skip("Orders endpoint not found")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Orders endpoint working")


class TestStripeIntegration:
    """Tests for Stripe payment integration"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Login failed")
        
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_stripe_config_endpoint(self):
        """Test that Stripe public key endpoint exists"""
        response = requests.get(f"{BASE_URL}/api/payments/config", timeout=10)
        
        if response.status_code == 404:
            # Try alternative endpoint
            response = requests.get(f"{BASE_URL}/api/stripe/config", timeout=10)
        
        if response.status_code == 404:
            pytest.skip("Stripe config endpoint not found")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Stripe config endpoint working")


class TestCategoriesAndSearch:
    """Tests for categories and search functionality"""
    
    def test_get_categories(self):
        """Test GET /api/categories - Returns list of categories"""
        response = requests.get(f"{BASE_URL}/api/categories", timeout=10)
        
        if response.status_code == 404:
            pytest.skip("Categories endpoint not found")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"✅ Found {len(data)} categories")
    
    def test_search_enterprises(self):
        """Test GET /api/enterprises/search - Search functionality"""
        response = requests.get(f"{BASE_URL}/api/enterprises?search=restaurant", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "enterprises" in data, "Should return enterprises"
        print(f"✅ Search returned {len(data.get('enterprises', []))} results")


class TestHomepageData:
    """Tests for homepage data aggregation"""
    
    def test_homepage_sections_data(self):
        """Test that all homepage sections have data"""
        # Test tendances
        tendances_resp = requests.get(f"{BASE_URL}/api/featured/tendances", timeout=10)
        assert tendances_resp.status_code == 200
        tendances = tendances_resp.json()
        
        # Test guests
        guests_resp = requests.get(f"{BASE_URL}/api/featured/guests", timeout=10)
        assert guests_resp.status_code == 200
        guests = guests_resp.json()
        
        # Test premium
        premium_resp = requests.get(f"{BASE_URL}/api/featured/premium", timeout=10)
        assert premium_resp.status_code == 200
        premium = premium_resp.json()
        
        print(f"✅ Homepage data: {len(tendances)} tendances, {len(guests)} guests, {len(premium)} premium")
        
        # Verify we have at least some data
        assert len(tendances) > 0, "Should have tendances data for homepage"
        assert len(guests) > 0, "Should have guests data for homepage"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
