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

    @AuraEnabled(cacheable=true)
    public static List<ResourceLink> getResourceLinks() {
        try {
            List<Welcome_Resource_Link__mdt> records = [
                SELECT MasterLabel, URL__c, Icon_Name__c, Resource_Type__c, Sort_Order__c
                FROM Welcome_Resource_Link__mdt
                WHERE Is_Active__c = true
                ORDER BY Sort_Order__c ASC NULLS LAST
            ];

            List<ResourceLink> links = new List<ResourceLink>();
            for (Welcome_Resource_Link__mdt r : records) {
                ResourceLink rl   = new ResourceLink();
                rl.label          = r.MasterLabel;
                rl.url            = r.URL__c;
                rl.iconName       = r.Icon_Name__c;
                rl.resourceType   = r.Resource_Type__c;
                rl.sortOrder      = r.Sort_Order__c;
                links.add(rl);
            }
            return links;

        } catch (Exception e) {
            throw new AuraHandledException(e.getTypeName() + ': ' + e.getMessage());
        }
    }

    public class UserContext {
        @AuraEnabled public String firstName;
        @AuraEnabled public String timeZoneSid;
    }

    public class ResourceLink {
        @AuraEnabled public String  label;
        @AuraEnabled public String  url;
        @AuraEnabled public String  iconName;
        @AuraEnabled public String  resourceType;
        @AuraEnabled public Decimal sortOrder;
    }

}