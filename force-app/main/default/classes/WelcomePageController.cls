public with sharing class WelcomePageController {

    @AuraEnabled(cacheable=true)
    public static UserContext getUserContext() {
        try {
            User u = [
                SELECT FirstName, TimeZoneSidKey
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];

            UserContext ctx  = new UserContext();
            ctx.firstName    = u.FirstName;
            ctx.timeZoneSid  = u.TimeZoneSidKey;
            return ctx;

        } catch (Exception e) {
            throw new AuraHandledException(e.getTypeName() + ': ' + e.getMessage());
        }
    }

    public class UserContext {
        @AuraEnabled public String firstName;
        @AuraEnabled public String timeZoneSid;
    }

}