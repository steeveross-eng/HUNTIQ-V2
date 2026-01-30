"""
Test suite for HUNTIQ Backup Cloud API
Tests /api/backup-cloud/stats and /api/backup-cloud/logs endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://geo-wildlife.preview.emergentagent.com').rstrip('/')


class TestBackupCloudStats:
    """Tests for /api/backup-cloud/stats endpoint"""
    
    def test_stats_endpoint_returns_200(self):
        """Test that stats endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Stats endpoint returned 200")
    
    def test_stats_response_structure(self):
        """Test that stats response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/stats")
        data = response.json()
        
        # Check required fields
        assert "success" in data, "Missing 'success' field"
        assert data["success"] == True, "success should be True"
        
        # Check atlas field (can be null)
        assert "atlas" in data, "Missing 'atlas' field"
        
        # Check gcs field (can be null)
        assert "gcs" in data, "Missing 'gcs' field"
        
        # Check schedule field
        assert "schedule" in data, "Missing 'schedule' field"
        
        # Check zip field
        assert "zip" in data, "Missing 'zip' field"
        
        # Check log_counts field
        assert "log_counts" in data, "Missing 'log_counts' field"
        
        print(f"✅ Stats response has correct structure")
    
    def test_stats_schedule_data(self):
        """Test that schedule data is valid"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/stats")
        data = response.json()
        
        schedule = data.get("schedule", {})
        
        # Check schedule fields
        assert "enabled" in schedule, "Missing 'enabled' in schedule"
        assert "zip_interval_minutes" in schedule, "Missing 'zip_interval_minutes' in schedule"
        assert "running" in schedule, "Missing 'running' in schedule"
        
        # Validate types
        assert isinstance(schedule["enabled"], bool), "enabled should be boolean"
        assert isinstance(schedule["zip_interval_minutes"], int), "zip_interval_minutes should be int"
        assert isinstance(schedule["running"], bool), "running should be boolean"
        
        print(f"✅ Schedule data is valid: enabled={schedule['enabled']}, interval={schedule['zip_interval_minutes']}min")
    
    def test_stats_zip_data(self):
        """Test that zip backup data is valid"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/stats")
        data = response.json()
        
        zip_data = data.get("zip", {})
        
        # Check zip fields
        assert "files" in zip_data, "Missing 'files' in zip data"
        
        # If there are files, validate structure
        if zip_data.get("files"):
            for file in zip_data["files"]:
                assert "filename" in file, "Missing 'filename' in zip file"
                assert "size_bytes" in file, "Missing 'size_bytes' in zip file"
                assert file["size_bytes"] > 0, "size_bytes should be positive"
        
        print(f"✅ ZIP data is valid: {len(zip_data.get('files', []))} files")
    
    def test_stats_log_counts(self):
        """Test that log counts are valid"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/stats")
        data = response.json()
        
        log_counts = data.get("log_counts", {})
        
        # Check expected log types
        expected_types = ["atlas_sync", "gcs_upload", "zip_create"]
        for log_type in expected_types:
            assert log_type in log_counts, f"Missing '{log_type}' in log_counts"
            assert isinstance(log_counts[log_type], int), f"{log_type} should be int"
            assert log_counts[log_type] >= 0, f"{log_type} should be non-negative"
        
        print(f"✅ Log counts are valid: {log_counts}")


