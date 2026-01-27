"""
Test suite for BIONIC™ Territory Analysis - Waypoint and Zoom Features
Tests: Waypoint API (POST/GET), Zoom control positioning verification
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWaypointAPI:
    """Test Waypoint CRUD operations - POST /api/territory/waypoints, GET /api/territory/waypoints"""
    
    @pytest.fixture
    def test_user_id(self):
        """Get a test user ID via auto-login"""
        response = requests.get(f"{BASE_URL}/api/territory/users/auto-login")
        if response.status_code == 200:
            return response.json()["id"]
        return f"test_user_{uuid.uuid4().hex[:8]}"
    
    def test_create_waypoint(self, test_user_id):
        """Test POST /api/territory/waypoints - Create a new waypoint"""
        waypoint_data = {
            "latitude": 46.8139,
            "longitude": -71.2080,
            "name": f"TEST_Waypoint_{uuid.uuid4().hex[:6]}",
            "description": "Test waypoint from pytest",
            "waypoint_type": "observation"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            json=waypoint_data,
            params={"user_id": test_user_id}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "id" in data, "Missing waypoint id"
        assert "latitude" in data, "Missing latitude"
        assert "longitude" in data, "Missing longitude"
        assert "name" in data, "Missing name"
        assert "waypoint_type" in data, "Missing waypoint_type"
        assert "created_at" in data, "Missing created_at"
        
        # Verify data values
        assert data["latitude"] == waypoint_data["latitude"], f"Latitude mismatch"
        assert data["longitude"] == waypoint_data["longitude"], f"Longitude mismatch"
        assert data["name"] == waypoint_data["name"], f"Name mismatch"
        assert data["waypoint_type"] == waypoint_data["waypoint_type"], f"Type mismatch"
        
        print(f"✓ Waypoint created: {data['id']} - {data['name']}")
        return data["id"]
    
    def test_list_waypoints(self, test_user_id):
        """Test GET /api/territory/waypoints - List all waypoints"""
        response = requests.get(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": test_user_id}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of waypoints"
        
        # If there are waypoints, verify structure
        if len(data) > 0:
            wp = data[0]
            assert "id" in wp, "Waypoint missing id"
            assert "latitude" in wp, "Waypoint missing latitude"
            assert "longitude" in wp, "Waypoint missing longitude"
            assert "name" in wp, "Waypoint missing name"
            assert "waypoint_type" in wp, "Waypoint missing waypoint_type"
        
        print(f"✓ Waypoints list: {len(data)} waypoints found")
    
    def test_create_and_verify_waypoint_persistence(self, test_user_id):
        """Test that created waypoint persists in database"""
        # Create waypoint
        waypoint_data = {
            "latitude": 47.0,
            "longitude": -71.5,
            "name": f"TEST_Persist_{uuid.uuid4().hex[:6]}",
            "waypoint_type": "camera"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            json=waypoint_data,
            params={"user_id": test_user_id}
        )
        assert create_response.status_code == 200
        
        waypoint_id = create_response.json()["id"]
        
        # List waypoints and verify our waypoint exists
        list_response = requests.get(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": test_user_id}
        )
        assert list_response.status_code == 200
        
        waypoints = list_response.json()
        waypoint_ids = [wp["id"] for wp in waypoints]
        assert waypoint_id in waypoint_ids, f"Created waypoint {waypoint_id} not found in list"
        
        # Verify the waypoint data
        created_wp = next((wp for wp in waypoints if wp["id"] == waypoint_id), None)
        assert created_wp is not None
        assert created_wp["latitude"] == waypoint_data["latitude"]
        assert created_wp["longitude"] == waypoint_data["longitude"]
        assert created_wp["name"] == waypoint_data["name"]
        
        print(f"✓ Waypoint {waypoint_id} persisted and verified")
    
    def test_create_waypoint_all_types(self, test_user_id):
        """Test creating waypoints with all valid types"""
        valid_types = ['observation', 'camera', 'cache', 'stand', 'water', 'trail_start', 'custom']
        
        for wp_type in valid_types:
            waypoint_data = {
                "latitude": 46.5 + (valid_types.index(wp_type) * 0.1),
                "longitude": -71.0,
                "name": f"TEST_{wp_type}_{uuid.uuid4().hex[:4]}",
                "waypoint_type": wp_type
            }
            
            response = requests.post(
                f"{BASE_URL}/api/territory/waypoints",
                json=waypoint_data,
                params={"user_id": test_user_id}
            )
            
            assert response.status_code == 200, f"Failed to create waypoint type {wp_type}: {response.text}"
            assert response.json()["waypoint_type"] == wp_type
        
        print(f"✓ All {len(valid_types)} waypoint types created successfully")
    
    def test_delete_waypoint(self, test_user_id):
        """Test DELETE /api/territory/waypoints/{waypoint_id}"""
        # First create a waypoint
        waypoint_data = {
            "latitude": 46.9,
            "longitude": -71.3,
            "name": f"TEST_Delete_{uuid.uuid4().hex[:6]}",
            "waypoint_type": "custom"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            json=waypoint_data,
            params={"user_id": test_user_id}
        )
        assert create_response.status_code == 200
        waypoint_id = create_response.json()["id"]
        
        # Delete the waypoint
        delete_response = requests.delete(
            f"{BASE_URL}/api/territory/waypoints/{waypoint_id}",
            params={"user_id": test_user_id}
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        # Verify waypoint is deleted
        list_response = requests.get(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": test_user_id}
        )
        waypoints = list_response.json()
        waypoint_ids = [wp["id"] for wp in waypoints]
        assert waypoint_id not in waypoint_ids, f"Waypoint {waypoint_id} still exists after deletion"
        
        print(f"✓ Waypoint {waypoint_id} deleted and verified")
    
    def test_waypoint_gps_coordinates_precision(self, test_user_id):
        """Test that GPS coordinates maintain precision"""
        # Use high precision coordinates
        waypoint_data = {
            "latitude": 46.813912345,
            "longitude": -71.208067890,
            "name": f"TEST_Precision_{uuid.uuid4().hex[:6]}",
            "waypoint_type": "observation"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            json=waypoint_data,
            params={"user_id": test_user_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify precision is maintained (at least 5 decimal places)
        assert abs(data["latitude"] - waypoint_data["latitude"]) < 0.00001
        assert abs(data["longitude"] - waypoint_data["longitude"]) < 0.00001
        
        print(f"✓ GPS precision maintained: {data['latitude']}, {data['longitude']}")


class TestAutoLoginAPI:
    """Test auto-login functionality for territory module"""
    
    def test_auto_login_returns_user(self):
        """Test GET /api/territory/users/auto-login"""
        response = requests.get(f"{BASE_URL}/api/territory/users/auto-login")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Missing user id"
        assert "email" in data, "Missing email"
        assert "name" in data, "Missing name"
        
        # Name should follow pattern "Chasseur XXXXXX"
        assert "Chasseur" in data["name"], f"Unexpected name format: {data['name']}"
        
        print(f"✓ Auto-login successful: {data['name']}")


class TestWMSLayerSources:
    """Test WMS layer sources endpoint"""
    
    def test_wms_sources_available(self):
        """Test GET /api/territory/layers/wms-sources"""
        response = requests.get(f"{BASE_URL}/api/territory/layers/wms-sources")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sources" in data, "Missing sources"
        
        # Verify expected WMS layers are present
        sources = data["sources"]
        expected_layers = ["foret_ecoforestiere", "hydrographie", "topographie", "routes_chemins"]
        
        for layer in expected_layers:
            assert layer in sources, f"Missing WMS layer: {layer}"
            assert "url" in sources[layer], f"Layer {layer} missing URL"
            assert "name" in sources[layer], f"Layer {layer} missing name"
        
        print(f"✓ WMS sources: {len(sources)} layers available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
