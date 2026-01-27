#!/usr/bin/env python3
"""
Backend API Testing for Cloud Backup System
Tests all /api/backup-cloud/* endpoints
"""

import requests
import sys
import json
from datetime import datetime

class BackupCloudAPITester:
    def __init__(self, base_url="https://huntiq-tracker.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
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
                    if isinstance(response_data, dict):
                        if 'success' in response_data:
                            print(f"   Success: {response_data.get('success')}")
                        if 'message' in response_data:
                            print(f"   Message: {response_data.get('message')}")
                        if 'configured' in response_data:
                            print(f"   Configured: {response_data.get('configured')}")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Timeout after 10 seconds")
            self.failed_tests.append({'name': name, 'error': 'Timeout'})
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({'name': name, 'error': str(e)})
            return False, {}

    def test_backup_stats(self):
        """Test GET /api/backup-cloud/stats"""
        return self.run_test(
            "Backup Cloud Stats",
            "GET",
            "api/backup-cloud/stats",
            200
        )

    def test_atlas_status(self):
        """Test GET /api/backup-cloud/atlas/status"""
        return self.run_test(
            "MongoDB Atlas Status",
            "GET", 
            "api/backup-cloud/atlas/status",
            200
        )

    def test_gcs_status(self):
        """Test GET /api/backup-cloud/gcs/status"""
        return self.run_test(
            "Google Cloud Storage Status",
            "GET",
            "api/backup-cloud/gcs/status", 
            200
        )

    def test_zip_latest(self):
        """Test GET /api/backup-cloud/zip/latest"""
        return self.run_test(
            "Latest ZIP Backup Info",
            "GET",
            "api/backup-cloud/zip/latest",
            200
        )

    def test_zip_update(self):
        """Test POST /api/backup-cloud/zip/update"""
        return self.run_test(
            "Create/Update ZIP Backup",
            "POST",
            "api/backup-cloud/zip/update",
            200
        )

    def test_schedule_status(self):
        """Test GET /api/backup-cloud/schedule/status"""
        return self.run_test(
            "Backup Schedule Status",
            "GET",
            "api/backup-cloud/schedule/status",
            200
        )

    def test_mongodb_atlas_guide(self):
        """Test GET /api/backup-cloud/guides/mongodb-atlas"""
        return self.run_test(
            "MongoDB Atlas Configuration Guide",
            "GET",
            "api/backup-cloud/guides/mongodb-atlas",
            200
        )

    def test_gcs_guide(self):
        """Test GET /api/backup-cloud/guides/google-cloud-storage"""
        return self.run_test(
            "Google Cloud Storage Configuration Guide", 
            "GET",
            "api/backup-cloud/guides/google-cloud-storage",
            200
        )

    def test_schedule_start(self):
        """Test POST /api/backup-cloud/schedule/start"""
        schedule_data = {
            "zip_interval_minutes": 1,
            "atlas_interval_minutes": 60,
            "gcs_interval_minutes": 60,
            "enabled": True
        }
        return self.run_test(
            "Start Backup Schedule",
            "POST",
            "api/backup-cloud/schedule/start",
            200,
            data=schedule_data
        )

    def test_atlas_sync_unconfigured(self):
        """Test POST /api/backup-cloud/atlas/sync (should fail if not configured)"""
        success, response = self.run_test(
            "Atlas Sync (Unconfigured - Should Fail)",
            "POST",
            "api/backup-cloud/atlas/sync",
            400  # Expecting 400 since Atlas is not configured
        )
        return success, response

    def test_gcs_upload_unconfigured(self):
        """Test POST /api/backup-cloud/gcs/upload (should fail if not configured)"""
        success, response = self.run_test(
            "GCS Upload (Unconfigured - Should Fail)",
            "POST", 
            "api/backup-cloud/gcs/upload",
            400  # Expecting 400 since GCS is not configured
        )
        return success, response

    def test_backup_logs(self):
        """Test GET /api/backup-cloud/logs"""
        return self.run_test(
            "Backup Logs",
            "GET",
            "api/backup-cloud/logs?limit=10",
            200
        )

def main():
    print("🚀 Starting Cloud Backup API Tests")
    print("=" * 50)
    
    tester = BackupCloudAPITester()
    
    # Test all backup cloud endpoints
    print("\n📊 Testing Core Stats & Status APIs...")
    tester.test_backup_stats()
    tester.test_atlas_status()
    tester.test_gcs_status()
    tester.test_schedule_status()
    
    print("\n📦 Testing ZIP Backup APIs...")
    tester.test_zip_latest()
    tester.test_zip_update()
    
    print("\n📚 Testing Configuration Guides...")
    tester.test_mongodb_atlas_guide()
    tester.test_gcs_guide()
    
    print("\n⏰ Testing Scheduler APIs...")
    tester.test_schedule_start()
    
    print("\n🔄 Testing Sync/Upload APIs (Expected to fail - not configured)...")
    tester.test_atlas_sync_unconfigured()
    tester.test_gcs_upload_unconfigured()
    
    print("\n📋 Testing Logs API...")
    tester.test_backup_logs()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for test in tester.failed_tests:
            print(f"  - {test['name']}: {test.get('error', f\"Expected {test.get('expected')}, got {test.get('actual')}\"")}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())