class TestBackupCloudLogs:
    """Tests for /api/backup-cloud/logs endpoint"""
    
    def test_logs_endpoint_returns_200(self):
        """Test that logs endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/logs")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Logs endpoint returned 200")
    
    def test_logs_response_structure(self):
        """Test that logs response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/logs")
        data = response.json()
        
        # Check required fields
        assert "success" in data, "Missing 'success' field"
        assert data["success"] == True, "success should be True"
        
        assert "logs" in data, "Missing 'logs' field"
        assert isinstance(data["logs"], list), "logs should be a list"
        
        assert "total" in data, "Missing 'total' field"
        assert isinstance(data["total"], int), "total should be int"
        
        print(f"✅ Logs response has correct structure: {data['total']} logs")
    
    def test_logs_with_limit_parameter(self):
        """Test that limit parameter works"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/logs?limit=5")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["logs"]) <= 5, "Should return at most 5 logs"
        
        print(f"✅ Limit parameter works: returned {len(data['logs'])} logs")
    
    def test_logs_with_type_filter(self):
        """Test that backup_type filter works"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/logs?backup_type=email_notification")
        data = response.json()
        
        assert response.status_code == 200
        
        # All returned logs should be of the specified type
        for log in data["logs"]:
            assert log.get("type") == "email_notification", f"Expected email_notification, got {log.get('type')}"
        
        print(f"✅ Type filter works: {len(data['logs'])} email_notification logs")
    
    def test_logs_entry_structure(self):
        """Test that log entries have correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/logs?limit=10")
        data = response.json()
        
        if data["logs"]:
            log = data["logs"][0]
            
            # Check required fields in log entry
            assert "type" in log, "Missing 'type' in log entry"
            assert "timestamp" in log, "Missing 'timestamp' in log entry"
            assert "status" in log, "Missing 'status' in log entry"
            
            print(f"✅ Log entry structure is valid: type={log['type']}, status={log['status']}")
        else:
            print("⚠️ No logs to validate structure")


class TestBackupCloudScheduleStatus:
    """Tests for /api/backup-cloud/schedule/status endpoint"""
    
    def test_schedule_status_returns_200(self):
        """Test that schedule status endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/schedule/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Schedule status endpoint returned 200")
    
    def test_schedule_status_structure(self):
        """Test that schedule status has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/schedule/status")
        data = response.json()
        
        assert "running" in data, "Missing 'running' field"
        assert isinstance(data["running"], bool), "running should be boolean"
        
        print(f"✅ Schedule status: running={data['running']}")


class TestBackupCloudZipLatest:
    """Tests for /api/backup-cloud/zip/latest endpoint"""
    
    def test_zip_latest_returns_200(self):
        """Test that zip latest endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/zip/latest")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ ZIP latest endpoint returned 200")
    
    def test_zip_latest_structure(self):
        """Test that zip latest has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/zip/latest")
        data = response.json()
        
        assert "exists" in data, "Missing 'exists' field"
        assert isinstance(data["exists"], bool), "exists should be boolean"
        
        if data["exists"]:
            assert "filename" in data, "Missing 'filename' when exists=True"
            assert "size_bytes" in data, "Missing 'size_bytes' when exists=True"
            assert "download_url" in data, "Missing 'download_url' when exists=True"
            
            assert data["size_bytes"] > 0, "size_bytes should be positive"
            assert data["download_url"].startswith("/api/"), "download_url should start with /api/"
            
            print(f"✅ ZIP exists: {data['filename']} ({data['size_bytes']} bytes)")
        else:
            print("⚠️ No ZIP backup exists")


class TestBackupCloudNotifications:
    """Tests for notification-related endpoints"""
    
    def test_notification_status_returns_200(self):
        """Test that notification status endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/notifications/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Notification status endpoint returned 200")
    
    def test_notification_status_structure(self):
        """Test that notification status has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/notifications/status")
        data = response.json()
        
        assert "configured" in data, "Missing 'configured' field"
        assert "resend_available" in data, "Missing 'resend_available' field"
        
        print(f"✅ Notification status: configured={data['configured']}, resend_available={data['resend_available']}")


class TestBackupCloudResendStatus:
    """Tests for Resend API status endpoint"""
    
    def test_resend_status_returns_200(self):
        """Test that resend status endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/resend/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Resend status endpoint returned 200")
    
    def test_resend_status_structure(self):
        """Test that resend status has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/resend/status")
        data = response.json()
        
        assert "configured" in data, "Missing 'configured' field"
        assert "source" in data, "Missing 'source' field"
        
        print(f"✅ Resend status: configured={data['configured']}, source={data['source']}")


class TestBackupCloudAtlasStatus:
    """Tests for MongoDB Atlas status endpoint"""
    
    def test_atlas_status_returns_200(self):
        """Test that atlas status endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/atlas/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ Atlas status endpoint returned 200")
    
    def test_atlas_status_structure(self):
        """Test that atlas status has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/atlas/status")
        data = response.json()
        
        assert "configured" in data, "Missing 'configured' field"
        
        if data["configured"]:
            assert "enabled" in data, "Missing 'enabled' when configured=True"
            assert "status" in data, "Missing 'status' when configured=True"
        
        print(f"✅ Atlas status: configured={data['configured']}")


class TestBackupCloudGCSStatus:
    """Tests for Google Cloud Storage status endpoint"""
    
    def test_gcs_status_returns_200(self):
        """Test that GCS status endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/gcs/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ GCS status endpoint returned 200")
    
    def test_gcs_status_structure(self):
        """Test that GCS status has correct structure"""
        response = requests.get(f"{BASE_URL}/api/backup-cloud/gcs/status")
        data = response.json()
        
        assert "configured" in data, "Missing 'configured' field"
        
        if data["configured"]:
            assert "enabled" in data, "Missing 'enabled' when configured=True"
            assert "bucket_name" in data, "Missing 'bucket_name' when configured=True"
        
        print(f"✅ GCS status: configured={data['configured']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
