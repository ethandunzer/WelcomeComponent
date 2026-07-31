import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getWelcomePageData from '@salesforce/apex/WelcomePageController.getWelcomePageData';

/** Display label and SLDS icon for each Salesforce area. */
const AREA_CONFIG = {
    General: { label: 'General Resources', iconName: 'utility:apps'},
    CRM: { label: 'CRM Resources', iconName: 'standard:opportunity'},
    PSA: { label: 'PSA Resources', iconName: 'standard:project'},
    SMS: { label: 'SMS Resources', iconName: 'utility:sms'},
    OBO: { label: 'OBO Resources', iconName: 'standard:service_report'},
    INV: { label: 'Inventory Resources', iconName: 'standard:product'},
    SC: { label: 'Service Cloud Resources', iconName: 'standard:case'},
    NZC: { label: 'NZC Resources', iconName: 'utility:world'}
};


export default class WelcomePageComponent extends NavigationMixin(LightningElement) {

    welcomeData = undefined;
    error = undefined;
    isLoading = true;


}
