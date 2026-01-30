"""
Test BIONIC Territory Analysis API - Zone Analysis with WMS Data
Tests the /api/bionic-territory/analyze/advanced endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBionicTerritoryHealth:
    """Health check for BIONIC Territory service"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/bionic-territory/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "bionic-territory"
        assert data["features"]["analysis"] == True
        assert data["features"]["wms_proxy"] == True
        print(f"✅ Health check passed: {data['version']}")


class TestAdvancedZoneAnalysis:
    """Tests for /api/bionic-territory/analyze/advanced endpoint"""
    
    def test_analyze_zone_2km(self):
        """Test zone analysis with 2 km² area (radius ~0.798 km)"""
        payload = {
            "waypoint_id": "test-wp-1",
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 0.798,
            "target_species": "orignal",
            "include_wms_data": True,
            "wms_layers": ["ecoforestry", "lidar", "humidity"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze/advanced",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "global_score" in data
        assert "behavior_zones" in data
        assert "optimal_hotspot" in data
        assert "zones_count" in data
        assert "data_source" in data
        assert "best_time_window" in data
        
        # Verify data values
        assert 0 <= data["global_score"] <= 100
        assert data["zones_count"] > 0
        assert data["data_source"] in ["wms_real", "simulated"]
        
        # Verify optimal hotspot
        hotspot = data["optimal_hotspot"]
        assert "score" in hotspot
        assert "dominant_behavior" in hotspot
        assert "distance_from_center_m" in hotspot
        assert "hunting_tip" in hotspot
        assert hotspot["dominant_behavior"] in ["cover", "feeding", "travel", "water", "rest"]
        
        print(f"✅ 2km² analysis: {data['zones_count']} zones, score {data['global_score']}, source: {data['data_source']}")
    
    def test_analyze_zone_4km(self):
        """Test zone analysis with 4 km² area (radius ~1.128 km)"""
        payload = {
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 1.128,
            "target_species": "orignal",
            "include_wms_data": True,
            "wms_layers": ["ecoforestry", "lidar", "humidity"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze/advanced",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["zones_count"] > 0
        assert data["optimal_hotspot"]["score"] > 0
        
        print(f"✅ 4km² analysis: {data['zones_count']} zones, hotspot score {data['optimal_hotspot']['score']}%")
    
    def test_analyze_zone_10km(self):
        """Test zone analysis with 10 km² area (radius ~1.784 km)"""
        payload = {
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 1.784,
            "target_species": "orignal",
            "include_wms_data": True,
            "wms_layers": ["ecoforestry", "lidar", "humidity"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze/advanced",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["zones_count"] > 0
        assert "approach_strategy" in data
        
        print(f"✅ 10km² analysis: {data['zones_count']} zones, strategy: {data['approach_strategy'][:50]}...")
    
    def test_behavior_zones_structure(self):
        """Test that behavior zones have correct structure"""
        payload = {
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 2.0,
            "target_species": "orignal",
            "include_wms_data": True,
            "wms_layers": ["ecoforestry"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze/advanced",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check behavior zones
        assert len(data["behavior_zones"]) > 0
        
        for zone in data["behavior_zones"]:
            assert "id" in zone
            assert "behavior_type" in zone
            assert "coordinates" in zone
            assert "score" in zone
            assert "confidence" in zone
            assert "hunting_tip" in zone
            
            # Verify behavior type is valid
            assert zone["behavior_type"] in ["cover", "feeding", "travel", "water", "rest"]
            
            # Verify coordinates are GeoJSON polygon format
            assert isinstance(zone["coordinates"], list)
            assert len(zone["coordinates"]) > 0
            assert len(zone["coordinates"][0]) >= 4  # Polygon needs at least 4 points (closed)
        
        print(f"✅ Behavior zones structure valid: {len(data['behavior_zones'])} zones")
    
    def test_wms_analysis_scores(self):
        """Test WMS analysis scores are returned"""
        payload = {
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 2.0,
            "target_species": "orignal",
            "include_wms_data": True,
            "wms_layers": ["ecoforestry", "lidar", "humidity"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze/advanced",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check WMS analysis
        assert "wms_analysis" in data
        wms = data["wms_analysis"]
        
        for layer_id in ["ecoforestry", "lidar", "humidity"]:
            assert layer_id in wms
            assert "score" in wms[layer_id]
            assert "layer_name" in wms[layer_id]
            assert "interpretation" in wms[layer_id]
        
        print(f"✅ WMS analysis: ecoforestry={wms['ecoforestry']['score']:.1f}, lidar={wms['lidar']['score']:.1f}, humidity={wms['humidity']['score']:.1f}")
    
    def test_different_species(self):
        """Test analysis with different target species"""
        species_list = ["orignal", "chevreuil", "ours_noir", "dindon"]
        
        for species in species_list:
            payload = {
                "center": {"lat": 46.8139, "lng": -71.2080},
                "radius_km": 2.0,
                "target_species": species,
                "include_wms_data": True,
                "wms_layers": ["ecoforestry"]
            }
            
            response = requests.post(
                f"{BASE_URL}/api/bionic-territory/analyze/advanced",
                json=payload
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["target_species"] == species
            assert data["zones_count"] > 0
        
        print(f"✅ All species tested: {', '.join(species_list)}")
    
    def test_hotspot_optimal_details(self):
        """Test optimal hotspot contains all required details"""
        payload = {
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 2.0,
            "target_species": "orignal",
            "include_wms_data": True,
            "wms_layers": ["ecoforestry", "lidar", "humidity"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze/advanced",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        hotspot = data["optimal_hotspot"]
        
        # Required fields
        assert "id" in hotspot
        assert "position" in hotspot
        assert "score" in hotspot
        assert "dominant_behavior" in hotspot
        assert "distance_from_center_m" in hotspot
        assert "approach_direction" in hotspot
        assert "hunting_tip" in hotspot
        assert "wms_scores" in hotspot
        
        # Position structure
        assert "lat" in hotspot["position"]
        assert "lng" in hotspot["position"]
        
        # Approach direction is valid
        valid_directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
        assert hotspot["approach_direction"] in valid_directions
        
        print(f"✅ Hotspot details: score={hotspot['score']}%, direction={hotspot['approach_direction']}, distance={hotspot['distance_from_center_m']}m")
    
    def test_hunting_recommendations(self):
        """Test hunting recommendations are provided"""
        payload = {
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 2.0,
            "target_species": "orignal",
            "include_wms_data": True,
            "wms_layers": ["ecoforestry"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze/advanced",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "hunting_recommendations" in data
        assert len(data["hunting_recommendations"]) > 0
        assert "best_time_window" in data
        assert "approach_strategy" in data
        
        print(f"✅ Recommendations: {len(data['hunting_recommendations'])} tips, time: {data['best_time_window']}")


class TestBasicAnalysis:
    """Tests for basic /api/bionic-territory/analyze endpoint"""
    
    def test_basic_analyze(self):
        """Test basic zone analysis endpoint"""
        payload = {
            "center": {"lat": 46.8139, "lng": -71.2080},
            "radius_km": 2.0,
            "target_species": "orignal",
            "include_weather": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bionic-territory/analyze",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "global_score" in data
        assert "zones" in data
        assert "hotspots" in data
        
        print(f"✅ Basic analysis: score={data['global_score']}, zones={len(data['zones'])}, hotspots={len(data['hotspots'])}")


class TestMapConfig:
    """Tests for map configuration endpoint"""
    
    def test_get_config(self):
        """Test map configuration endpoint"""
        response = requests.get(f"{BASE_URL}/api/bionic-territory/config")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "base_maps" in data
        assert "pipeline_layers" in data
        assert "default_center" in data
        assert "default_zoom" in data
        
        print(f"✅ Config: {len(data['base_maps'])} base maps, {len(data['pipeline_layers'])} layers")
    
    def test_pipeline_status(self):
        """Test pipeline status endpoint"""
        response = requests.get(f"{BASE_URL}/api/bionic-territory/pipeline/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["enabled"] == True
        assert "version" in data
        assert "layers_active" in data
        
        print(f"✅ Pipeline: enabled={data['enabled']}, version={data['version']}, layers={data['layers_active']}")


class TestWMSProxy:
    """Tests for WMS proxy endpoints"""
    
    def test_list_wms_sources(self):
        """Test listing WMS sources"""
        response = requests.get(f"{BASE_URL}/api/bionic-territory/wms/sources")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        for source in data:
            assert "source_id" in source
            assert "url" in source
            assert "available_layers" in source
        
        print(f"✅ WMS sources: {len(data)} sources available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
