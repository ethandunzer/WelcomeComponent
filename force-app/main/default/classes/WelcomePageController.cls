public with sharing class WelcomePageController {

    @AuraEnabled(cacheable=true)
    public static UserContext getUserContext() {
        try {
            User u = [
                SELECT FirstName, TimeZoneSidKey, UserRole.Name
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];

            UserContext ctx  = new UserContext();
            ctx.firstName    = u.FirstName;
            ctx.timeZoneSid  = u.TimeZoneSidKey;
            ctx.roleName     = u.UserRole?.Name;
            return ctx;

        } catch (Exception e) {
            throw new AuraHandledException(e.getTypeName() + ': ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<ResourceLink> getResourceLinks() {
        try {
            User runningUser = [
                SELECT UserRole.Name
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];
            String roleName = runningUser.UserRole?.Name;

            List<Welcome_Resource_Link__mdt> records = [
                SELECT MasterLabel, URL__c, Icon_Name__c, Resource_Type__c,
                       Salesforce_Area__c, Description__c, User_Type__c, Sort_Order__c
                FROM Welcome_Resource_Link__mdt
                WHERE Is_Active__c = true
                WITH SYSTEM_MODE
                ORDER BY Sort_Order__c ASC NULLS LAST
            ];

            List<ResourceLink> links = new List<ResourceLink>();
            for (Welcome_Resource_Link__mdt r : records) {
                if (!isVisibleForUserType(r.User_Type__c, roleName)) {
                    continue;
                }
                ResourceLink rl   = new ResourceLink();
                rl.label          = r.MasterLabel;
                rl.url            = r.URL__c;
                rl.iconName       = r.Icon_Name__c;
                rl.resourceType   = r.Resource_Type__c;
                rl.salesforceArea = r.Salesforce_Area__c;
                rl.description    = r.Description__c;
                rl.sortOrder      = r.Sort_Order__c;
                links.add(rl);
            }
            return links;

        } catch (Exception e) {
            throw new AuraHandledException(e.getTypeName() + ': ' + e.getMessage());
        }
    }

    private static final Set<String> INTERNAL_ROLES = new Set<String>{
        'Share All', 'System Admins', 'Internal - Users'
    };

    private static final Set<String> EXTERNAL_ROLES = new Set<String>{
        'Share All', 'System Admins', 'External - Users'
    };

    private static Boolean isVisibleForUserType(String userType, String roleName) {
        if (String.isBlank(userType) || userType == 'Both') {
            return true;
        }
        if (userType == 'Internal') {
            return INTERNAL_ROLES.contains(roleName);
        }
        if (userType == 'External') {
            return EXTERNAL_ROLES.contains(roleName);
        }
        return false;
    }

    public class UserContext {
        @AuraEnabled public String firstName;
        @AuraEnabled public String timeZoneSid;
        @AuraEnabled public String roleName;
    }

    public class ResourceLink {
        @AuraEnabled public String  label;
        @AuraEnabled public String  url;
        @AuraEnabled public String  iconName;
        @AuraEnabled public String  resourceType;
        @AuraEnabled public String  salesforceArea;
        @AuraEnabled public String  description;
        @AuraEnabled public Decimal sortOrder;
    }

}