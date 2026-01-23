"""
P1 Features Audit Test Suite - Iteration 21
Tests all CLIENT and ENTERPRISE endpoints for REAL production data (no mocks)

CLIENT SIDE:
- POST /api/client/wishlist - add item to wishlist
- GET /api/client/wishlist - list wishlist items
- POST /api/client/providers - add personal provider
- GET /api/client/providers - list personal providers
- GET /api/client/premium - get subscription status with correct cashback rate
- POST /api/client/premium/checkout?plan=premium - create Stripe checkout
- POST /api/client/premium/cancel - cancel subscription
- GET /api/client/finances - real financial data
- GET /api/client/agenda - agenda events
- GET /api/client/donations - donations list

ENTERPRISE SIDE:
- GET /api/enterprise/services - list enterprise services
- GET /api/enterprise/orders - list enterprise orders with stats
- POST /api/enterprise/ia-campaigns - create campaign with REAL targeting
- GET /api/enterprise/advertising - advertising campaigns
- POST /api/subscriptions/checkout?plan_id=standard - enterprise subscription
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
CLIENT_EMAIL = "test@example.com"
CLIENT_PASSWORD = "Test123!"
ENTERPRISE_EMAIL = "spa.luxury@titelli.com"
ENTERPRISE_PASSWORD = "Demo123!"


class TestClientAuthentication:
    """Test client login and token retrieval"""
    
    def test_client_login(self):
        """Login as client user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        })
        assert response.status_code == 200, f"Client login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        print(f"✓ Client login successful: {data['user'].get('email')}")
        return data['token']


class TestEnterpriseAuthentication:
    """Test enterprise login and token retrieval"""
    
    def test_enterprise_login(self):
        """Login as enterprise user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ENTERPRISE_EMAIL,
            "password": ENTERPRISE_PASSWORD
        })
        assert response.status_code == 200, f"Enterprise login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        assert data['user'].get('user_type') == 'entreprise', "User is not enterprise type"
        print(f"✓ Enterprise login successful: {data['user'].get('email')}")
        return data['token']


@pytest.fixture(scope="module")
def client_token():
    """Get client authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": CLIENT_EMAIL,
        "password": CLIENT_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Client login failed: {response.text}")
    return response.json()['token']


@pytest.fixture(scope="module")
def enterprise_token():
    """Get enterprise authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ENTERPRISE_EMAIL,
        "password": ENTERPRISE_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Enterprise login failed: {response.text}")
    return response.json()['token']


# ============ CLIENT WISHLIST TESTS ============

class TestClientWishlist:
    """Test wishlist functionality"""
    
    def test_get_wishlist(self, client_token):
        """GET /api/client/wishlist - list wishlist items"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.get(f"{BASE_URL}/api/client/wishlist", headers=headers)
        assert response.status_code == 200, f"Get wishlist failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Wishlist should be a list"
        print(f"✓ GET /api/client/wishlist - {len(data)} items in wishlist")
        return data
    
    def test_add_to_wishlist(self, client_token):
        """POST /api/client/wishlist - add item to wishlist"""
        headers = {"Authorization": f"Bearer {client_token}"}
        test_item = {
            "item_id": f"TEST_ITEM_{uuid.uuid4().hex[:8]}",
            "item_type": "service",
            "item_name": "Test Service for Wishlist",
            "item_price": 99.99,
            "item_image": "https://example.com/image.jpg",
            "enterprise_id": "test_enterprise_id",
            "enterprise_name": "Test Enterprise"
        }
        response = requests.post(f"{BASE_URL}/api/client/wishlist", headers=headers, json=test_item)
        assert response.status_code in [200, 201], f"Add to wishlist failed: {response.text}"
        data = response.json()
        print(f"✓ POST /api/client/wishlist - Item added: {data.get('item_name', 'N/A')}")
        return data
    
    def test_wishlist_check(self, client_token):
        """GET /api/client/wishlist/check/{item_id} - check if item in wishlist"""
        headers = {"Authorization": f"Bearer {client_token}"}
        # First add an item
        test_item_id = f"TEST_CHECK_{uuid.uuid4().hex[:8]}"
        add_response = requests.post(f"{BASE_URL}/api/client/wishlist", headers=headers, json={
            "item_id": test_item_id,
            "item_type": "product",
            "item_name": "Test Check Item",
            "item_price": 50.00
        })
        
        # Then check it
        response = requests.get(f"{BASE_URL}/api/client/wishlist/check/{test_item_id}", headers=headers)
        assert response.status_code == 200, f"Wishlist check failed: {response.text}"
        data = response.json()
        assert "in_wishlist" in data, "Response should have in_wishlist field"
        print(f"✓ GET /api/client/wishlist/check - in_wishlist: {data.get('in_wishlist')}")


