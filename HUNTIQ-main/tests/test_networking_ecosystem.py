"""
Networking Ecosystem API Tests
Tests for: Posts, Leads, Contacts, Groups, Referrals, Wallet, Admin Stats
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bionic-terrain.preview.emergentagent.com').rstrip('/')

# Test user credentials
TEST_USER_ID = f"TEST_user_{uuid.uuid4().hex[:8]}"
TEST_USER_NAME = "Test Chasseur"


class TestNetworkingPosts:
    """Content Posts API tests"""
    
    created_post_id = None
    
    def test_get_posts(self):
        """GET /api/networking/posts - Get all posts"""
        response = requests.get(f"{BASE_URL}/api/networking/posts")
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data
        assert "total" in data
        assert isinstance(data["posts"], list)
    
    def test_create_post(self):
        """POST /api/networking/posts - Create a new post"""
        response = requests.post(f"{BASE_URL}/api/networking/posts", params={
            "author_id": TEST_USER_ID,
            "author_name": TEST_USER_NAME,
            "body": "Test post from pytest - Mon expérience de chasse",
            "title": "Test Post Title",
            "content_type": "text",
            "visibility": "public"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "post" in data
        assert data["post"]["author_id"] == TEST_USER_ID
        assert data["post"]["body"] == "Test post from pytest - Mon expérience de chasse"
        TestNetworkingPosts.created_post_id = data["post"]["id"]
    
    def test_get_single_post(self):
        """GET /api/networking/posts/{post_id} - Get single post"""
        if not TestNetworkingPosts.created_post_id:
            pytest.skip("No post created")
        
        response = requests.get(f"{BASE_URL}/api/networking/posts/{TestNetworkingPosts.created_post_id}")
        assert response.status_code == 200
        data = response.json()
        assert "post" in data
        assert data["post"]["id"] == TestNetworkingPosts.created_post_id
    
    def test_like_post(self):
        """POST /api/networking/like - Like a post"""
        if not TestNetworkingPosts.created_post_id:
            pytest.skip("No post created")
        
        response = requests.post(f"{BASE_URL}/api/networking/like", params={
            "user_id": TEST_USER_ID,
            "target_type": "post",
            "target_id": TestNetworkingPosts.created_post_id
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["action"] in ["liked", "unliked"]
    
    def test_get_posts_filtered_by_user(self):
        """GET /api/networking/posts?user_id=X - Filter posts by user"""
        response = requests.get(f"{BASE_URL}/api/networking/posts", params={
            "user_id": TEST_USER_ID
        })
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data
        # All posts should belong to the test user
        for post in data["posts"]:
            assert post["author_id"] == TEST_USER_ID


class TestNetworkingLeads:
    """Lead Tracking API tests"""
    
    created_lead_id = None
    
    def test_get_leads_empty(self):
        """GET /api/networking/leads - Get leads for user"""
        response = requests.get(f"{BASE_URL}/api/networking/leads", params={
            "owner_id": TEST_USER_ID
        })
        assert response.status_code == 200
        data = response.json()
        assert "leads" in data
        assert "stats" in data
        assert isinstance(data["leads"], list)
    
    def test_create_lead(self):
        """POST /api/networking/leads - Create a new lead"""
        response = requests.post(f"{BASE_URL}/api/networking/leads", params={
            "owner_id": TEST_USER_ID,
            "name": "TEST_Jean Prospect",
            "email": "jean.prospect@test.com",
            "phone": "514-555-1234",
            "source": "marketplace",
            "interest_type": "buy",
            "estimated_value": 500.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "lead" in data
        assert data["lead"]["name"] == "TEST_Jean Prospect"
        assert data["lead"]["status"] == "new"
        TestNetworkingLeads.created_lead_id = data["lead"]["id"]
    
    def test_get_leads_with_stats(self):
        """GET /api/networking/leads - Verify stats after creation"""
        response = requests.get(f"{BASE_URL}/api/networking/leads", params={
            "owner_id": TEST_USER_ID
        })
        assert response.status_code == 200
        data = response.json()
        assert data["stats"]["total"] >= 1
        assert data["stats"]["new"] >= 1
    
    def test_update_lead_status(self):
        """PUT /api/networking/leads/{lead_id} - Update lead status"""
        if not TestNetworkingLeads.created_lead_id:
            pytest.skip("No lead created")
        
        response = requests.put(f"{BASE_URL}/api/networking/leads/{TestNetworkingLeads.created_lead_id}", params={
            "owner_id": TEST_USER_ID,
            "status": "contacted"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_add_lead_note(self):
        """POST /api/networking/leads/{lead_id}/note - Add note to lead"""
        if not TestNetworkingLeads.created_lead_id:
            pytest.skip("No lead created")
        
        response = requests.post(f"{BASE_URL}/api/networking/leads/{TestNetworkingLeads.created_lead_id}/note", params={
            "owner_id": TEST_USER_ID,
            "note": "Premier contact effectué par téléphone"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestNetworkingContacts:
    """Contacts API tests"""
    
    created_contact_id = None
    
    def test_get_contacts_empty(self):
        """GET /api/networking/contacts - Get contacts for user"""
        response = requests.get(f"{BASE_URL}/api/networking/contacts", params={
            "owner_id": TEST_USER_ID
        })
        assert response.status_code == 200
        data = response.json()
        assert "contacts" in data
        assert "total" in data
    
    def test_create_contact(self):
        """POST /api/networking/contacts - Create a new contact"""
        response = requests.post(f"{BASE_URL}/api/networking/contacts", params={
            "owner_id": TEST_USER_ID,
            "name": "TEST_Pierre Chasseur",
            "email": "pierre@chasse.ca",
            "phone": "418-555-9876",
            "relationship": "hunting_partner",
            "company": "Club de Chasse Laurentides"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "contact" in data
        assert data["contact"]["name"] == "TEST_Pierre Chasseur"
        assert data["contact"]["relationship"] == "hunting_partner"
        TestNetworkingContacts.created_contact_id = data["contact"]["id"]
    
    def test_get_contacts_after_creation(self):
        """GET /api/networking/contacts - Verify contact was created"""
        response = requests.get(f"{BASE_URL}/api/networking/contacts", params={
            "owner_id": TEST_USER_ID
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
    
    def test_update_contact(self):
        """PUT /api/networking/contacts/{contact_id} - Update contact"""
        if not TestNetworkingContacts.created_contact_id:
            pytest.skip("No contact created")
        
        response = requests.put(f"{BASE_URL}/api/networking/contacts/{TestNetworkingContacts.created_contact_id}", params={
            "owner_id": TEST_USER_ID,
            "is_favorite": True,
            "notes": "Excellent partenaire de chasse"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestNetworkingGroups:
    """Groups API tests"""
    
    created_group_id = None
    
    def test_get_groups_empty(self):
        """GET /api/networking/groups - Get groups for user"""
        response = requests.get(f"{BASE_URL}/api/networking/groups", params={
            "user_id": TEST_USER_ID
        })
        assert response.status_code == 200
        data = response.json()
        assert "groups" in data
        assert "total" in data
    
    def test_create_group(self):
        """POST /api/networking/groups - Create a new group"""
        response = requests.post(f"{BASE_URL}/api/networking/groups", params={
            "owner_id": TEST_USER_ID,
            "owner_name": TEST_USER_NAME,
            "name": "TEST_Club de Chasse Laurentides",
            "description": "Groupe de chasseurs passionnés",
            "group_type": "hunting_club",
            "privacy": "private"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "group" in data
        assert data["group"]["name"] == "TEST_Club de Chasse Laurentides"
        assert data["group"]["member_count"] == 1
        assert TEST_USER_ID in data["group"]["member_ids"]
        TestNetworkingGroups.created_group_id = data["group"]["id"]
    
    def test_get_group_details(self):
        """GET /api/networking/groups/{group_id} - Get group details"""
        if not TestNetworkingGroups.created_group_id:
            pytest.skip("No group created")
        
        response = requests.get(f"{BASE_URL}/api/networking/groups/{TestNetworkingGroups.created_group_id}")
        assert response.status_code == 200
        data = response.json()
        assert "group" in data
        assert "members" in data
        assert data["group"]["id"] == TestNetworkingGroups.created_group_id


class TestNetworkingReferral:
    """Referral & Rewards API tests"""
    
    referral_code = None
    
    def test_get_or_create_referral_code(self):
        """GET /api/networking/referral/code/{user_id} - Get or create referral code"""
        response = requests.get(f"{BASE_URL}/api/networking/referral/code/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "code" in data
        assert "stats" in data
        assert data["code"]["owner_id"] == TEST_USER_ID
        assert len(data["code"]["code"]) == 8  # 8 character code
        assert data["code"]["is_active"] == True
        TestNetworkingReferral.referral_code = data["code"]["code"]
    
    def test_referral_stats_structure(self):
        """Verify referral stats structure"""
        response = requests.get(f"{BASE_URL}/api/networking/referral/code/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        stats = data["stats"]
        assert "total_referrals" in stats
        assert "pending" in stats
        assert "verified" in stats
        assert "rewarded" in stats
        assert "total_earned" in stats
    
    def test_get_user_referrals(self):
        """GET /api/networking/referrals/{user_id} - Get user's referrals"""
        response = requests.get(f"{BASE_URL}/api/networking/referrals/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "referrals" in data
        assert isinstance(data["referrals"], list)


class TestNetworkingWallet:
    """Wallet API tests"""
    
    def test_get_or_create_wallet(self):
        """GET /api/networking/wallet/{user_id} - Get or create wallet"""
        response = requests.get(f"{BASE_URL}/api/networking/wallet/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "wallet" in data
        assert "recent_transactions" in data
        assert data["wallet"]["user_id"] == TEST_USER_ID
        assert data["wallet"]["is_active"] == True
    
    def test_wallet_structure(self):
        """Verify wallet structure"""
        response = requests.get(f"{BASE_URL}/api/networking/wallet/{TEST_USER_ID}")
        assert response.status_code == 200
        wallet = response.json()["wallet"]
        
        # Check all required fields
        assert "balance_cad" in wallet
        assert "balance_credits" in wallet
        assert "total_earned" in wallet
        assert "total_spent" in wallet
        assert "total_withdrawn" in wallet
        assert "pending_balance" in wallet
    
    def test_get_wallet_transactions(self):
        """GET /api/networking/wallet/{user_id}/transactions - Get transactions"""
        response = requests.get(f"{BASE_URL}/api/networking/wallet/{TEST_USER_ID}/transactions")
        assert response.status_code == 200
        data = response.json()
        assert "transactions" in data
        assert "total" in data


class TestNetworkingAdminStats:
    """Admin Stats API tests"""
    
    def test_get_admin_stats(self):
        """GET /api/networking/admin/stats - Get ecosystem stats"""
        response = requests.get(f"{BASE_URL}/api/networking/admin/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all stat categories
        assert "posts" in data
        assert "leads" in data
        assert "contacts" in data
        assert "groups" in data
        assert "referrals" in data
        assert "wallets" in data
    
    def test_admin_stats_structure(self):
        """Verify admin stats structure"""
        response = requests.get(f"{BASE_URL}/api/networking/admin/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Posts stats
        assert "total" in data["posts"]
        assert "this_week" in data["posts"]
        
        # Leads stats
        assert "total" in data["leads"]
        assert "new" in data["leads"]
        assert "converted" in data["leads"]
        
        # Groups stats
        assert "total" in data["groups"]
        assert "active" in data["groups"]
        
        # Referrals stats
        assert "total" in data["referrals"]
        assert "pending" in data["referrals"]
        assert "rewarded" in data["referrals"]
        
        # Wallets stats
        assert "total" in data["wallets"]
        assert "total_credits" in data["wallets"]
    
    def test_get_pending_referrals(self):
        """GET /api/networking/admin/pending-referrals - Get pending referrals"""
        response = requests.get(f"{BASE_URL}/api/networking/admin/pending-referrals")
        assert response.status_code == 200
        data = response.json()
        assert "referrals" in data
        assert isinstance(data["referrals"], list)


class TestCleanup:
    """Cleanup test data"""
    
    def test_delete_test_post(self):
        """DELETE /api/networking/posts/{post_id} - Delete test post"""
        if TestNetworkingPosts.created_post_id:
            response = requests.delete(
                f"{BASE_URL}/api/networking/posts/{TestNetworkingPosts.created_post_id}",
                params={"author_id": TEST_USER_ID}
            )
            assert response.status_code == 200
    
    def test_delete_test_lead(self):
        """DELETE /api/networking/leads/{lead_id} - Delete test lead"""
        if TestNetworkingLeads.created_lead_id:
            response = requests.delete(
                f"{BASE_URL}/api/networking/leads/{TestNetworkingLeads.created_lead_id}",
                params={"owner_id": TEST_USER_ID}
            )
            assert response.status_code == 200
    
    def test_delete_test_contact(self):
        """DELETE /api/networking/contacts/{contact_id} - Delete test contact"""
        if TestNetworkingContacts.created_contact_id:
            response = requests.delete(
                f"{BASE_URL}/api/networking/contacts/{TestNetworkingContacts.created_contact_id}",
                params={"owner_id": TEST_USER_ID}
            )
            assert response.status_code == 200
    
    def test_delete_test_group(self):
        """DELETE /api/networking/groups/{group_id} - Delete test group"""
        if TestNetworkingGroups.created_group_id:
            response = requests.delete(
                f"{BASE_URL}/api/networking/groups/{TestNetworkingGroups.created_group_id}",
                params={"owner_id": TEST_USER_ID}
            )
            assert response.status_code == 200
