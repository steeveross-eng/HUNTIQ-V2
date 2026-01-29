"""
Test suite for BIONIC™ Territory Waypoint CRUD operations
Tests: Create, Read, Delete waypoints via API
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://habitat-huntiq.preview.emergentagent.com').rstrip('/')
TEST_USER_ID = f"test_user_{uuid.uuid4().hex[:8]}"

class TestWaypointCRUD:
    """Waypoint CRUD endpoint tests"""
    
    created_waypoint_ids = []
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup before each test"""
        yield
        # Cleanup: Delete all test waypoints
        for wp_id in self.created_waypoint_ids:
            try:
                requests.delete(f"{BASE_URL}/api/territory/waypoints/{wp_id}", params={"user_id": TEST_USER_ID})
            except:
                pass
        self.created_waypoint_ids.clear()
    
    def test_create_waypoint_success(self):
        """Test creating a new waypoint"""
        payload = {
            "latitude": 46.8139,
            "longitude": -71.2080,
            "name": "TEST_Waypoint_Create",
            "waypoint_type": "custom"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID},
            json=payload
        )
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert data["name"] == payload["name"], f"Name mismatch: {data['name']} != {payload['name']}"
        assert data["latitude"] == payload["latitude"], f"Latitude mismatch"
        assert data["longitude"] == payload["longitude"], f"Longitude mismatch"
        assert data["waypoint_type"] == payload["waypoint_type"], f"Type mismatch"
        assert "created_at" in data, "Response should contain 'created_at'"
        
        self.created_waypoint_ids.append(data["id"])
        print(f"✅ Created waypoint: {data['id']}")
    
    def test_create_waypoint_with_all_types(self):
        """Test creating waypoints with different types"""
        waypoint_types = ['observation', 'camera', 'cache', 'stand', 'water', 'trail_start', 'custom']
        
        for wp_type in waypoint_types:
            payload = {
                "latitude": 46.8 + (waypoint_types.index(wp_type) * 0.01),
                "longitude": -71.2,
                "name": f"TEST_Type_{wp_type}",
                "waypoint_type": wp_type
            }
            
            response = requests.post(
                f"{BASE_URL}/api/territory/waypoints",
                params={"user_id": TEST_USER_ID},
                json=payload
            )
            
            assert response.status_code == 200, f"Failed to create waypoint type {wp_type}: {response.text}"
            data = response.json()
            assert data["waypoint_type"] == wp_type
            self.created_waypoint_ids.append(data["id"])
        
        print(f"✅ Created waypoints with all {len(waypoint_types)} types")
    
    def test_list_waypoints(self):
        """Test listing waypoints for a user"""
        # First create a waypoint
        create_payload = {
            "latitude": 46.9,
            "longitude": -71.3,
            "name": "TEST_List_Waypoint",
            "waypoint_type": "custom"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID},
            json=create_payload
        )
        assert create_response.status_code == 200
        created_id = create_response.json()["id"]
        self.created_waypoint_ids.append(created_id)
        
        # Now list waypoints
        list_response = requests.get(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID}
        )
        
        assert list_response.status_code == 200
        waypoints = list_response.json()
        assert isinstance(waypoints, list), "Response should be a list"
        
        # Verify our created waypoint is in the list
        found = any(wp["id"] == created_id for wp in waypoints)
        assert found, f"Created waypoint {created_id} not found in list"
        print(f"✅ Listed {len(waypoints)} waypoints, found created waypoint")
    
    def test_delete_waypoint_success(self):
        """Test deleting a waypoint"""
        # First create a waypoint
        create_payload = {
            "latitude": 47.0,
            "longitude": -71.5,
            "name": "TEST_Delete_Me",
            "waypoint_type": "custom"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID},
            json=create_payload
        )
        assert create_response.status_code == 200
        waypoint_id = create_response.json()["id"]
        
        # Delete the waypoint
        delete_response = requests.delete(
            f"{BASE_URL}/api/territory/waypoints/{waypoint_id}",
            params={"user_id": TEST_USER_ID}
        )
        
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        delete_data = delete_response.json()
        assert delete_data["status"] == "deleted"
        assert delete_data["id"] == waypoint_id
        
        # Verify waypoint is no longer in list
        list_response = requests.get(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID}
        )
        waypoints = list_response.json()
        found = any(wp["id"] == waypoint_id for wp in waypoints)
        assert not found, f"Deleted waypoint {waypoint_id} still found in list"
        
        print(f"✅ Deleted waypoint {waypoint_id} and verified removal")
    
    def test_delete_nonexistent_waypoint(self):
        """Test deleting a waypoint that doesn't exist"""
        fake_id = str(uuid.uuid4())
        
        response = requests.delete(
            f"{BASE_URL}/api/territory/waypoints/{fake_id}",
            params={"user_id": TEST_USER_ID}
        )
        
        assert response.status_code == 404, f"Expected 404 for nonexistent waypoint, got {response.status_code}"
        print(f"✅ Correctly returned 404 for nonexistent waypoint")
    
    def test_create_and_verify_persistence(self):
        """Test that created waypoint persists in database"""
        # Create waypoint
        create_payload = {
            "latitude": 46.75,
            "longitude": -71.25,
            "name": "TEST_Persistence_Check",
            "description": "Testing data persistence",
            "waypoint_type": "observation"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID},
            json=create_payload
        )
        assert create_response.status_code == 200
        created = create_response.json()
        self.created_waypoint_ids.append(created["id"])
        
        # Verify by listing
        list_response = requests.get(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID}
        )
        assert list_response.status_code == 200
        
        waypoints = list_response.json()
        found_wp = next((wp for wp in waypoints if wp["id"] == created["id"]), None)
        
        assert found_wp is not None, "Created waypoint not found in list"
        assert found_wp["name"] == create_payload["name"]
        assert found_wp["latitude"] == create_payload["latitude"]
        assert found_wp["longitude"] == create_payload["longitude"]
        assert found_wp["waypoint_type"] == create_payload["waypoint_type"]
        
        print(f"✅ Verified waypoint persistence: {created['id']}")


class TestGPSCoordinateCapture:
    """Tests for GPS coordinate capture functionality"""
    
    def test_waypoint_coordinates_precision(self):
        """Test that coordinates are stored with proper precision"""
        # High precision coordinates
        payload = {
            "latitude": 46.813924,
            "longitude": -71.207880,
            "name": "TEST_Precision",
            "waypoint_type": "custom"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": f"precision_test_{uuid.uuid4().hex[:8]}"},
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify precision is maintained (at least 4 decimal places)
        assert abs(data["latitude"] - payload["latitude"]) < 0.0001
        assert abs(data["longitude"] - payload["longitude"]) < 0.0001
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/territory/waypoints/{data['id']}", 
                       params={"user_id": f"precision_test_{uuid.uuid4().hex[:8]}"})
        
        print(f"✅ Coordinate precision verified: {data['latitude']}, {data['longitude']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