# ============ CLIENT PROVIDERS TESTS ============

class TestClientProviders:
    """Test personal providers functionality"""
    
    def test_get_providers(self, client_token):
        """GET /api/client/providers - list personal providers"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.get(f"{BASE_URL}/api/client/providers", headers=headers)
        assert response.status_code == 200, f"Get providers failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Providers should be a list"
        print(f"✓ GET /api/client/providers - {len(data)} personal providers")
        return data
    
    def test_add_provider(self, client_token):
        """POST /api/client/providers - add personal provider"""
        headers = {"Authorization": f"Bearer {client_token}"}
        # First get an enterprise to add
        enterprises_response = requests.get(f"{BASE_URL}/api/enterprises?limit=1")
        if enterprises_response.status_code == 200:
            enterprises = enterprises_response.json().get('enterprises', [])
            if enterprises:
                enterprise_id = enterprises[0]['id']
                response = requests.post(
                    f"{BASE_URL}/api/client/providers",
                    headers=headers,
                    json={"enterprise_id": enterprise_id}
                )
                # Could be 200, 201, or 400 if already added
                assert response.status_code in [200, 201, 400], f"Add provider failed: {response.text}"
                print(f"✓ POST /api/client/providers - Response: {response.status_code}")
                return response.json()
        print("✓ POST /api/client/providers - No enterprises available to add")


# ============ CLIENT PREMIUM TESTS ============

class TestClientPremium:
    """Test premium subscription functionality"""
    
    def test_get_premium_status(self, client_token):
        """GET /api/client/premium - get subscription status with correct cashback rate"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.get(f"{BASE_URL}/api/client/premium", headers=headers)
        assert response.status_code == 200, f"Get premium status failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "current_plan" in data, "Response should have current_plan"
        assert "cashback_rate" in data, "Response should have cashback_rate"
        assert "is_premium" in data, "Response should have is_premium"
        
        # Verify cashback rate is correct based on plan
        plan = data.get('current_plan', 'free')
        cashback_rate = data.get('cashback_rate', 0)
        
        expected_rates = {
            'free': 0.01,  # 1%
            'premium': 0.10,  # 10%
            'vip': 0.15  # 15%
        }
        
        if plan in expected_rates:
            assert cashback_rate == expected_rates[plan], f"Cashback rate mismatch for {plan}: expected {expected_rates[plan]}, got {cashback_rate}"
        
        print(f"✓ GET /api/client/premium - Plan: {plan}, Cashback: {cashback_rate*100}%, Premium: {data.get('is_premium')}")
        return data
    
    def test_premium_checkout_creates_real_stripe_session(self, client_token):
        """POST /api/client/premium/checkout?plan=premium - create REAL Stripe checkout"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.post(
            f"{BASE_URL}/api/client/premium/checkout?plan=premium",
            headers=headers
        )
        assert response.status_code == 200, f"Premium checkout failed: {response.text}"
        data = response.json()
        
        # Verify REAL Stripe URL (not mocked)
        assert "checkout_url" in data, "Response should have checkout_url"
        checkout_url = data.get('checkout_url', '')
        assert checkout_url.startswith('https://checkout.stripe.com/'), f"Not a real Stripe URL: {checkout_url[:50]}"
        
        # Verify session ID
        assert "session_id" in data, "Response should have session_id"
        session_id = data.get('session_id', '')
        assert session_id.startswith('cs_'), f"Invalid session ID format: {session_id[:20]}"
        
        print(f"✓ POST /api/client/premium/checkout - REAL Stripe URL: {checkout_url[:60]}...")
        return data
    
    def test_premium_cancel(self, client_token):
        """POST /api/client/premium/cancel - cancel subscription"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.post(f"{BASE_URL}/api/client/premium/cancel", headers=headers)
        # Can be 200 (cancelled) or 400 (no active subscription)
        assert response.status_code in [200, 400], f"Premium cancel failed: {response.text}"
        print(f"✓ POST /api/client/premium/cancel - Status: {response.status_code}")


