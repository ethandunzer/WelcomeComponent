import { createElement } from '@lwc/engine-dom';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import WelcomePageComponent from 'c/welcomePageComponent';
import getWelcomePageData from '@salesforce/apex/WelcomePageController.getWelcomePageData';

const mockGetWelcomePageData = registerApexTestWireAdapter(getWelcomePageData);

// ── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_DATA_NEW_USER = {
    firstName:    'Sarah',
    companyName:  'Acme Corp',
    isNewUser:    true,
    profileName:  'Standard User',
    crmUser:      'Yes',
    psaUser:      'No',
    smsUser:      'No',
    oboUser:      'No',
    invUser:      'No',
    scUser:       'No',
    nzcUser:      'No',
    resourceLinks: [
        {
            label:          'Salesforce Basics',
            url:            'https://help.salesforce.com',
            iconName:       'utility:bookmark',
            salesforceArea: 'General',
            resourceType:   'Getting Started',
            sortOrder:      1
        },
        {
            label:          'CRM Training Video',
            url:            'https://training.example.com/crm',
            iconName:       'utility:video',
            salesforceArea: 'CRM',
            resourceType:   'Training',
            sortOrder:      2
        },
        {
            label:          'Submit a Support Ticket',
            url:            'https://support.example.com',
            iconName:       'utility:case',
            salesforceArea: 'General',
            resourceType:   'Support',
            sortOrder:      3
        }
    ]
};

const MOCK_DATA_EXISTING_USER = {
    ...MOCK_DATA_NEW_USER,
    firstName: 'Alex',
    isNewUser: false
};

const MOCK_DATA_NO_LINKS = {
    firstName:     'Sam',
    companyName:   'Empty Corp',
    isNewUser:     false,
    profileName:   'Standard User',
    resourceLinks: []
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function createComponent() {
    const element = createElement('c-welcome-page-component', { is: WelcomePageComponent });
    document.body.appendChild(element);
    return element;
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('c-welcome-page-component', () => {

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    // ── Loading state ────────────────────────────────────────────────────

    it('renders a loading spinner while wire data is pending', () => {
        const element = createComponent();
        const spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).not.toBeNull();
    });

    // ── Error state ──────────────────────────────────────────────────────

    it('displays an error message when the wire adapter returns an error', async () => {
        const element = createComponent();
        mockGetWelcomePageData.error({ body: { message: 'Server error' } });
        await Promise.resolve();

        const errorDiv = element.shadowRoot.querySelector('[role="alert"]');
        expect(errorDiv).not.toBeNull();
        expect(errorDiv.textContent).toContain('Unable to load welcome page data');
    });

    // ── Greeting ─────────────────────────────────────────────────────────

    it('displays a personalised greeting containing the user first name', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_NEW_USER);
        await Promise.resolve();

        const heading = element.shadowRoot.querySelector('h1');
        expect(heading).not.toBeNull();
        expect(heading.textContent).toContain('Sarah');
    });

    it('displays the company name below the greeting', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_NEW_USER);
        await Promise.resolve();

        const companyPara = element.shadowRoot.querySelector('.welcome-header p');
        expect(companyPara).not.toBeNull();
        expect(companyPara.textContent).toBe('Acme Corp');
    });

    // ── New-user banner ───────────────────────────────────────────────────

    it('shows the Getting Started banner for a new user', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_NEW_USER);
        await Promise.resolve();

        const cards = element.shadowRoot.querySelectorAll('lightning-card');
        const titles = Array.from(cards).map(c => c.getAttribute('title') || c.title);
        expect(titles.some(t => t && t.includes('Getting Started'))).toBe(true);
    });

    it('hides the Getting Started banner for an existing user', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_EXISTING_USER);
        await Promise.resolve();

        const cards = element.shadowRoot.querySelectorAll('lightning-card');
        const titles = Array.from(cards).map(c => c.getAttribute('title') || c.title);
        expect(titles.some(t => t && t.includes('Getting Started'))).toBe(false);
    });

    // ── Need Help card ────────────────────────────────────────────────────

    it('renders the Need Help card', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_NEW_USER);
        await Promise.resolve();

        const cards = element.shadowRoot.querySelectorAll('lightning-card');
        const titles = Array.from(cards).map(c => c.getAttribute('title') || c.title);
        expect(titles.some(t => t && t.includes('Need Help'))).toBe(true);
    });

    // ── Zero state ────────────────────────────────────────────────────────

    it('shows the zero-state message when no resource links are returned', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_NO_LINKS);
        await Promise.resolve();

        const zeroState = element.shadowRoot.querySelector('h2');
        expect(zeroState).not.toBeNull();
        expect(zeroState.textContent).toContain('No resources are currently available');
    });

    // ── Area sections ─────────────────────────────────────────────────────

    it('does not show a zero-state when resource links are present', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_EXISTING_USER);
        await Promise.resolve();

        const allH2 = element.shadowRoot.querySelectorAll('h2');
        const zeroStateVisible = Array.from(allH2).some(el =>
            el.textContent.includes('No resources are currently available')
        );
        expect(zeroStateVisible).toBe(false);
    });

    it('renders resource link buttons for area section links', async () => {
        const element = createComponent();
        mockGetWelcomePageData.emit(MOCK_DATA_EXISTING_USER);
        await Promise.resolve();

        const buttons = element.shadowRoot.querySelectorAll('lightning-button');
        // Expect at least one button for the CRM Training link
        const labels = Array.from(buttons).map(b => b.getAttribute('label') || b.label);
        expect(labels.some(l => l && l.includes('CRM Training Video'))).toBe(true);
    });
});
