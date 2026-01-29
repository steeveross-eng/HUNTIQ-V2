"""
Test suite for Guided Route (Parcours Guidé) feature
Tests the POST /api/territory/analysis/guided-route endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://habitat-huntiq.preview.emergentagent.com')

# Test user with pre-created waypoints (Point Alpha, Point Beta, Point Gamma)
TEST_USER_ID = "test-guided-route-user"


class TestGuidedRouteAPI:
    """Tests for the guided-route API endpoint"""
    
    def test_guided_route_balanced_mode(self):
        """Test guided route with balanced optimization mode"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "orignal",
                "optimize_for": "balanced"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields in response
        assert "route_id" in data
        assert "total_distance_km" in data
        assert "estimated_time_hours" in data
        assert "average_probability" in data
        assert "highest_probability_zone" in data
        assert "segments" in data
        assert "waypoint_order" in data
        assert "summary" in data
        
        # Verify data types
        assert isinstance(data["route_id"], str)
        assert isinstance(data["total_distance_km"], (int, float))
        assert isinstance(data["estimated_time_hours"], (int, float))
        assert isinstance(data["average_probability"], (int, float))
        
        print(f"✓ Balanced mode: {data['total_distance_km']}km, {data['average_probability']}% avg probability")
    
    def test_guided_route_probability_mode(self):
        """Test guided route with probability optimization mode"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "chevreuil",
                "optimize_for": "probability"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["species"] == "chevreuil"
        assert "waypoint_order" in data
        assert len(data["waypoint_order"]) >= 2
        
        print(f"✓ Probability mode: {data['total_distance_km']}km, {data['average_probability']}% avg probability")
    
    def test_guided_route_distance_mode(self):
        """Test guided route with distance optimization mode"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "ours",
                "optimize_for": "distance"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["species"] == "ours"
        assert data["total_distance_km"] > 0
        
        print(f"✓ Distance mode: {data['total_distance_km']}km, {data['average_probability']}% avg probability")
    
    def test_waypoint_order_structure(self):
        """Test that waypoint_order contains required fields with probability info"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "orignal",
                "optimize_for": "balanced"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check waypoint_order structure
        for waypoint in data["waypoint_order"]:
            assert "id" in waypoint
            assert "name" in waypoint
            assert "lat" in waypoint
            assert "lng" in waypoint
            assert "probability" in waypoint, "Waypoint must have probability (%)"
            assert "probability_level" in waypoint, "Waypoint must have probability_level (high/medium/low)"
            assert "color" in waypoint, "Waypoint must have color"
            
            # Verify probability is a percentage (0-100)
            assert 0 <= waypoint["probability"] <= 100, f"Probability {waypoint['probability']} should be 0-100"
            
            # Verify probability_level is valid
            assert waypoint["probability_level"] in ["high", "medium", "low"], \
                f"Invalid probability_level: {waypoint['probability_level']}"
            
            # Verify color is a valid hex color
            assert waypoint["color"].startswith("#"), f"Color should be hex: {waypoint['color']}"
        
        print(f"✓ All {len(data['waypoint_order'])} waypoints have correct structure with probability info")
    
    def test_segments_structure(self):
        """Test that segments contain required fields"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "orignal",
                "optimize_for": "balanced"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check segments structure
        for segment in data["segments"]:
            assert "from_waypoint" in segment
            assert "to_waypoint" in segment
            assert "distance_km" in segment, "Segment must have distance_km"
            assert "probability_score" in segment, "Segment must have probability_score"
            assert "probability_level" in segment
            assert "color" in segment
            assert "recommendations" in segment, "Segment must have recommendations"
            
            # Verify distance is positive
            assert segment["distance_km"] > 0, "Distance should be positive"
            
            # Verify recommendations is a list
            assert isinstance(segment["recommendations"], list)
        
        print(f"✓ All {len(data['segments'])} segments have correct structure")
    
    def test_highest_probability_zone(self):
        """Test that highest_probability_zone is correctly identified"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "orignal",
                "optimize_for": "balanced"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check highest_probability_zone structure
        zone = data["highest_probability_zone"]
        assert "name" in zone
        assert "latitude" in zone
        assert "longitude" in zone
        assert "probability" in zone, "Zone must have probability"
        assert "factors" in zone
        
        # Verify it's actually the highest probability
        max_prob_in_order = max(wp["probability"] for wp in data["waypoint_order"])
        assert zone["probability"] == max_prob_in_order, \
            f"Highest zone probability {zone['probability']} should match max in order {max_prob_in_order}"
        
        print(f"✓ Highest probability zone: {zone['name']} at {zone['probability']}%")
    
    def test_probability_levels_and_colors(self):
        """Test that probability levels and colors are correctly assigned"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "orignal",
                "optimize_for": "balanced"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Expected colors based on probability levels
        expected_colors = {
            "high": "#22c55e",    # Green for >= 70%
            "medium": "#eab308",  # Yellow for 50-69%
            "low": "#ef4444"      # Red for < 50%
        }
        
        for waypoint in data["waypoint_order"]:
            prob = waypoint["probability"]
            level = waypoint["probability_level"]
            color = waypoint["color"]
            
            # Verify level matches probability
            if prob >= 70:
                assert level == "high", f"Probability {prob}% should be 'high', got '{level}'"
            elif prob >= 50:
                assert level == "medium", f"Probability {prob}% should be 'medium', got '{level}'"
            else:
                assert level == "low", f"Probability {prob}% should be 'low', got '{level}'"
            
            # Verify color matches level
            assert color == expected_colors[level], \
                f"Level '{level}' should have color {expected_colors[level]}, got {color}"
        
        print("✓ All probability levels and colors are correctly assigned")
    
    def test_error_less_than_2_waypoints(self):
        """Test error when user has less than 2 waypoints"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": "nonexistent-user-no-waypoints"},
            json={
                "species": "orignal",
                "optimize_for": "balanced"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "2 waypoints" in data["detail"].lower() or "waypoints" in data["detail"].lower()
        
        print(f"✓ Correct error for <2 waypoints: {data['detail']}")
    
    def test_all_species_supported(self):
        """Test that all species (orignal, chevreuil, ours) are supported"""
        species_list = ["orignal", "chevreuil", "ours"]
        
        for species in species_list:
            response = requests.post(
                f"{BASE_URL}/api/territory/analysis/guided-route",
                params={"user_id": TEST_USER_ID},
                json={
                    "species": species,
                    "optimize_for": "balanced"
                }
            )
            
            assert response.status_code == 200, f"Species {species} should be supported"
            data = response.json()
            assert data["species"] == species
            
            print(f"✓ Species '{species}' supported")
    
    def test_route_summary_content(self):
        """Test that summary contains expected information"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "orignal",
                "optimize_for": "balanced"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        summary = data["summary"]
        
        # Summary should contain key information
        assert "km" in summary.lower(), "Summary should mention distance in km"
        assert "point" in summary.lower(), "Summary should mention points"
        assert "%" in summary, "Summary should mention probability percentage"
        
        print(f"✓ Summary: {summary}")
    
    def test_start_from_current_position(self):
        """Test guided route starting from current GPS position"""
        response = requests.post(
            f"{BASE_URL}/api/territory/analysis/guided-route",
            params={"user_id": TEST_USER_ID},
            json={
                "species": "orignal",
                "optimize_for": "balanced",
                "start_from_current_position": True,
                "current_lat": 46.82,
                "current_lng": -71.21
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # When starting from current position, the first waypoint should be "Position actuelle"
        # or the route should include the current position
        assert len(data["waypoint_order"]) >= 3, "Route should include current position + waypoints"
        
        print(f"✓ Route from current position: {len(data['waypoint_order'])} points")


class TestWaypointsForGuidedRoute:
    """Tests to verify waypoints exist for guided route testing"""
    
    def test_waypoints_exist(self):
        """Verify test user has waypoints"""
        response = requests.get(
            f"{BASE_URL}/api/territory/waypoints",
            params={"user_id": TEST_USER_ID}
        )
        
        assert response.status_code == 200
        waypoints = response.json()
        
        assert len(waypoints) >= 2, "Test user should have at least 2 waypoints"
        
        # Verify expected waypoints exist
        waypoint_names = [wp["name"] for wp in waypoints]
        assert "Point Alpha" in waypoint_names
        assert "Point Beta" in waypoint_names
        assert "Point Gamma" in waypoint_names
        
        print(f"✓ Test user has {len(waypoints)} waypoints: {waypoint_names}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
