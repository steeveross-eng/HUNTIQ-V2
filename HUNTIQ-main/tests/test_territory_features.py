"""
Test suite for BIONIC™ Territory Analysis Module
Tests: Probability, Cooling Zones, Nutrition Analysis, Orders API
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProbabilityAPI:
    """Test POST /api/territory/analysis/probability - Species presence probability"""
    
    def test_probability_orignal_basic(self):
        """Test probability calculation for moose with minimal data"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/probability", json={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "orignal"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "probability_score" in data, "Missing probability_score"
        assert "confidence" in data, "Missing confidence"
        assert "factors" in data, "Missing factors"
        assert "recommendations" in data, "Missing recommendations"
        
        # Verify score is 0-100
        assert 0 <= data["probability_score"] <= 100, f"Score {data['probability_score']} not in 0-100 range"
        
        # Verify confidence level
        assert data["confidence"] in ["low", "medium", "high"], f"Invalid confidence: {data['confidence']}"
        
        print(f"✓ Orignal probability: {data['probability_score']}% ({data['confidence']} confidence)")
    
    def test_probability_chevreuil_with_factors(self):
        """Test probability for deer with environmental factors"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/probability", json={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "chevreuil",
            "forest_type": "mixte",
            "water_distance_m": 200,
            "altitude_m": 300,
            "road_distance_m": 800,
            "is_transition_zone": True,
            "is_coulee": True,
            "slope_direction": "SW"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # With all factors provided, confidence should be high
        assert data["confidence"] == "high", f"Expected high confidence with all factors, got {data['confidence']}"
        
        # Verify factors are calculated
        assert len(data["factors"]) >= 5, f"Expected at least 5 factors, got {len(data['factors'])}"
        
        # Verify recommendations exist
        assert len(data["recommendations"]) > 0, "No recommendations provided"
        
        print(f"✓ Chevreuil probability with factors: {data['probability_score']}% ({len(data['factors'])} factors)")
    
    def test_probability_ours(self):
        """Test probability for bear"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/probability", json={
            "latitude": 47.0,
            "longitude": -71.5,
            "species": "ours",
            "water_distance_m": 150,
            "road_distance_m": 2500
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["species"] == "ours"
        assert "refuge_zones" in data
        assert "cooling_zones" in data
        
        print(f"✓ Ours probability: {data['probability_score']}%")
    
    def test_probability_invalid_species(self):
        """Test probability with invalid species returns 400"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/probability", json={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "invalid_species"
        })
        assert response.status_code == 422, f"Expected 422 for invalid species, got {response.status_code}"
        print("✓ Invalid species correctly rejected")


class TestCoolingZonesAPI:
    """Test GET /api/territory/analysis/cooling-zones - Recommended cooling zones"""
    
    def test_cooling_zones_orignal(self):
        """Test cooling zones for moose (high cooling preference)"""
        response = requests.get(f"{BASE_URL}/api/territory/analysis/cooling-zones", params={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "orignal"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "center" in data, "Missing center"
        assert "species" in data, "Missing species"
        assert "recommended_zones" in data, "Missing recommended_zones"
        assert "cooling_preference_level" in data, "Missing cooling_preference_level"
        
        # Moose should have high cooling preference
        assert data["cooling_preference_level"] == "high", f"Expected high cooling preference for moose"
        
        # Should have multiple zone types
        assert len(data["recommended_zones"]) >= 3, f"Expected at least 3 zones, got {len(data['recommended_zones'])}"
        
        # Moose should have wetland zone
        zone_types = [z["type"] for z in data["recommended_zones"]]
        assert "wetland" in zone_types, "Missing wetland zone for moose"
        
        print(f"✓ Orignal cooling zones: {len(data['recommended_zones'])} zones recommended")
    
    def test_cooling_zones_ours(self):
        """Test cooling zones for bear"""
        response = requests.get(f"{BASE_URL}/api/territory/analysis/cooling-zones", params={
            "latitude": 47.0,
            "longitude": -71.5,
            "species": "ours",
            "radius_km": 3.0
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Bear should have ravine zone
        zone_types = [z["type"] for z in data["recommended_zones"]]
        assert "ravine" in zone_types, "Missing ravine zone for bear"
        
        # Verify radius is respected
        assert data["radius_km"] == 3.0, f"Expected radius 3.0, got {data['radius_km']}"
        
        print(f"✓ Ours cooling zones: {len(data['recommended_zones'])} zones, radius {data['radius_km']}km")
    
    def test_cooling_zones_chevreuil(self):
        """Test cooling zones for deer (medium cooling preference)"""
        response = requests.get(f"{BASE_URL}/api/territory/analysis/cooling-zones", params={
            "latitude": 46.5,
            "longitude": -71.0,
            "species": "chevreuil"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["cooling_preference_level"] == "medium", f"Expected medium cooling preference for deer"
        
        # Verify best times are provided
        assert "best_times" in data
        assert len(data["best_times"]) > 0
        
        print(f"✓ Chevreuil cooling zones: {data['cooling_preference_level']} preference")
    
    def test_cooling_zones_invalid_species(self):
        """Test cooling zones with invalid species"""
        response = requests.get(f"{BASE_URL}/api/territory/analysis/cooling-zones", params={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "invalid"
        })
        assert response.status_code == 422, f"Expected 422 for invalid species, got {response.status_code}"
        print("✓ Invalid species correctly rejected")


class TestNutritionAPI:
    """Test POST /api/territory/analysis/nutrition - Nutritional analysis and product recommendations"""
    
    def test_nutrition_orignal_basic(self):
        """Test nutrition analysis for moose"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/nutrition", json={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "orignal",
            "forest_type": "mixte"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "species" in data, "Missing species"
        assert "nutritional_gaps" in data, "Missing nutritional_gaps"
        assert "recommended_products" in data, "Missing recommended_products"
        assert "food_sources_available" in data, "Missing food_sources_available"
        
        # Verify products are recommended
        assert len(data["recommended_products"]) > 0, "No products recommended"
        
        # Verify product structure
        product = data["recommended_products"][0]
        assert "name" in product, "Product missing name"
        assert "price_range" in product or "price" in product, "Product missing price/price_range"
        assert "relevance_score" in product, "Product missing relevance_score"
        assert "effectiveness_rating" in product, "Product missing effectiveness_rating"
        
        print(f"✓ Orignal nutrition: {len(data['nutritional_gaps'])} gaps, {len(data['recommended_products'])} products")
    
    def test_nutrition_with_season(self):
        """Test nutrition analysis with specific season"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/nutrition", json={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "chevreuil",
            "forest_type": "feuillus",
            "season": "printemps",
            "water_nearby": True
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Spring should have sodium deficiency for cervids
        gap_nutrients = [g["nutrient"] for g in data["nutritional_gaps"]]
        assert "sodium" in gap_nutrients, "Missing sodium gap in spring for deer"
        
        # Verify season is respected
        assert data["environment"]["season"] == "printemps"
        
        print(f"✓ Chevreuil spring nutrition: sodium gap detected")
    
    def test_nutrition_ours_automne(self):
        """Test nutrition for bear in autumn (pre-hibernation)"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/nutrition", json={
            "latitude": 47.0,
            "longitude": -71.5,
            "species": "ours",
            "forest_type": "mixte",
            "season": "automne"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Bear in autumn needs energy/fat for hibernation
        assert data["species"]["id"] == "ours"
        assert data["environment"]["season"] == "automne"
        
        # Verify summary is generated
        assert "summary" in data
        assert len(data["summary"]) > 0
        
        print(f"✓ Ours autumn nutrition: {len(data['recommended_products'])} products recommended")
    
    def test_nutrition_bionic_products_prioritized(self):
        """Test that BIONIC products are prioritized in recommendations"""
        response = requests.post(f"{BASE_URL}/api/territory/analysis/nutrition", json={
            "latitude": 46.8139,
            "longitude": -71.2080,
            "species": "orignal",
            "forest_type": "coniferes"
        })
        assert response.status_code == 200
        
        data = response.json()
        # Check that at least one BIONIC product is in top 3
        top_3 = data["recommended_products"][:3]
        bionic_in_top3 = any("BIONIC" in p.get("name", "") for p in top_3)
        assert bionic_in_top3, "No BIONIC product in top 3 recommendations"
        
        print(f"✓ BIONIC products prioritized in recommendations")


class TestOrdersAPI:
    """Test Orders API - Create and list orders"""
    
    @pytest.fixture
    def test_order_data(self):
        """Generate test order data"""
        return {
            "customer_name": f"TEST_User_{uuid.uuid4().hex[:6]}",
            "customer_email": "test@example.com",
            "customer_phone": "514-555-1234",
            "notes": "Test order from pytest",
            "items": [
                {
                    "product_id": "bionic_mineral_premium",
                    "product_name": "BIONIC™ Bloc Minéral Premium",
                    "quantity": 2,
                    "price": 34.99
                },
                {
                    "product_id": "bionic_protein_mix",
                    "product_name": "BIONIC™ Mélange Protéiné Forêt",
                    "quantity": 1,
                    "price": 44.99
                }
            ],
            "total": 114.97,
            "source": "territory_bionic"
        }
    
    def test_create_order(self, test_order_data):
        """Test creating a new order"""
        response = requests.post(f"{BASE_URL}/api/territory/orders", json=test_order_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "id" in data, "Missing order id"
        assert "customer_name" in data, "Missing customer_name"
        assert "status" in data, "Missing status"
        assert "items" in data, "Missing items"
        assert "total" in data, "Missing total"
        
        # Verify order is pending approval
        assert data["status"] == "pending_approval", f"Expected pending_approval, got {data['status']}"
        
        # Verify items count
        assert len(data["items"]) == 2, f"Expected 2 items, got {len(data['items'])}"
        
        # Verify total
        assert data["total"] == 114.97, f"Expected total 114.97, got {data['total']}"
        
        print(f"✓ Order created: {data['id']} - status: {data['status']}")
        return data["id"]
    
    def test_list_orders(self):
        """Test listing orders"""
        response = requests.get(f"{BASE_URL}/api/territory/orders")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of orders"
        
        # If there are orders, verify structure
        if len(data) > 0:
            order = data[0]
            assert "id" in order, "Order missing id"
            assert "customer_name" in order, "Order missing customer_name"
            assert "status" in order, "Order missing status"
            assert "items" in order, "Order missing items"
            assert "total" in order, "Order missing total"
            assert "created_at" in order, "Order missing created_at"
        
        print(f"✓ Orders list: {len(data)} orders found")
    
    def test_list_orders_by_status(self):
        """Test listing orders filtered by status"""
        response = requests.get(f"{BASE_URL}/api/territory/orders", params={"status": "pending_approval"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # All orders should have pending_approval status
        for order in data:
            assert order["status"] == "pending_approval", f"Expected pending_approval, got {order['status']}"
        
        print(f"✓ Filtered orders: {len(data)} pending orders")
    
    def test_create_order_and_verify_persistence(self, test_order_data):
        """Test that created order persists in database"""
        # Create order
        create_response = requests.post(f"{BASE_URL}/api/territory/orders", json=test_order_data)
        assert create_response.status_code == 200
        
        order_id = create_response.json()["id"]
        
        # List orders and verify our order exists
        list_response = requests.get(f"{BASE_URL}/api/territory/orders")
        assert list_response.status_code == 200
        
        orders = list_response.json()
        order_ids = [o["id"] for o in orders]
        assert order_id in order_ids, f"Created order {order_id} not found in orders list"
        
        print(f"✓ Order {order_id} persisted and found in list")
    
    def test_order_notifications(self):
        """Test order notifications endpoint"""
        response = requests.get(f"{BASE_URL}/api/territory/orders/notifications")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of notifications"
        
        print(f"✓ Notifications: {len(data)} unread notifications")


class TestAutoLogin:
    """Test auto-login functionality"""
    
    def test_auto_login(self):
        """Test auto-login by IP"""
        response = requests.get(f"{BASE_URL}/api/territory/users/auto-login")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Missing user id"
        assert "email" in data, "Missing email"
        assert "name" in data, "Missing name"
        
        print(f"✓ Auto-login: {data['name']} ({data['email']})")


class TestWMSSources:
    """Test WMS layer sources endpoint"""
    
    def test_wms_sources(self):
        """Test getting WMS layer sources"""
        response = requests.get(f"{BASE_URL}/api/territory/layers/wms-sources")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sources" in data, "Missing sources"
        
        # Verify expected WMS layers
        sources = data["sources"]
        expected_layers = ["foret_ecoforestiere", "hydrographie", "topographie", "routes_chemins"]
        for layer in expected_layers:
            assert layer in sources, f"Missing WMS layer: {layer}"
        
        print(f"✓ WMS sources: {len(sources)} layers available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
