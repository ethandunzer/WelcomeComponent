@isTest
private class WelcomePageControllerTest {

    @isTest
    static void getUserContext_returnsData() {
        Test.startTest();
        WelcomePageController.UserContext result = WelcomePageController.getUserContext();
        Test.stopTest();

        System.assertNotEquals(null, result, 'UserContext should not be null');
        System.assertNotEquals(null, result.timeZoneSid, 'TimeZoneSidKey should be populated');
    }

    @isTest
    static void getResourceLinks_returnsData() {
        Test.startTest();
        List<WelcomePageController.ResourceLink> result = WelcomePageController.getResourceLinks();
        Test.stopTest();

        System.assertNotEquals(null, result, 'Resource links list should not be null');
    }
}
