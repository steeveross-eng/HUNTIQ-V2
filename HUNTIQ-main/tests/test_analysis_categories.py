"""
Test suite for Analysis Categories API endpoints
Tests the new category/subcategory menu feature under 'Analysez' button
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bionic-waypoints.preview.emergentagent.com')

class TestAnalysisCategoriesAPI:
    """Tests for /api/analysis-categories endpoints"""
    
    def test_get_analysis_categories_returns_200(self):
        """Test that GET /api/analysis-categories returns 200"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_get_analysis_categories_returns_10_categories(self):
        """Test that API returns exactly 10 categories"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories")
        data = response.json()
        
        assert "categories" in data, "Response should contain 'categories' key"
        assert len(data["categories"]) == 10, f"Expected 10 categories, got {len(data['categories'])}"
        
    def test_categories_have_required_fields(self):
        """Test that each category has required fields: id, name, icon, subcategories"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories")
        data = response.json()
        
        required_fields = ["id", "name", "icon", "subcategories"]
        for category in data["categories"]:
            for field in required_fields:
                assert field in category, f"Category missing required field: {field}"
                
    def test_subcategories_have_required_fields(self):
        """Test that each subcategory has required fields: id, name, icon"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories")
        data = response.json()
        
        required_fields = ["id", "name", "icon"]
        for category in data["categories"]:
            for subcategory in category.get("subcategories", []):
                for field in required_fields:
                    assert field in subcategory, f"Subcategory missing required field: {field}"
                    
    def test_specific_categories_exist(self):
        """Test that specific expected categories exist"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories")
        data = response.json()
        
        expected_category_ids = [
            "attractants", "armes", "cameras", "urines", "appats",
            "leurres", "accessoires", "vetements", "habitat", "animaux"
        ]
        
        actual_ids = [cat["id"] for cat in data["categories"]]
        for expected_id in expected_category_ids:
            assert expected_id in actual_ids, f"Expected category '{expected_id}' not found"
            
    def test_get_single_category_by_id(self):
        """Test GET /api/analysis-categories/{category_id}"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories/attractants")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "attractants"
        assert "subcategories" in data
        
    def test_get_nonexistent_category_returns_404(self):
        """Test that requesting non-existent category returns 404"""
        response = requests.get(f"{BASE_URL}/api/analysis-categories/nonexistent_category")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestAnalyzeCategoriesAPI:
    """Tests for /api/analyze/categories endpoint (product type selection)"""
    
    def test_get_analyze_categories_returns_200(self):
        """Test that GET /api/analyze/categories returns 200"""
        response = requests.get(f"{BASE_URL}/api/analyze/categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_analyze_categories_returns_categories_list(self):
        """Test that response contains categories list"""
        response = requests.get(f"{BASE_URL}/api/analyze/categories")
        data = response.json()
        
        assert "categories" in data, "Response should contain 'categories' key"
        assert isinstance(data["categories"], list), "Categories should be a list"


class TestAdminCategoriesAPI:
    """Tests for admin category management endpoints"""
    
    def test_init_defaults_endpoint_exists(self):
        """Test that POST /api/admin/analysis-categories/init-defaults works"""
        response = requests.post(f"{BASE_URL}/api/admin/analysis-categories/init-defaults")
        # Should return 200 even if already initialized
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_add_category_requires_data(self):
        """Test that POST /api/admin/analysis-categories requires proper data"""
        response = requests.post(
            f"{BASE_URL}/api/admin/analysis-categories",
            json={}
        )
        # Should fail validation without required fields
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        
    def test_add_subcategory_to_nonexistent_category(self):
        """Test adding subcategory to non-existent category returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/admin/analysis-categories/add-subcategory/nonexistent",
            json={"id": "test", "name": "Test", "icon": "📦"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
