import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUserContext from '@salesforce/apex/WelcomePageController.getUserContext';
import getResourceLinks from '@salesforce/apex/WelcomePageController.getResourceLinks';

export default class WelcomePageComponent extends LightningElement {

    userContext   = undefined;
    resourceLinks = undefined;

    // ── Wire: user context (greeting) ───────────────────────────────────

    @wire(getUserContext)
    wiredUserContext({ data, error }) {
        if (data) {
            this.userContext = data;
        } else if (error) {
            this.userContext = undefined;
            console.error('WelcomePageComponent — getUserContext error:', JSON.stringify(error));
            this._showError('Failed to load user context', error);
        }
    }

    // ── Wire: resource links ─────────────────────────────────────────────

    @wire(getResourceLinks)
    wiredResourceLinks({ data, error }) {
        if (data) {
            this.resourceLinks = data.map(l => ({
                ...l,
                iconName: l.iconName || 'utility:chevronright'
            }));
        } else if (error) {
            this.resourceLinks = undefined;
            console.error('WelcomePageComponent — getResourceLinks error:', JSON.stringify(error));
            this._showError('Failed to load resource links', error);
        }
    }

    // ── Greeting ─────────────────────────────────────────────────────────

    get greeting() {
        const timeZone = this.userContext?.timeZoneSid || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const firstName = this.userContext?.firstName;

        const hourStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone }).format(new Date());
        const hour    = parseInt(hourStr, 10);

        let salutation;
        if (hour >= 5 && hour < 12) {
            salutation = 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            salutation = 'Good afternoon';
        } else if (hour >= 17 && hour < 21) {
            salutation = 'Good evening';
        } else {
            salutation = 'Good night';
        }

        return firstName ? `${salutation}, ${firstName}!` : `${salutation}!`;
    }

    // ── Resource link getters ─────────────────────────────────────────────

    get gettingStartedLinks() {
        return (this.resourceLinks ?? []).filter(l => l.resourceType === 'Getting Started');
    }

    get trainingLinks() {
        return (this.resourceLinks ?? []).filter(l => l.resourceType === 'Training');
    }

    get supportLinks() {
        return (this.resourceLinks ?? []).filter(l => l.resourceType === 'Support');
    }

    // ── Private helpers ───────────────────────────────────────────────────

    _showError(title, error) {
        const body    = error.body;
        const message = Array.isArray(body) && body.length > 0
            ? body.map(e => e.message).join(' | ')
            : body?.message ?? error.message ?? 'An unexpected error occurred.';
        this.dispatchEvent(new ShowToastEvent({ title, message, variant: 'error', mode: 'sticky' }));
    }
}


