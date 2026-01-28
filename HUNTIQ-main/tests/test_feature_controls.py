"""
Feature Controls API Tests
- Tests for the admin panel feature ON/OFF controls
- 23 features across 8 categories
- Full audit log functionality
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bionic-territory.preview.emergentagent.com')
ADMIN_EMAIL = "steeve.ross@gmail.com"


class TestFeatureControlsStatus:
    """Tests for GET /api/feature-controls/status"""
    
    def test_get_all_features_status(self):
        """Test getting status of all 23 features"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "features" in data
        assert "categories" in data
        assert "summary" in data
        
        # Verify 23 features
        assert data["summary"]["total"] == 23
        
        # Verify all expected features exist
        expected_features = [
            "social_posts", "comments", "likes", "groups",
            "push_notifications", "email_notifications", "email_digest",
            "social_sharing_facebook", "social_sharing_instagram", "seo_auto_generation",
            "marketplace", "payments", "lands_rental",
            "referral_program", "wallet_system",
            "user_registration", "auto_login", "password_reset",
            "ai_species_recognition", "ai_territory_analysis", "ai_product_categorization",
            "leads_management", "contacts_management"
        ]
        
        for feature_id in expected_features:
            assert feature_id in data["features"], f"Missing feature: {feature_id}"
    
    def test_get_single_feature_status(self):
        """Test getting status of a single feature"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/status/social_posts")
        assert response.status_code == 200
        
        data = response.json()
        assert data["feature_id"] == "social_posts"
        assert data["name"] == "Publications Sociales"
        assert data["category"] == "social"
        assert "enabled" in data
    
    def test_get_nonexistent_feature_status(self):
        """Test getting status of a non-existent feature returns 404"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/status/nonexistent_feature")
        assert response.status_code == 404


class TestFeatureControlsDefinitions:
    """Tests for GET /api/feature-controls/definitions"""
    
    def test_get_definitions(self):
        """Test getting all feature definitions"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/definitions")
        assert response.status_code == 200
        
        data = response.json()
        assert "features" in data
        assert "categories" in data
        
        # Verify 8 categories
        expected_categories = ["social", "notifications", "marketing", "commerce", "loyalty", "users", "ai", "crm"]
        for cat in expected_categories:
            assert cat in data["categories"], f"Missing category: {cat}"
    
    def test_definitions_have_required_fields(self):
        """Test that each feature definition has required fields"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/definitions")
        data = response.json()
        
        for feature_id, feature in data["features"].items():
            assert "name" in feature, f"Feature {feature_id} missing 'name'"
            assert "description" in feature, f"Feature {feature_id} missing 'description'"
            assert "category" in feature, f"Feature {feature_id} missing 'category'"
            assert "default" in feature, f"Feature {feature_id} missing 'default'"


class TestFeatureControlsToggle:
    """Tests for POST /api/feature-controls/toggle"""
    
    def test_toggle_feature_on(self):
        """Test toggling a feature ON"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle?admin_email={ADMIN_EMAIL}",
            json={"feature_id": "email_digest", "enabled": True}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["feature_id"] == "email_digest"
        assert data["enabled"] == True
    
    def test_toggle_feature_off(self):
        """Test toggling a feature OFF"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle?admin_email={ADMIN_EMAIL}",
            json={"feature_id": "email_digest", "enabled": False}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["enabled"] == False
    
    def test_toggle_with_reason(self):
        """Test toggling a feature with a reason"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle?admin_email={ADMIN_EMAIL}",
            json={"feature_id": "email_digest", "enabled": True, "reason": "Test reason"}
        )
        assert response.status_code == 200
        assert response.json()["success"] == True
    
    def test_toggle_nonexistent_feature(self):
        """Test toggling a non-existent feature returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle?admin_email={ADMIN_EMAIL}",
            json={"feature_id": "nonexistent_feature", "enabled": True}
        )
        assert response.status_code == 404
    
    def test_toggle_without_admin_email(self):
        """Test toggling without admin_email returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle",
            json={"feature_id": "email_digest", "enabled": True}
        )
        assert response.status_code == 422


class TestFeatureControlsBulkToggle:
    """Tests for POST /api/feature-controls/toggle-bulk"""
    
    def test_bulk_toggle_multiple_features(self):
        """Test toggling multiple features at once"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle-bulk?admin_email={ADMIN_EMAIL}",
            json={
                "features": {
                    "social_sharing_facebook": True,
                    "social_sharing_instagram": True
                },
                "reason": "Bulk test"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert len(data["results"]) == 2
        
        # Verify each result
        for result in data["results"]:
            assert result["success"] == True
    
    def test_bulk_toggle_with_invalid_feature(self):
        """Test bulk toggle with one invalid feature"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle-bulk?admin_email={ADMIN_EMAIL}",
            json={
                "features": {
                    "social_posts": True,
                    "invalid_feature": True
                }
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should still succeed overall but report the invalid feature
        results_by_id = {r["feature_id"]: r for r in data["results"]}
        assert results_by_id["social_posts"]["success"] == True
        assert results_by_id["invalid_feature"]["success"] == False


class TestFeatureControlsCategoryToggle:
    """Tests for POST /api/feature-controls/toggle-category"""
    
    def test_toggle_category_off(self):
        """Test toggling an entire category OFF"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle-category?category=marketing&enabled=false&admin_email={ADMIN_EMAIL}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        # Marketing has 3 features
        assert len(data["results"]) == 3
    
    def test_toggle_category_on(self):
        """Test toggling an entire category ON"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle-category?category=marketing&enabled=true&admin_email={ADMIN_EMAIL}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
    
    def test_toggle_invalid_category(self):
        """Test toggling an invalid category returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle-category?category=invalid_category&enabled=true&admin_email={ADMIN_EMAIL}"
        )
        assert response.status_code == 404


