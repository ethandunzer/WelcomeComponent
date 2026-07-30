# WelcomeComponent

A Salesforce Lightning Web Component (LWC) that serves as a personalized home page and central resource hub for Salesforce users. The component delivers a dynamic greeting, smart onboarding logic based on user tenure, a dedicated support card, and role/area-filtered resource links driven by Custom Metadata Type records.

---

## Table of Contents

- [Features](#features)
- [Custom Metadata Type Setup](#custom-metadata-type-setup)
- [User Object Custom Fields](#user-object-custom-fields)
- [Deployment](#deployment)
- [Component Behavior](#component-behavior)
- [Resource Filtering Logic](#resource-filtering-logic)
- [Running Tests](#running-tests)
- [Contributing](#contributing)

---

## Features

- **Time-aware personalized greeting** — Displays "Good morning/afternoon/evening, [First Name]!" based on the running user's local time.
- **Company name display** — Shows the user's assigned `CompanyName` below the greeting.
- **Smart onboarding (30-day rule)** — New users (created ≤ 30 days ago) see a prominent "Getting Started — First Steps" banner at the top. Existing users see a standard layout with Getting Started resources shifted into normal area sections.
- **Need Help card** — A high-visibility support card populated from `Support`-type CMDT records. Falls back to a "Contact Support" button that opens a new Case when no Support records are configured.
- **Dynamic resource sections** — Resource link buttons are grouped by `Salesforce_Area__c` (CRM, PSA, SMS, OBO, INV, SC, NZC, General) and sub-grouped by `Resource_Type__c` (Getting Started, Training).
- **Server-side filtering** — Only active records matching the running user's profile, company, and area permissions are returned.
- **Zero-state handling** — Displays a clean fallback message when no records match the user's criteria.

---

## Custom Metadata Type Setup

Create the `Welcome_Resource_Link__mdt` Custom Metadata Type with the following fields:

| Field Label       | API Name               | Data Type  | Notes                                              |
|-------------------|------------------------|------------|----------------------------------------------------|
| Label             | `MasterLabel`          | Text       | Display name for the link button                   |
| URL               | `URL__c`               | URL / Text | Target link destination                            |
| Icon Name         | `Icon_Name__c`         | Text       | SLDS icon (e.g. `utility:bookmark`, `standard:case`) |
| Salesforce Area   | `Salesforce_Area__c`   | Picklist   | `CRM`, `PSA`, `SMS`, `OBO`, `INV`, `SC`, `NZC`, `General` |
| Resource Type     | `Resource_Type__c`     | Picklist   | `Getting Started`, `Training`, `Support`           |
| Profile Criteria  | `Profile_Criteria__c`  | Long Text  | Comma-separated profile names; blank = all         |
| Company Criteria  | `Company_Criteria__c`  | Text       | Single company name; blank = all                   |
| Sort Order        | `Sort_Order__c`        | Number     | Integer; controls rendering order (ascending)      |
| Is Active         | `Is_Active__c`         | Checkbox   | Only active records are returned                   |

---

## User Object Custom Fields

The Apex controller reads the following custom fields on the `User` object. Each must be a **Text** or **Picklist** field where `'Yes'` indicates the user has access to that area:

| Field Label   | API Name       |
|---------------|----------------|
| CRM User      | `CRM_User__c`  |
| PSA User      | `PSA_User__c`  |
| SMS User      | `SMS_User__c`  |
| OBO User      | `OBO_User__c`  |
| INV User      | `INV_User__c`  |
| SC User       | `SC_User__c`   |
| NZC User      | `NZC_User__c`  |

---

## Deployment

The Custom Metadata Type and all field definitions are included in the source tree under `force-app/main/default/objects/Welcome_Resource_Link__mdt/` and are deployed automatically with the commands below. No manual Setup UI steps are required.

**Deploy to a scratch org:**

```bash
sf org create scratch --definition-file config/project-scratch-def.json --alias WelcomeScratch --set-default
sf project deploy start --source-dir force-app
```

**Deploy to a sandbox or production org:**

```bash
sf project deploy start --source-dir force-app --target-org <your-org-alias>
```

After deploying, add the component to a Home Page or App Page via the Lightning App Builder by searching for **welcomePageComponent**.

---

## Component Behavior

### New Users (created ≤ 30 days ago)

1. Greeting header
2. **Getting Started — First Steps** banner (top prominence) — all `Getting Started`-type CMDT records the user has access to
3. Need Help card
4. Area sections containing `Training` links only (Getting Started already surfaced above)

### Existing Users (created > 30 days ago)

1. Greeting header
2. Need Help card
3. Area sections with `Getting Started` resources grouped first, then `Training` resources within each area

---

## Resource Filtering Logic

A `Welcome_Resource_Link__mdt` record is visible to the running user only if **all** of the following conditions are met:

1. `Is_Active__c = true`
2. `Profile_Criteria__c` is blank **OR** the running user's profile name appears in the comma-separated list.
3. `Company_Criteria__c` is blank **OR** it matches the running user's `CompanyName` (case-insensitive).
4. `Salesforce_Area__c` is blank or `General` **OR** the user's corresponding `[Area]_User__c` field equals `'Yes'`.

`Support`-type records are displayed exclusively in the **Need Help** card. All other record types are displayed in the area sections.

---

## Contributing

1. Create a feature branch from `main`.
2. Make changes and ensure all tests pass before opening a pull request.
3. Update this README if behavior or setup requirements change.
