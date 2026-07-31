import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUserContext from '@salesforce/apex/WelcomePageController.getUserContext';

export default class WelcomePageComponent extends LightningElement {

    userContext = undefined;

    @wire(getUserContext)
    wiredUserContext({ data, error }) {
        if (data) {
            this.userContext = data;
            this.error       = undefined;
        } else if (error) {
            this.userContext = undefined;
            console.error('WelcomePageComponent — getUserContext error:', JSON.stringify(error));
            const body = error.body;
            const message = Array.isArray(body) && body.length > 0
                ? body.map(e => e.message).join(' | ')
                : body?.message ?? error.message ?? 'An unexpected error occurred.';
            this.dispatchEvent(new ShowToastEvent({
                title:   'Failed to load welcome page',
                message,
                variant: 'error',
                mode:    'sticky'
            }));
        }
    }

    get greeting() {
        const timeZone = this.userContext?.timeZoneSid || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const firstName = this.userContext?.firstName;

        // Get the current hour in the user's Salesforce timezone
        const hourStr  = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone }).format(new Date());
        const hour     = parseInt(hourStr, 10);

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

}