class TestFeatureControlsLogs:
    """Tests for GET /api/feature-controls/logs"""
    
    def test_get_logs(self):
        """Test getting audit logs"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/logs")
        assert response.status_code == 200
        
        data = response.json()
        assert "logs" in data
        assert "total" in data
        assert isinstance(data["logs"], list)
    
    def test_get_logs_with_limit(self):
        """Test getting logs with limit parameter"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/logs?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["logs"]) <= 5
    
    def test_get_logs_filtered_by_feature(self):
        """Test getting logs filtered by feature_id"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/logs?feature_id=email_digest")
        assert response.status_code == 200
        
        data = response.json()
        # All logs should be for email_digest
        for log in data["logs"]:
            assert log["feature_id"] == "email_digest"
    
    def test_get_logs_filtered_by_admin(self):
        """Test getting logs filtered by admin_email"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/logs?admin_email={ADMIN_EMAIL}")
        assert response.status_code == 200
        
        data = response.json()
        for log in data["logs"]:
            assert log["changed_by"] == ADMIN_EMAIL
    
    def test_log_entry_has_required_fields(self):
        """Test that log entries have all required fields"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/logs?limit=1")
        data = response.json()
        
        if data["logs"]:
            log = data["logs"][0]
            assert "feature_id" in log
            assert "feature_name" in log
            assert "old_value" in log
            assert "new_value" in log
            assert "changed_by" in log
            assert "changed_at" in log


class TestFeatureControlsLogsStats:
    """Tests for GET /api/feature-controls/logs/stats"""
    
    def test_get_logs_stats(self):
        """Test getting log statistics"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/logs/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_changes" in data
        assert "changes_last_24h" in data
        assert "by_feature" in data
        assert "by_admin" in data
        
        assert isinstance(data["total_changes"], int)
        assert isinstance(data["changes_last_24h"], int)
        assert isinstance(data["by_feature"], list)
        assert isinstance(data["by_admin"], list)


class TestFeatureControlsResetDefaults:
    """Tests for POST /api/feature-controls/reset-defaults"""
    
    def test_reset_to_defaults(self):
        """Test resetting all features to default values"""
        # First, change some features
        requests.post(
            f"{BASE_URL}/api/feature-controls/toggle?admin_email={ADMIN_EMAIL}",
            json={"feature_id": "social_sharing_facebook", "enabled": True}
        )
        
        # Then reset
        response = requests.post(
            f"{BASE_URL}/api/feature-controls/reset-defaults?admin_email={ADMIN_EMAIL}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        # Verify reset worked - check that defaults are restored
        status_response = requests.get(f"{BASE_URL}/api/feature-controls/status")
        status_data = status_response.json()
        
        # social_sharing_facebook should be disabled (default=false)
        assert status_data["features"]["social_sharing_facebook"]["enabled"] == False
        # social_posts should be enabled (default=true)
        assert status_data["features"]["social_posts"]["enabled"] == True


class TestFeatureControlsIntegration:
    """Integration tests for feature controls workflow"""
    
    def test_full_toggle_workflow(self):
        """Test complete workflow: toggle -> verify -> check logs"""
        # 1. Get initial status
        initial_response = requests.get(f"{BASE_URL}/api/feature-controls/status/email_digest")
        initial_enabled = initial_response.json()["enabled"]
        
        # 2. Toggle to opposite
        toggle_response = requests.post(
            f"{BASE_URL}/api/feature-controls/toggle?admin_email={ADMIN_EMAIL}",
            json={"feature_id": "email_digest", "enabled": not initial_enabled, "reason": "Integration test"}
        )
        assert toggle_response.status_code == 200
        
        # 3. Verify change persisted
        verify_response = requests.get(f"{BASE_URL}/api/feature-controls/status/email_digest")
        assert verify_response.json()["enabled"] == (not initial_enabled)
        
        # 4. Check logs contain the change
        logs_response = requests.get(f"{BASE_URL}/api/feature-controls/logs?feature_id=email_digest&limit=1")
        logs = logs_response.json()["logs"]
        assert len(logs) > 0
        assert logs[0]["feature_id"] == "email_digest"
        assert logs[0]["new_value"] == (not initial_enabled)
        
        # 5. Restore original state
        requests.post(
            f"{BASE_URL}/api/feature-controls/toggle?admin_email={ADMIN_EMAIL}",
            json={"feature_id": "email_digest", "enabled": initial_enabled}
        )
    
    def test_category_counts_match(self):
        """Test that category feature counts are correct"""
        response = requests.get(f"{BASE_URL}/api/feature-controls/status")
        data = response.json()
        
        # Count features by category
        category_counts = {}
        for feature_id, feature in data["features"].items():
            cat = feature["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        # Expected counts based on FEATURE_DEFINITIONS
        expected_counts = {
            "social": 4,
            "notifications": 3,
            "marketing": 3,
            "commerce": 3,
            "loyalty": 2,
            "users": 3,
            "ai": 3,
            "crm": 2
        }
        
        for cat, expected in expected_counts.items():
            assert category_counts.get(cat, 0) == expected, f"Category {cat} has {category_counts.get(cat, 0)} features, expected {expected}"


# Cleanup fixture to reset to defaults after all tests
@pytest.fixture(scope="module", autouse=True)
def cleanup_after_tests():
    yield
    # Reset to defaults after all tests
    requests.post(
        f"{BASE_URL}/api/feature-controls/reset-defaults?admin_email={ADMIN_EMAIL}"
    )
