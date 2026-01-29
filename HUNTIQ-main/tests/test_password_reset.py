"""
Password Reset API Tests
Tests for forgot-password, verify-reset-token, and reset-password endpoints
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://huntiq-refactor.preview.emergentagent.com').rstrip('/')


class TestPasswordResetEndpoints:
    """Test password reset functionality"""
    
    def test_forgot_password_existing_email(self):
        """Test forgot password with existing email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "steeve.ross@gmail.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "Si un compte existe" in data["message"]
        print("✅ Forgot password with existing email - PASS")
    
    def test_forgot_password_nonexistent_email(self):
        """Test forgot password with non-existent email (should still return success for security)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "nonexistent_user_12345@example.com"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should return success to prevent email enumeration
        assert data["success"] == True
        assert "Si un compte existe" in data["message"]
        print("✅ Forgot password with non-existent email (security) - PASS")
    
    def test_forgot_password_invalid_email_format(self):
        """Test forgot password with invalid email format"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "invalid-email"}
        )
        # Should still accept it (validation is on backend)
        assert response.status_code in [200, 422]
        print("✅ Forgot password with invalid email format - PASS")
    
    def test_verify_reset_token_invalid(self):
        """Test verify reset token with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/verify-reset-token/invalid_test_token_12345"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
        assert "invalide" in data["message"].lower() or "invalid" in data["message"].lower()
        print("✅ Verify invalid reset token - PASS")
    
    def test_verify_reset_token_empty(self):
        """Test verify reset token with empty token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/verify-reset-token/"
        )
        # Should return 404 or 422 for missing token
        assert response.status_code in [404, 422, 307]
        print("✅ Verify empty reset token - PASS")
    
    def test_reset_password_invalid_token(self):
        """Test reset password with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "token": "invalid_test_token_12345",
                "new_password": "newpassword123"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "invalide" in data["detail"].lower() or "expiré" in data["detail"].lower()
        print("✅ Reset password with invalid token - PASS")
    
    def test_reset_password_short_password(self):
        """Test reset password with too short password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "token": "some_token",
                "new_password": "123"  # Too short
            }
        )
        # Should return 400 or 422 for validation error
        assert response.status_code in [400, 422]
        print("✅ Reset password with short password validation - PASS")
    
    def test_reset_password_missing_token(self):
        """Test reset password with missing token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "new_password": "newpassword123"
            }
        )
        assert response.status_code == 422  # Validation error
        print("✅ Reset password with missing token - PASS")
    
    def test_reset_password_missing_password(self):
        """Test reset password with missing password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "token": "some_token"
            }
        )
        assert response.status_code == 422  # Validation error
        print("✅ Reset password with missing password - PASS")


class TestSEOMetaTags:
    """Test SEO meta tags for site title"""
    
    def test_seo_meta_endpoint(self):
        """Test SEO meta endpoint returns correct title"""
        response = requests.get(f"{BASE_URL}/api/seo/meta/")
        assert response.status_code == 200
        data = response.json()
        
        # Check title contains "Chasse Bionic TM"
        assert "Chasse Bionic TM" in data["title"]
        print(f"✅ SEO title: {data['title']} - PASS")
        
        # Check schema name
        assert data["schema"]["name"] == "Chasse Bionic TM"
        print(f"✅ Schema name: {data['schema']['name']} - PASS")
        
        # Check keywords include both French and English names
        assert "Chasse Bionic" in data["keywords"]
        assert "Bionic Hunt" in data["keywords"]
        print("✅ Keywords include both FR and EN names - PASS")
    
    def test_seo_meta_description(self):
        """Test SEO meta description is present"""
        response = requests.get(f"{BASE_URL}/api/seo/meta/")
        assert response.status_code == 200
        data = response.json()
        
        assert "description" in data
        assert len(data["description"]) > 50
        print(f"✅ Meta description present ({len(data['description'])} chars) - PASS")
    
    def test_seo_meta_og_tags(self):
        """Test Open Graph tags are present"""
        response = requests.get(f"{BASE_URL}/api/seo/meta/")
        assert response.status_code == 200
        data = response.json()
        
        assert "og_image" in data
        assert "og_type" in data
        assert data["og_type"] == "website"
        print("✅ Open Graph tags present - PASS")


class TestAuthEndpoints:
    """Test authentication endpoints work correctly"""
    
    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@chasse.ca",
                "password": "test123456"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        print("✅ Login with valid credentials - PASS")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@chasse.ca",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        print("✅ Login with invalid credentials returns 401 - PASS")
    
    def test_verify_session_invalid_token(self):
        """Test verify session with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/verify?token=invalid_token_12345"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
        print("✅ Verify invalid session token - PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
