public with sharing class WelcomePageController {

    @AuraEnabled(cacheable=true)
    public static WelcomePageWrapper getWelcomePageData() {
        User runningUser = [
            SELECT Id, FirstName, CompanyName, CreatedDate, Profile.Name,
                   CRM_User__c, PSA_User__c, SMS_User__c, OBO_User__c,
                   INV_User__c, SC_User__c, NZC_User__c
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        List<Welcome_Resource_Link__mdt> allLinks = [
            SELECT MasterLabel, URL__c, Icon_Name__c, Salesforce_Area__c,
                   Resource_Type__c, Profile_Criteria__c, Company_Criteria__c,
                   Sort_Order__c, Is_Active__c
            FROM Welcome_Resource_Link__mdt
            WHERE Is_Active__c = true
            ORDER BY Sort_Order__c ASC NULLS LAST
        ];

        WelcomePageWrapper wrapper = new WelcomePageWrapper();
        wrapper.firstName = runningUser.FirstName;
        wrapper.companyName = runningUser.CompanyName;
        wrapper.createdDate = runningUser.CreatedDate;
        wrapper.profileName = runningUser.Profile.Name;
        wrapper.isNewUser = runningUser.CreatedDate != null && runningUser.CreatedDate.date().daysBetween(Date.today()) <= 30;
        wrapper.crmUser = runningUser.CRM_User__c;
        wrapper.psaUser = runningUser.PSA_User__c;
        wrapper.smsUser = runningUser.SMS_User__c;
        wrapper.oboUser = runningUser.OBO_User__c;
        wrapper.invUser = runningUser.INV_User__c;
        wrapper.scUser = runningUser.SC_User__c;
        wrapper.nzcUser = runningUser.NZC_User__c;

        wrapper.resourceLinks = new List<ResourceLinkWrapper>();
        for (Welcome_Resource_Link__mdt link : allLinks) {
            if (isLinkVisible(link, runningUser)) {
                ResourceLinkWrapper rlw = new ResourceLinkWrapper();
                rlw.label = link.MasterLabel;
                rlw.url = link.URL__c;
                rlw.iconName = link.Icon_Name__c;
                rlw.salesforceArea = link.Salesforce_Area__c;
                rlw.resourceType = link.Resource_Type__c;
                rlw.sortOrder = link.Sort_Order__c;
                wrapper.resourceLinks.add(rlw);
            }
        }

        return wrapper;
    }

    private static Boolean isLinkVisible(Welcome_Resource_Link__mdt link, User u) {
        // Profile criteria — blank means visible to all profiles
        if (String.isNotBlank(link.Profile_Criteria__c)) {
            Boolean profileMatch = false;
            for (String criterion : link.Profile_Criteria__c.split(',')) {
                if (criterion.trim().equalsIgnoreCase(u.Profile.Name)) {
                    profileMatch = true;
                    break;
                }
            }
            if (!profileMatch) {
                return false;
            }
        }

        // Company criteria — blank means visible to all companies
        if (String.isNotBlank(link.Company_Criteria__c)) {
            if (!link.Company_Criteria__c.trim().equalsIgnoreCase(u.CompanyName)) {
                return false;
            }
        }

        // Salesforce area — General or blank means visible to all
        String area = link.Salesforce_Area__c;
        if (String.isBlank(area) || area == 'General') {
            return true;
        }
        if (area == 'CRM') { return u.CRM_User__c == 'Yes'; }
        if (area == 'PSA') { return u.PSA_User__c == 'Yes'; }
        if (area == 'SMS') { return u.SMS_User__c == 'Yes'; }
        if (area == 'OBO') { return u.OBO_User__c == 'Yes'; }
        if (area == 'INV') { return u.INV_User__c == 'Yes'; }
        if (area == 'SC')  { return u.SC_User__c  == 'Yes'; }
        if (area == 'NZC') { return u.NZC_User__c == 'Yes'; }

        return false;
    }

    public class WelcomePageWrapper {
        @AuraEnabled public String firstName;
        @AuraEnabled public String companyName;
        @AuraEnabled public DateTime createdDate;
        @AuraEnabled public String profileName;
        @AuraEnabled public Boolean isNewUser;
        @AuraEnabled public String crmUser;
        @AuraEnabled public String psaUser;
        @AuraEnabled public String smsUser;
        @AuraEnabled public String oboUser;
        @AuraEnabled public String invUser;
        @AuraEnabled public String scUser;
        @AuraEnabled public String nzcUser;
        @AuraEnabled public List<ResourceLinkWrapper> resourceLinks;
    }

    public class ResourceLinkWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String url;
        @AuraEnabled public String iconName;
        @AuraEnabled public String salesforceArea;
        @AuraEnabled public String resourceType;
        @AuraEnabled public Decimal sortOrder;
    }
}