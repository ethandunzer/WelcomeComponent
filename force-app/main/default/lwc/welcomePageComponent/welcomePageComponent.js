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

/** Order in which Resource_Type__c groups are rendered inside each area section. */
const TYPE_ORDER = ['Training'];

export default class WelcomePageComponent extends NavigationMixin(LightningElement) {

    welcomeData = undefined;
    error = undefined;
    isLoading = true;

    // ── Wire ────────────────────────────────────────────────────────────

    @wire(getWelcomePageData)
    wiredWelcomeData({ data, error }) {
        this.isLoading = false;
        if (data) {
            this.welcomeData = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.welcomeData = undefined;
        }
    }

    // ── State flags ─────────────────────────────────────────────────────

    get isDataLoaded() {
        return !this.isLoading && this.error == null && this.welcomeData != null;
    }

    get hasError() {
        return !this.isLoading && this.error != null;
    }

    get errorMessage() {
        if (!this.error) return '';
        const body = this.error.body;
        if (Array.isArray(body) && body.length > 0) {
            return body.map(e => e.message).join(' | ');
        }
        return body?.message ?? this.error.message ?? 'An unexpected error occurred.';
    }

    // ── User context ────────────────────────────────────────────────────

    get greeting() {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'Good morning': hour < 17 ? 'Good afternoon': 'Good evening';
        const firstName = this.welcomeData?.firstName;
        return firstName ? `${timeOfDay}, ${firstName}!` : `${timeOfDay}!`;
    }

    get companyName() {
        return this.welcomeData?.companyName || '';
    }

    get isNewUser() {
        return this.welcomeData?.isNewUser === true;
    }

    // ── Resource link collections ────────────────────────────────────────

    get allLinks() {
        return this.welcomeData?.resourceLinks ?? [];
    }

    /** Resource_Type__c === 'Getting Started' — shown in the top banner for new users. */
    get gettingStartedLinks() {
        return this.allLinks.filter(l => l.resourceType === 'Getting Started');
    }

    get hasGettingStartedLinks() {
        return this.gettingStartedLinks.length > 0;
    }

    get hasNoGettingStartedLinks() {
        return !this.hasGettingStartedLinks;
    }

    /** Resource_Type__c === 'Support' — shown exclusively in the Need Help card. */
    get supportLinks() {
        return this.allLinks.filter(l => l.resourceType === 'Support');
    }

    get hasSupportLinks() {
        return this.supportLinks.length > 0;
    }

    get hasNoSupportLinks() {
        return !this.hasSupportLinks;
    }

    // ── Area sections ────────────────────────────────────────────────────

    /**
     * Links for right-panel area sections.
     * Support goes to the Need Help card; Getting Started goes to the left panel.
     */
    get areaSectionLinks() {
        return this.allLinks.filter(
            l => l.resourceType !== 'Support' && l.resourceType !== 'Getting Started'
        );
    }

    /**
     * Builds an array of area section objects for the template.
     * Each section contains typeGroups with an ordered array of links.
     */
    get areaSections() {
        const areaMap = new Map();

        for (const link of this.areaSectionLinks) {
            const area = link.salesforceArea || 'General';
            if (!areaMap.has(area)) {
                areaMap.set(area, []);
            }
            areaMap.get(area).push(link);
        }

        return Array.from(areaMap.entries()).map(([area, areaLinks]) => {
            const config = AREA_CONFIG[area] ?? { label: `${area} Resources`, iconName: 'utility:apps' };

            // Group links by Resource_Type__c
            const typeMap = new Map();
            for (const link of areaLinks) {
                const type = link.resourceType || 'General';
                if (!typeMap.has(type)) {
                    typeMap.set(type, []);
                }
                typeMap.get(type).push(link);
            }

            // Build ordered typeGroups
            const typeGroups = [];
            const hasMultipleTypes = typeMap.size > 1;

            for (const type of TYPE_ORDER) {
                if (typeMap.has(type)) {
                    typeGroups.push({
                        type,
                        label: type,
                        showLabel: hasMultipleTypes,
                        links: typeMap.get(type)
                    });
                    typeMap.delete(type);
                }
            }
            // Append any types not covered by the ordered list
            typeMap.forEach((links, type) => {
                typeGroups.push({ type, label: type, showLabel: hasMultipleTypes, links });
            });

            return {
                area,
                label: config.label,
                iconName: config.iconName,
                typeGroups
            };
        });
    }

    get hasAreaSections() {
        return this.areaSections.length > 0;
    }

    /** Show zero-state panel only when there are truly no resource links of any type. */
    get hasNoResources() {
        return this.isDataLoaded && this.allLinks.length === 0;
    }

    // ── Event handlers ───────────────────────────────────────────────────

    handleLinkClick(event) {
        const url = event.currentTarget.dataset.url;
        if (url) {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: { url }
            });
        }
    }

    /** Fallback handler when no Support-type CMDT records exist. */
    handleContactSupport() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName:    'new'
            }
        });
    }
}