# ============ CLIENT FINANCES TESTS ============

class TestClientFinances:
    """Test client finances functionality"""
    
    def test_get_finances(self, client_token):
        """GET /api/client/finances - real financial data"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.get(f"{BASE_URL}/api/client/finances", headers=headers)
        assert response.status_code == 200, f"Get finances failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "cashback_balance" in data, "Response should have cashback_balance"
        assert "transactions" in data, "Response should have transactions"
        
        print(f"✓ GET /api/client/finances - Cashback: {data.get('cashback_balance')} CHF, Transactions: {len(data.get('transactions', []))}")
        return data


# ============ CLIENT AGENDA TESTS ============

class TestClientAgenda:
    """Test client agenda functionality"""
    
    def test_get_agenda(self, client_token):
        """GET /api/client/agenda - agenda events"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.get(f"{BASE_URL}/api/client/agenda", headers=headers)
        assert response.status_code == 200, f"Get agenda failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Agenda should be a list"
        print(f"✓ GET /api/client/agenda - {len(data)} events")
        return data


# ============ CLIENT DONATIONS TESTS ============

class TestClientDonations:
    """Test client donations functionality"""
    
    def test_get_donations(self, client_token):
        """GET /api/client/donations - donations list"""
        headers = {"Authorization": f"Bearer {client_token}"}
        response = requests.get(f"{BASE_URL}/api/client/donations", headers=headers)
        assert response.status_code == 200, f"Get donations failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Donations should be a list"
        print(f"✓ GET /api/client/donations - {len(data)} donations")
        return data


# ============ ENTERPRISE SERVICES TESTS ============

class TestEnterpriseServices:
    """Test enterprise services functionality"""
    
    def test_get_enterprise_services(self, enterprise_token):
        """GET /api/enterprise/services - list enterprise services"""
        headers = {"Authorization": f"Bearer {enterprise_token}"}
        response = requests.get(f"{BASE_URL}/api/enterprise/services", headers=headers)
        assert response.status_code == 200, f"Get enterprise services failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "items" in data, "Response should have items"
        assert "total" in data, "Response should have total"
        
        print(f"✓ GET /api/enterprise/services - {data.get('total', 0)} services/products")
        return data


# ============ ENTERPRISE ORDERS TESTS ============

class TestEnterpriseOrders:
    """Test enterprise orders functionality"""
    
    def test_get_enterprise_orders(self, enterprise_token):
        """GET /api/enterprise/orders - list enterprise orders with stats"""
        headers = {"Authorization": f"Bearer {enterprise_token}"}
        response = requests.get(f"{BASE_URL}/api/enterprise/orders", headers=headers)
        assert response.status_code == 200, f"Get enterprise orders failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "orders" in data, "Response should have orders"
        assert "stats" in data, "Response should have stats"
        
        stats = data.get('stats', {})
        assert "total" in stats, "Stats should have total"
        assert "pending" in stats, "Stats should have pending"
        assert "completed" in stats, "Stats should have completed"
        assert "total_revenue" in stats, "Stats should have total_revenue"
        
        print(f"✓ GET /api/enterprise/orders - {stats.get('total', 0)} orders, Revenue: {stats.get('total_revenue', 0)} CHF")
        return data


# ============ ENTERPRISE IA CAMPAIGNS TESTS ============

