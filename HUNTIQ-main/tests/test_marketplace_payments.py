"""
Test suite for Hunt Marketplace and Stripe Payment Integration
- Marketplace seller authentication (register, login)
- Marketplace listings CRUD
- Payment packages API
- Stripe checkout session creation
- Payment status verification
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_EMAIL_PREFIX = f"TEST_marketplace_{int(datetime.now().timestamp())}"


class TestPaymentPackages:
    """Test /api/payments/packages endpoint"""
    
    def test_get_all_packages(self):
        """Test fetching all payment packages"""
        response = requests.get(f"{BASE_URL}/api/payments/packages")
        assert response.status_code == 200
        
        data = response.json()
        assert "packages" in data
        assert "categories" in data
        assert len(data["packages"]) == 11  # Total packages defined
        
        # Verify categories
        categories = data["categories"]
        assert "featured" in categories
        assert "auto_bump" in categories
        assert "renewal" in categories
        assert "subscriptions" in categories
        assert "outfitter" in categories
    
    def test_packages_have_required_fields(self):
        """Test that each package has required fields"""
        response = requests.get(f"{BASE_URL}/api/payments/packages")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "description", "amount", "currency", "type", "duration_days", "features"]
        
        for pkg in data["packages"]:
            for field in required_fields:
                assert field in pkg, f"Package {pkg.get('id', 'unknown')} missing field: {field}"
    
    def test_filter_packages_by_type(self):
        """Test filtering packages by type"""
        # Test one_time filter
        response = requests.get(f"{BASE_URL}/api/payments/packages?package_type=one_time")
        assert response.status_code == 200
        data = response.json()
        for pkg in data["packages"]:
            assert pkg["type"] == "one_time"
        
        # Test subscription filter
        response = requests.get(f"{BASE_URL}/api/payments/packages?package_type=subscription")
        assert response.status_code == 200
        data = response.json()
        for pkg in data["packages"]:
            assert pkg["type"] == "subscription"
    
    def test_featured_packages_pricing(self):
        """Test featured packages have correct pricing"""
        response = requests.get(f"{BASE_URL}/api/payments/packages")
        data = response.json()
        
        featured = {p["id"]: p for p in data["categories"]["featured"]}
        
        assert featured["featured_7days"]["amount"] == 9.99
        assert featured["featured_14days"]["amount"] == 14.99
        assert featured["featured_30days"]["amount"] == 24.99
    
    def test_pro_subscription_packages(self):
        """Test PRO subscription packages"""
        response = requests.get(f"{BASE_URL}/api/payments/packages")
        data = response.json()
        
        subscriptions = {p["id"]: p for p in data["categories"]["subscriptions"]}
        
        assert "pro_monthly" in subscriptions
        assert "pro_yearly" in subscriptions
        assert subscriptions["pro_monthly"]["amount"] == 19.99
        assert subscriptions["pro_yearly"]["amount"] == 199.99
    
    def test_outfitter_packages(self):
        """Test outfitter packages"""
        response = requests.get(f"{BASE_URL}/api/payments/packages")
        data = response.json()
        
        outfitter = {p["id"]: p for p in data["categories"]["outfitter"]}
        
        assert "outfitter_basic" in outfitter
        assert "outfitter_premium" in outfitter
        assert outfitter["outfitter_basic"]["amount"] == 49.99
        assert outfitter["outfitter_premium"]["amount"] == 99.99


class TestMarketplaceAuth:
    """Test /api/marketplace/auth endpoints"""
    
    @pytest.fixture
    def test_user_data(self):
        """Generate unique test user data"""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "email": f"{TEST_EMAIL_PREFIX}_{unique_id}@test.com",
            "password": "TestPassword123",
            "name": f"Test User {unique_id}",
            "phone": "514-555-1234",
            "location": "Montréal"
        }
    
    def test_register_seller(self, test_user_data):
        """Test seller registration"""
        response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=test_user_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "seller" in data
        assert data["seller"]["email"] == test_user_data["email"].lower()
        assert data["seller"]["name"] == test_user_data["name"]
        assert data["seller"]["is_pro"] == False
        assert data["seller"]["free_listings_remaining"] == 3
    
    def test_register_duplicate_email(self, test_user_data):
        """Test registration with duplicate email fails"""
        # First registration
        response1 = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=test_user_data
        )
        assert response1.status_code == 200
        
        # Second registration with same email
        response2 = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=test_user_data
        )
        assert response2.status_code == 400
        assert "déjà utilisé" in response2.json()["detail"]
    
    def test_login_seller(self, test_user_data):
        """Test seller login"""
        # First register
        requests.post(f"{BASE_URL}/api/marketplace/auth/register", json=test_user_data)
        
        # Then login
        response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["seller"]["email"] == test_user_data["email"].lower()
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"]
    
    def test_get_current_seller(self, test_user_data):
        """Test getting current seller profile"""
        # Register and get token
        reg_response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=test_user_data
        )
        token = reg_response.json()["token"]
        
        # Get profile
        response = requests.get(f"{BASE_URL}/api/marketplace/auth/me?token={token}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == test_user_data["email"].lower()
        assert data["name"] == test_user_data["name"]
        assert data["is_pro"] == False
    
    def test_get_current_seller_invalid_token(self):
        """Test getting profile with invalid token"""
        response = requests.get(f"{BASE_URL}/api/marketplace/auth/me?token=invalid_token")
        assert response.status_code == 401


class TestMarketplaceListings:
    """Test /api/marketplace/listings endpoints"""
    
    @pytest.fixture
    def authenticated_seller(self):
        """Create and authenticate a test seller"""
        unique_id = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"{TEST_EMAIL_PREFIX}_listing_{unique_id}@test.com",
            "password": "TestPassword123",
            "name": f"Test Seller {unique_id}",
            "phone": "514-555-1234",
            "location": "Montréal"
        }
        response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=user_data
        )
        data = response.json()
        return {
            "token": data["token"],
            "seller_id": data["seller"]["id"],
            "seller_name": data["seller"]["name"]
        }
    
    def test_get_listings(self):
        """Test fetching listings"""
        response = requests.get(f"{BASE_URL}/api/marketplace/listings")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        assert "has_more" in data
    
    def test_create_listing(self, authenticated_seller):
        """Test creating a new listing"""
        listing_data = {
            "title": "TEST Carabine de chasse - Test automatisé",
            "description": "Ceci est une annonce de test créée automatiquement pour les tests. Elle sera supprimée après les tests.",
            "price": 999.99,
            "price_negotiable": True,
            "category": "armes-munitions",
            "listing_type": "a-vendre",
            "condition": "excellent",
            "target_species": ["orignal", "chevreuil"],
            "location": "Montréal",
            "region": "Montréal"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/marketplace/listings?token={authenticated_seller['token']}",
            json=listing_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "listing" in data
        assert data["listing"]["title"] == listing_data["title"]
        assert data["listing"]["price"] == listing_data["price"]
        assert data["listing"]["seller_id"] == authenticated_seller["seller_id"]
        
        # Cleanup - delete the listing
        listing_id = data["listing"]["id"]
        requests.delete(f"{BASE_URL}/api/marketplace/listings/{listing_id}?token={authenticated_seller['token']}")
    
    def test_create_listing_without_auth(self):
        """Test creating listing without authentication fails"""
        listing_data = {
            "title": "TEST Unauthorized listing",
            "description": "This should fail because no token provided",
            "price": 100,
            "category": "autre",
            "listing_type": "a-vendre",
            "location": "Test"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/marketplace/listings?token=invalid_token",
            json=listing_data
        )
        assert response.status_code == 401
    
    def test_get_single_listing(self):
        """Test fetching a single listing"""
        # First get all listings
        list_response = requests.get(f"{BASE_URL}/api/marketplace/listings")
        listings = list_response.json()["listings"]
        
        if len(listings) > 0:
            listing_id = listings[0]["id"]
            response = requests.get(f"{BASE_URL}/api/marketplace/listings/{listing_id}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["id"] == listing_id
            assert "title" in data
            assert "price" in data
    
    def test_get_nonexistent_listing(self):
        """Test fetching non-existent listing returns 404"""
        response = requests.get(f"{BASE_URL}/api/marketplace/listings/nonexistent-id")
        assert response.status_code == 404
    
    def test_filter_listings_by_category(self):
        """Test filtering listings by category"""
        response = requests.get(f"{BASE_URL}/api/marketplace/listings?category=armes-munitions")
        assert response.status_code == 200
        
        data = response.json()
        for listing in data["listings"]:
            assert listing["category"] == "armes-munitions"
    
    def test_search_listings(self):
        """Test searching listings"""
        response = requests.get(f"{BASE_URL}/api/marketplace/listings?search=carabine")
        assert response.status_code == 200
        
        data = response.json()
        # Search should return results (if any match)
        assert "listings" in data
    
    def test_my_listings(self, authenticated_seller):
        """Test getting seller's own listings"""
        response = requests.get(
            f"{BASE_URL}/api/marketplace/my-listings?token={authenticated_seller['token']}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        assert "seller" in data
        assert data["seller"]["id"] == authenticated_seller["seller_id"]


class TestStripeCheckout:
    """Test /api/payments/checkout endpoint"""
    
    @pytest.fixture
    def test_seller(self):
        """Create a test seller for checkout tests"""
        unique_id = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"{TEST_EMAIL_PREFIX}_checkout_{unique_id}@test.com",
            "password": "TestPassword123",
            "name": f"Test Checkout User {unique_id}"
        }
        response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=user_data
        )
        data = response.json()
        return {
            "token": data["token"],
            "seller_id": data["seller"]["id"]
        }
    
    def test_create_checkout_session_featured(self, test_seller):
        """Test creating checkout session for featured listing"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "featured_7days",
                "origin_url": "https://forestbionic.preview.emergentagent.com",
                "seller_id": test_seller["seller_id"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert "package" in data
        assert data["url"].startswith("https://checkout.stripe.com")
        assert data["package"]["id"] == "featured_7days"
        assert data["package"]["amount"] == 9.99
    
    def test_create_checkout_session_pro_monthly(self, test_seller):
        """Test creating checkout session for PRO monthly subscription"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "pro_monthly",
                "origin_url": "https://forestbionic.preview.emergentagent.com",
                "seller_id": test_seller["seller_id"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["url"].startswith("https://checkout.stripe.com")
        assert data["package"]["id"] == "pro_monthly"
        assert data["package"]["amount"] == 19.99
        assert data["package"]["type"] == "subscription"
    
    def test_create_checkout_session_outfitter(self, test_seller):
        """Test creating checkout session for outfitter package"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "outfitter_premium",
                "origin_url": "https://forestbionic.preview.emergentagent.com",
                "seller_id": test_seller["seller_id"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["url"].startswith("https://checkout.stripe.com")
        assert data["package"]["id"] == "outfitter_premium"
        assert data["package"]["amount"] == 99.99
    
    def test_create_checkout_invalid_package(self):
        """Test checkout with invalid package ID fails"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "invalid_package_id",
                "origin_url": "https://forestbionic.preview.emergentagent.com"
            }
        )
        assert response.status_code == 400
        assert "Invalid package ID" in response.json()["detail"]
    
    def test_checkout_with_listing_id(self, test_seller):
        """Test checkout with listing ID for listing-specific purchases"""
        # Get a listing ID
        listings_response = requests.get(f"{BASE_URL}/api/marketplace/listings")
        listings = listings_response.json()["listings"]
        
        if len(listings) > 0:
            listing_id = listings[0]["id"]
            
            response = requests.post(
                f"{BASE_URL}/api/payments/checkout",
                json={
                    "package_id": "featured_7days",
                    "origin_url": "https://forestbionic.preview.emergentagent.com",
                    "seller_id": test_seller["seller_id"],
                    "listing_id": listing_id
                }
            )
            assert response.status_code == 200
            assert "session_id" in response.json()


