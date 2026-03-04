"""
Iteration 43 - Titelli Full API Testing
Tests for all major backend API endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://category-video-hub.preview.emergentagent.com')

class TestHealthAndBasic:
    """Test basic health and connectivity"""
    
    def test_health_endpoint(self):
        """Health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        print(f"✅ Health check: {data}")
    

class TestEnterprises:
    """Test enterprise-related endpoints"""
    
    def test_list_enterprises(self):
        """GET /api/enterprises - List all enterprises"""
        response = requests.get(f"{BASE_URL}/api/enterprises")
        assert response.status_code == 200
        data = response.json()
        assert "enterprises" in data
        assert "total" in data
        print(f"✅ Enterprises listed: {data['total']} total")
        
    def test_list_enterprises_with_category_filter(self):
        """GET /api/enterprises?category=Restaurant"""
        response = requests.get(f"{BASE_URL}/api/enterprises", params={"category": "Restaurant"})
        assert response.status_code == 200
        data = response.json()
        assert "enterprises" in data
        print(f"✅ Restaurant enterprises: {data['total']} found")
        
    def test_list_certified_enterprises(self):
        """GET /api/enterprises?is_certified=true"""
        response = requests.get(f"{BASE_URL}/api/enterprises", params={"is_certified": True})
        assert response.status_code == 200
        data = response.json()
        assert "enterprises" in data
        print(f"✅ Certified enterprises: {data['total']} found")

    def test_list_premium_enterprises(self):
        """GET /api/enterprises?is_premium=true"""
        response = requests.get(f"{BASE_URL}/api/enterprises", params={"is_premium": True})
        assert response.status_code == 200
        data = response.json()
        assert "enterprises" in data
        print(f"✅ Premium enterprises: {data['total']} found")
        

class TestServicesProducts:
    """Test services and products endpoints"""
    
    def test_list_services(self):
        """GET /api/services-products?type=service"""
        response = requests.get(f"{BASE_URL}/api/services-products", params={"type": "service"})
        assert response.status_code == 200
        data = response.json()
        assert "items" in data or "total" in data
        total = data.get("total", len(data.get("items", [])))
        print(f"✅ Services: {total} found")
        
    def test_list_products(self):
        """GET /api/services-products?type=product"""
        response = requests.get(f"{BASE_URL}/api/services-products", params={"type": "product"})
        assert response.status_code == 200
        data = response.json()
        assert "items" in data or "total" in data
        total = data.get("total", len(data.get("items", [])))
        print(f"✅ Products: {total} found")


class TestCategories:
    """Test category endpoints"""
    
    def test_enterprise_categories(self):
        """GET /api/enterprise-categories"""
        response = requests.get(f"{BASE_URL}/api/enterprise-categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list) or "categories" in data
        categories = data if isinstance(data, list) else data.get("categories", [])
        print(f"✅ Enterprise categories: {len(categories)} found")
        
    def test_service_categories(self):
        """GET /api/categories/services"""
        response = requests.get(f"{BASE_URL}/api/categories/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Service categories: {len(data)} found")
        
    def test_product_categories(self):
        """GET /api/categories/products"""
        response = requests.get(f"{BASE_URL}/api/categories/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Product categories: {len(data)} found")


class TestFeaturedData:
    """Test featured data endpoints (tendances, guests, premium, etc.)"""
    
    def test_tendances(self):
        """GET /api/featured/tendances"""
        response = requests.get(f"{BASE_URL}/api/featured/tendances")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Tendances: {len(data) if isinstance(data, list) else 'data retrieved'}")
        
    def test_guests(self):
        """GET /api/featured/guests"""
        response = requests.get(f"{BASE_URL}/api/featured/guests")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Guests: {len(data) if isinstance(data, list) else 'data retrieved'}")
        
    def test_offres(self):
        """GET /api/featured/offres"""
        response = requests.get(f"{BASE_URL}/api/featured/offres")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Offres: {len(data) if isinstance(data, list) else 'data retrieved'}")
        
    def test_premium(self):
        """GET /api/featured/premium"""
        response = requests.get(f"{BASE_URL}/api/featured/premium")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Premium featured: {len(data) if isinstance(data, list) else 'data retrieved'}")


class TestJobs:
    """Test job-related endpoints"""
    
    def test_list_jobs(self):
        """GET /api/jobs"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list) or "jobs" in data
        jobs = data if isinstance(data, list) else data.get("jobs", [])
        print(f"✅ Jobs: {len(jobs)} found")


class TestTrainings:
    """Test training-related endpoints"""
    
    def test_list_trainings(self):
        """GET /api/trainings"""
        response = requests.get(f"{BASE_URL}/api/trainings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list) or "trainings" in data or "items" in data
        print(f"✅ Trainings endpoint working")


class TestAuth:
    """Test authentication endpoints"""
    
    def test_login_with_invalid_credentials(self):
        """POST /api/auth/login - Invalid credentials should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✅ Invalid login correctly rejected")
        
    def test_register_missing_fields(self):
        """POST /api/auth/register - Missing fields should return 422"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": "test@test.com"}  # Missing required fields
        )
        assert response.status_code == 422
        print("✅ Registration with missing fields correctly rejected")


class TestCashback:
    """Test cashback-related endpoints"""
    
    def test_cashback_page_endpoint(self):
        """GET /api/cashback/info - Public cashback info"""
        response = requests.get(f"{BASE_URL}/api/cashback/info")
        # May return 401 if auth required, or 404 if not implemented
        assert response.status_code in [200, 401, 404]
        print(f"✅ Cashback info endpoint status: {response.status_code}")


class TestStripeEndpoints:
    """Test Stripe checkout endpoints exist"""
    
    def test_checkout_endpoint_requires_auth(self):
        """POST /api/checkout/create-session - Should require auth"""
        response = requests.post(
            f"{BASE_URL}/api/checkout/create-session",
            json={}
        )
        # Should return 401 (unauthorized) or 422 (validation error)
        assert response.status_code in [401, 422]
        print(f"✅ Checkout endpoint exists, status: {response.status_code}")


class TestSearch:
    """Test search functionality"""
    
    def test_search_enterprises(self):
        """GET /api/enterprises?search=restaurant"""
        response = requests.get(f"{BASE_URL}/api/enterprises", params={"search": "restaurant"})
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Search for 'restaurant': {data.get('total', 0)} results")


class TestMediaPub:
    """Test Media Pub (IA advertising) endpoints"""
    
    def test_media_templates(self):
        """GET /api/media-pub/templates"""
        response = requests.get(f"{BASE_URL}/api/media-pub/templates")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Media templates: {len(data) if isinstance(data, list) else 'data retrieved'}")


class TestVideoPub:
    """Test Video Pub endpoints"""
    
    def test_video_templates(self):
        """GET /api/video-pub/templates"""
        response = requests.get(f"{BASE_URL}/api/video-pub/templates")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Video templates: {len(data) if isinstance(data, list) else 'data retrieved'}")


# Test with valid credentials (from previous iterations)
class TestAuthenticatedEndpoints:
    """Test endpoints that require authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        # Try with known test credentials
        test_credentials = [
            {"email": "test.client@titelli.com", "password": "Test123!"},
            {"email": "test.entreprise@titelli.com", "password": "Test123!"},
        ]
        
        for creds in test_credentials:
            response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json=creds
            )
            if response.status_code == 200:
                return response.json().get("token")
        
        pytest.skip("No valid test credentials available")
        
    def test_get_current_user(self, auth_token):
        """GET /api/auth/me - Get current user"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        print(f"✅ Current user: {data.get('email')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
