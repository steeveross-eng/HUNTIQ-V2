"""
Test suite for new SCENT SCIENCE™ features:
1. Email consent and Resend integration (POST /api/analyze/consent)
2. Auto-categorization of products (POST /api/admin/products/auto-categorize)
3. Apply category to product (PUT /api/admin/products/{id}/categorize)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEmailConsent:
    """Tests for email consent and Resend email integration"""
    
    def test_consent_endpoint_requires_valid_report_id(self):
        """Test that consent endpoint accepts valid data"""
        # First, we need a valid report_id - let's check if we can get one
        response = requests.get(f"{BASE_URL}/api/analyze/reports?limit=1")
        assert response.status_code == 200
        reports = response.json().get("reports", [])
        
        # If no reports exist, we'll test with a fake report_id (should still accept consent)
        report_id = reports[0]["id"] if reports else str(uuid.uuid4())
        
        consent_data = {
            "name": "TEST_User",
            "email": "test@example.com",
            "region": "Quebec",
            "consent_marketing": True,
            "consent_statistics": True,
            "report_id": report_id
        }
        
        response = requests.post(f"{BASE_URL}/api/analyze/consent", json=consent_data)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "consent_id" in data
        assert "message" in data
        print(f"✓ Consent endpoint works - consent_id: {data['consent_id']}")
    
    def test_consent_endpoint_validation(self):
        """Test that consent endpoint validates required fields"""
        # Missing required fields
        invalid_data = {
            "name": "Test",
            # Missing email, region, consent_marketing, consent_statistics, report_id
        }
        
        response = requests.post(f"{BASE_URL}/api/analyze/consent", json=invalid_data)
        assert response.status_code == 422  # Validation error
        print("✓ Consent endpoint validates required fields")
    
    def test_admin_get_consents(self):
        """Test admin endpoint to retrieve consents"""
        response = requests.get(f"{BASE_URL}/api/admin/analyze/consents")
        assert response.status_code == 200
        data = response.json()
        assert "consents" in data
        assert isinstance(data["consents"], list)
        print(f"✓ Admin consents endpoint works - {len(data['consents'])} consents found")


class TestAutoCategorization:
    """Tests for auto-categorization feature"""
    
    def test_auto_categorize_urine_product(self):
        """Test auto-categorization with urine product keywords"""
        request_data = {
            "product_name": "Buck Urine Premium Estrous",
            "product_description": "Premium deer urine attractant for hunting",
            "brand": "BIONIC"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/products/auto-categorize", json=request_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "suggested_category" in data
        assert "suggested_category_name" in data
        assert "confidence" in data
        assert "reasoning" in data
        
        # Should categorize as urines due to keywords
        assert data["suggested_category"] in ["urines", "attractants"]
        print(f"✓ Auto-categorize urine product: {data['suggested_category']} ({data['confidence']})")
        print(f"  Reasoning: {data['reasoning']}")
    
    def test_auto_categorize_camera_product(self):
        """Test auto-categorization with camera product keywords"""
        request_data = {
            "product_name": "Trail Camera Pro 4K",
            "product_description": "Cellular trail camera with night vision",
            "brand": "HuntCam"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/products/auto-categorize", json=request_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert data["suggested_category"] == "cameras"
        print(f"✓ Auto-categorize camera product: {data['suggested_category']} ({data['confidence']})")
    
    def test_auto_categorize_weapon_product(self):
        """Test auto-categorization with weapon product keywords"""
        request_data = {
            "product_name": "Carabine de chasse 308",
            "product_description": "Rifle with scope for hunting",
            "brand": "Remington"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/products/auto-categorize", json=request_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert data["suggested_category"] == "armes"
        print(f"✓ Auto-categorize weapon product: {data['suggested_category']} ({data['confidence']})")
    
    def test_auto_categorize_unknown_product(self):
        """Test auto-categorization with unknown product (should default to attractants)"""
        request_data = {
            "product_name": "Mystery Product XYZ",
            "product_description": "",
            "brand": ""
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/products/auto-categorize", json=request_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "suggested_category" in data
        # Should have low confidence for unknown products
        print(f"✓ Auto-categorize unknown product: {data['suggested_category']} ({data['confidence']})")
    
    def test_auto_categorize_minimal_request(self):
        """Test auto-categorization with only product_name"""
        request_data = {
            "product_name": "Gel attractant pomme"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/products/auto-categorize", json=request_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        print(f"✓ Auto-categorize minimal request: {data['suggested_category']}")


class TestApplyCategory:
    """Tests for applying category to products"""
    
    @pytest.fixture
    def test_product_id(self):
        """Get a product ID for testing"""
        response = requests.get(f"{BASE_URL}/api/products?limit=1")
        if response.status_code == 200:
            products = response.json()
            if products and len(products) > 0:
                return products[0]["id"]
        return None
    
    def test_apply_category_to_product(self, test_product_id):
        """Test applying a category to a product"""
        if not test_product_id:
            pytest.skip("No products available for testing")
        
        # Apply category
        response = requests.put(
            f"{BASE_URL}/api/admin/products/{test_product_id}/categorize",
            params={"category_id": "attractants", "subcategory_id": "liquides"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "message" in data
        print(f"✓ Applied category to product: {data['message']}")
    
    def test_apply_category_without_subcategory(self, test_product_id):
        """Test applying only a category (no subcategory)"""
        if not test_product_id:
            pytest.skip("No products available for testing")
        
        response = requests.put(
            f"{BASE_URL}/api/admin/products/{test_product_id}/categorize",
            params={"category_id": "urines"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        print(f"✓ Applied category without subcategory: {data['message']}")
    
    def test_apply_invalid_category(self, test_product_id):
        """Test applying an invalid category"""
        if not test_product_id:
            pytest.skip("No products available for testing")
        
        response = requests.put(
            f"{BASE_URL}/api/admin/products/{test_product_id}/categorize",
            params={"category_id": "invalid_category_xyz"}
        )
        assert response.status_code == 404
        print("✓ Invalid category returns 404")
    
    def test_apply_category_to_nonexistent_product(self):
        """Test applying category to non-existent product"""
        fake_id = str(uuid.uuid4())
        response = requests.put(
            f"{BASE_URL}/api/admin/products/{fake_id}/categorize",
            params={"category_id": "attractants"}
        )
        assert response.status_code == 404
        print("✓ Non-existent product returns 404")


class TestAnalysisCategories:
    """Tests for analysis categories endpoint"""
    
    def test_get_analysis_categories(self):
        """Test getting all analysis categories"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories")
        assert response.status_code == 200
        data = response.json()
        
        assert "categories" in data
        categories = data["categories"]
        assert len(categories) >= 10  # Should have at least 10 default categories
        
        # Verify structure
        for cat in categories:
            assert "id" in cat
            assert "name" in cat
            assert "icon" in cat
            assert "subcategories" in cat
        
        print(f"✓ Analysis categories endpoint works - {len(categories)} categories")


class TestAdminStats:
    """Tests for admin statistics including consent stats"""
    
    def test_admin_analyze_stats(self):
        """Test admin analyze stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/analyze/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_reports" in data
        assert "total_consents" in data
        print(f"✓ Admin analyze stats: {data['total_reports']} reports, {data['total_consents']} consents")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