class TestPaymentStatus:
    """Test /api/payments/status endpoint"""
    
    def test_get_payment_status_valid_session(self):
        """Test getting payment status for a valid session"""
        # First create a checkout session
        unique_id = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"{TEST_EMAIL_PREFIX}_status_{unique_id}@test.com",
            "password": "TestPassword123",
            "name": f"Test Status User {unique_id}"
        }
        reg_response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=user_data
        )
        seller_id = reg_response.json()["seller"]["id"]
        
        # Create checkout session
        checkout_response = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "featured_7days",
                "origin_url": "https://forestbionic.preview.emergentagent.com",
                "seller_id": seller_id
            }
        )
        session_id = checkout_response.json()["session_id"]
        
        # Check status
        response = requests.get(f"{BASE_URL}/api/payments/status/{session_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "payment_status" in data
        assert "amount" in data
        assert "currency" in data
        assert "package_id" in data
        assert data["payment_status"] == "unpaid"  # Not paid yet
        assert data["package_id"] == "featured_7days"
    
    def test_get_payment_status_invalid_session(self):
        """Test getting payment status for invalid session returns 404"""
        response = requests.get(f"{BASE_URL}/api/payments/status/invalid_session_id")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestPaymentTransactions:
    """Test /api/payments/transactions endpoint"""
    
    def test_get_transactions(self):
        """Test fetching payment transactions"""
        response = requests.get(f"{BASE_URL}/api/payments/transactions")
        assert response.status_code == 200
        
        data = response.json()
        assert "transactions" in data
    
    def test_get_transactions_by_seller(self):
        """Test fetching transactions filtered by seller"""
        # Create a seller and checkout session first
        unique_id = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"{TEST_EMAIL_PREFIX}_trans_{unique_id}@test.com",
            "password": "TestPassword123",
            "name": f"Test Trans User {unique_id}"
        }
        reg_response = requests.post(
            f"{BASE_URL}/api/marketplace/auth/register",
            json=user_data
        )
        seller_id = reg_response.json()["seller"]["id"]
        
        # Create a checkout session to generate a transaction
        requests.post(
            f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "auto_bump_7days",
                "origin_url": "https://forestbionic.preview.emergentagent.com",
                "seller_id": seller_id
            }
        )
        
        # Get transactions for this seller
        response = requests.get(f"{BASE_URL}/api/payments/transactions?seller_id={seller_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "transactions" in data
        # All transactions should belong to this seller
        for trans in data["transactions"]:
            assert trans["seller_id"] == seller_id


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