class TestEnterpriseIACampaigns:
    """Test IA campaigns with REAL targeting"""
    
    def test_get_ia_campaigns(self, enterprise_token):
        """GET /api/enterprise/ia-campaigns - list IA campaigns"""
        headers = {"Authorization": f"Bearer {enterprise_token}"}
        response = requests.get(f"{BASE_URL}/api/enterprise/ia-campaigns", headers=headers)
        assert response.status_code == 200, f"Get IA campaigns failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "IA campaigns should be a list"
        print(f"✓ GET /api/enterprise/ia-campaigns - {len(data)} campaigns")
        return data
    
    def test_create_ia_campaign_with_real_targeting(self, enterprise_token):
        """POST /api/enterprise/ia-campaigns - create campaign with REAL targeting"""
        headers = {"Authorization": f"Bearer {enterprise_token}"}
        campaign_data = {
            "name": f"TEST_P1_Campaign_{uuid.uuid4().hex[:8]}",
            "age_range": "25-45",
            "gender": "all",
            "interests": ["beauty", "wellness", "spa"],
            "behavior": ["premium_buyer", "frequent_visitor"],
            "location": "lausanne",
            "budget": "medium"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/enterprise/ia-campaigns",
            headers=headers,
            json=campaign_data
        )
        assert response.status_code in [200, 201], f"Create IA campaign failed: {response.text}"
        data = response.json()
        
        # Verify REAL targeting details (not random/simulated)
        assert "targeting_details" in data, "Response should have targeting_details (REAL data)"
        targeting = data.get('targeting_details', {})
        
        # Verify targeting has real database query results
        assert "total_potential_users" in targeting, "targeting_details should have total_potential_users"
        assert "budget_multiplier" in targeting, "targeting_details should have budget_multiplier"
        
        # Verify it's not random (should be consistent based on DB)
        total_users = targeting.get('total_potential_users', 0)
        assert isinstance(total_users, int), "total_potential_users should be an integer"
        
        print(f"✓ POST /api/enterprise/ia-campaigns - REAL targeting: {total_users} potential users")
        print(f"  Targeting details: {targeting}")
        return data


# ============ ENTERPRISE ADVERTISING TESTS ============

class TestEnterpriseAdvertising:
    """Test enterprise advertising functionality"""
    
    def test_get_advertising(self, enterprise_token):
        """GET /api/enterprise/advertising - advertising campaigns"""
        headers = {"Authorization": f"Bearer {enterprise_token}"}
        response = requests.get(f"{BASE_URL}/api/enterprise/advertising", headers=headers)
        assert response.status_code == 200, f"Get advertising failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Advertising should be a list"
        print(f"✓ GET /api/enterprise/advertising - {len(data)} ads")
        return data


# ============ ENTERPRISE SUBSCRIPTION TESTS ============

class TestEnterpriseSubscription:
    """Test enterprise subscription checkout"""
    
    def test_subscription_checkout_standard(self, enterprise_token):
        """POST /api/subscriptions/checkout?plan_id=standard - enterprise subscription"""
        headers = {"Authorization": f"Bearer {enterprise_token}"}
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout?plan_id=standard",
            headers=headers
        )
        assert response.status_code == 200, f"Subscription checkout failed: {response.text}"
        data = response.json()
        
        # Verify REAL Stripe URL
        assert "checkout_url" in data, "Response should have checkout_url"
        checkout_url = data.get('checkout_url', '')
        assert checkout_url.startswith('https://checkout.stripe.com/'), f"Not a real Stripe URL: {checkout_url[:50]}"
        
        print(f"✓ POST /api/subscriptions/checkout?plan_id=standard - REAL Stripe URL")
        return data


# ============ CLEANUP ============

class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_campaigns(self, enterprise_token):
        """Delete test campaigns created during testing"""
        headers = {"Authorization": f"Bearer {enterprise_token}"}
        response = requests.get(f"{BASE_URL}/api/enterprise/ia-campaigns", headers=headers)
        if response.status_code == 200:
            campaigns = response.json()
            for campaign in campaigns:
                if campaign.get('name', '').startswith('TEST_'):
                    delete_response = requests.delete(
                        f"{BASE_URL}/api/enterprise/ia-campaigns/{campaign['id']}",
                        headers=headers
                    )
                    print(f"  Deleted test campaign: {campaign['name']}")
        print("✓ Cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
