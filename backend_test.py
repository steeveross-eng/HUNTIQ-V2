#!/usr/bin/env python3
"""
Backend API Testing for HUNTIQ-V2 Project
Tests all backend endpoints to ensure they are working correctly.
"""

import requests
import sys
import json
from datetime import datetime

class HuntiqBackendTester:
    def __init__(self, base_url="https://module-analyzer-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    else:
                        print(f"   Response: {str(response_data)[:100]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout")
            self.failed_tests.append({'name': name, 'error': 'Timeout'})
            return False, None
        except requests.exceptions.ConnectionError:
            print(f"❌ FAILED - Connection error")
            self.failed_tests.append({'name': name, 'error': 'Connection error'})
            return False, None
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({'name': name, 'error': str(e)})
            return False, None

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n" + "="*50)
        print("🏥 TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test main API health
        self.run_test("API Health Check", "GET", "health")
        
        # Test BIONIC territory health
        self.run_test("BIONIC Territory Health", "GET", "bionic-territory/health")
        
        # Test root endpoint
        self.run_test("API Root", "GET", "")

    def test_core_endpoints(self):
        """Test core API endpoints"""
        print("\n" + "="*50)
        print("🔧 TESTING CORE ENDPOINTS")
        print("="*50)
        
        # Test products endpoints
        self.run_test("Get Products", "GET", "products")
        self.run_test("Get Top Products", "GET", "products/top?limit=5")
        
        # Test site status
        self.run_test("Site Status", "GET", "site/status")
        
        # Test maintenance status
        self.run_test("Maintenance Status", "GET", "maintenance/status")

    def test_territory_endpoints(self):
        """Test territory-related endpoints"""
        print("\n" + "="*50)
        print("🗺️ TESTING TERRITORY ENDPOINTS")
        print("="*50)
        
        # Test territory users auto-login
        self.run_test("Territory Auto-Login", "GET", "territory/users/auto-login")
        
        # Test territory rankings
        self.run_test("Territory Rankings", "GET", "territory/rankings")
        
        # Test GPS hotspots
        self.run_test("GPS Hotspots", "GET", "territory/hotspots")

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("🔐 TESTING AUTH ENDPOINTS")
        print("="*50)
        
        # Test auth endpoints (should return proper error codes)
        self.run_test("Auth Login (no data)", "POST", "auth/login", 422)  # Validation error expected
        self.run_test("Auth Register (no data)", "POST", "auth/register", 422)  # Validation error expected
        self.run_test("Auth Auto-Login", "GET", "auth/auto-login")

    def test_admin_endpoints(self):
        """Test admin endpoints (should require auth)"""
        print("\n" + "="*50)
        print("👑 TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        # Test admin login (should fail without password)
        self.run_test("Admin Login (no data)", "POST", "admin/login", 422)  # Validation error expected
        
        # Test admin stats (might require auth)
        self.run_test("Admin Stats", "GET", "admin/stats")

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting HUNTIQ-V2 Backend API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run test suites
        self.test_health_endpoints()
        self.test_core_endpoints()
        self.test_territory_endpoints()
        self.test_auth_endpoints()
        self.test_admin_endpoints()
        
        # Print summary
        self.print_summary()
        
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Total Tests: {self.tests_run}")
        print(f"🎯 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"   {i}. {test['name']}")
                if 'expected' in test:
                    print(f"      Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"      Error: {test['error']}")
                if 'response' in test:
                    print(f"      Response: {test['response']}")
        
        print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def main():
    """Main test runner"""
    tester = HuntiqBackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()