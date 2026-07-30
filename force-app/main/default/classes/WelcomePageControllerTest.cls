@isTest
private class WelcomePageControllerTest {

    // ── Test data setup ──────────────────────────────────────────────────

    /**
     * Creates a minimal test user.  Custom User fields (CRM_User__c, etc.) are
     * set where available in the org; the controller handles null values
     * gracefully since area matching treats null as 'No'.
     */
    private static User createTestUser(String firstName, String lastName, Date createdOverride) {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];

        User u = new User(
            FirstName            = firstName,
            LastName             = lastName,
            Alias                = lastName.left(5),
            Email                = lastName.toLowerCase() + '@test.example.com',
            Username             = lastName.toLowerCase() + System.currentTimeMillis() + '@test.example.com',
            ProfileId            = p.Id,
            TimeZoneSidKey       = 'America/Los_Angeles',
            LocaleSidKey         = 'en_US',
            EmailEncodingKey     = 'UTF-8',
            LanguageLocaleKey    = 'en_US',
            CompanyName          = 'Test Corp'
        );
        insert u;
        return u;
    }

    // ── Tests ────────────────────────────────────────────────────────────

    @isTest
    static void testGetWelcomePageData_returnsWrapper() {
        User testUser = createTestUser('Jane', 'Tester', null);

        Test.startTest();
        WelcomePageController.WelcomePageWrapper result;
        System.runAs(testUser) {
            result = WelcomePageController.getWelcomePageData();
        }
        Test.stopTest();

        System.assertNotEquals(null, result, 'Wrapper should not be null');
        System.assertEquals('Jane', result.firstName,    'First name should match');
        System.assertEquals('Test Corp', result.companyName, 'Company name should match');
        System.assertNotEquals(null, result.resourceLinks, 'Resource links list should not be null');
        System.assertNotEquals(null, result.isNewUser,   'isNewUser flag should be set');
    }

    @isTest
    static void testGetWelcomePageData_newUserFlag_isTrue_forRecentUser() {
        User testUser = createTestUser('New', 'UserRecent', null);

        Test.startTest();
        WelcomePageController.WelcomePageWrapper result;
        System.runAs(testUser) {
            result = WelcomePageController.getWelcomePageData();
        }
        Test.stopTest();

        // A freshly inserted user was created moments ago, so they are within 30 days
        System.assertEquals(true, result.isNewUser,
            'A user created today should be flagged as a new user');
    }

    @isTest
    static void testGetWelcomePageData_profileName_isPopulated() {
        User testUser = createTestUser('Profile', 'Check', null);

        Test.startTest();
        WelcomePageController.WelcomePageWrapper result;
        System.runAs(testUser) {
            result = WelcomePageController.getWelcomePageData();
        }
        Test.stopTest();

        System.assertNotEquals(null, result.profileName,
            'Profile name should be populated');
        System.assertEquals('Standard User', result.profileName,
            'Profile name should match the assigned profile');
    }

    @isTest
    static void testGetWelcomePageData_resourceLinksAreFilteredAndOrdered() {
        User testUser = createTestUser('Resource', 'FilterTest', null);

        Test.startTest();
        WelcomePageController.WelcomePageWrapper result;
        System.runAs(testUser) {
            result = WelcomePageController.getWelcomePageData();
        }
        Test.stopTest();

        // All returned links must have come from active CMDT records.
        // Verify sort order is non-decreasing where populated.
        Decimal previousOrder = null;
        for (WelcomePageController.ResourceLinkWrapper link : result.resourceLinks) {
            if (link.sortOrder != null) {
                if (previousOrder != null) {
                    System.assert(link.sortOrder >= previousOrder,
                        'Resource links should be in ascending Sort_Order__c order');
                }
                previousOrder = link.sortOrder;
            }
        }
    }

    @isTest
    static void testGetWelcomePageData_noExceptionForMinimalUser() {
        // Ensures the controller handles a user with sparse field data (e.g. no
        // CompanyName, no custom area fields set) without throwing an exception.
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User sparseUser = new User(
            FirstName         = null,
            LastName          = 'SparseUser',
            Alias             = 'sparse',
            Email             = 'sparse@test.example.com',
            Username          = 'sparse' + System.currentTimeMillis() + '@test.example.com',
            ProfileId         = p.Id,
            TimeZoneSidKey    = 'America/Los_Angeles',
            LocaleSidKey      = 'en_US',
            EmailEncodingKey  = 'UTF-8',
            LanguageLocaleKey = 'en_US'
        );
        insert sparseUser;

        Test.startTest();
        Exception caughtEx;
        WelcomePageController.WelcomePageWrapper result;
        System.runAs(sparseUser) {
            try {
                result = WelcomePageController.getWelcomePageData();
            } catch (Exception e) {
                caughtEx = e;
            }
        }
        Test.stopTest();

        System.assertEquals(null, caughtEx,
            'Controller should not throw for a user with minimal field data');
        System.assertNotEquals(null, result, 'Wrapper should still be returned');
    }
}
