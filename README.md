# Extroverts Signup Wizard

A high-fidelity, responsive replication of the Extroverts mobile onboarding experience, built for the Frontend Engineering Assessment.

**Live demo:** [partygroup.vercel.app](https://partygroup.vercel.app)

## About this project

I built this front-end-only web application to reproduce the reference app's landing and signup experience while improving validation, accessibility, error handling, and responsive behavior. The interface keeps the app's bold, dark visual language and works across mobile, tablet, and desktop viewports.

## User journey

1. Request location access, with a clear fallback when permission is unavailable.
2. Continue through the branded welcome screen and accept the Terms and Conditions.
3. Browse responsive party and cafe cards with loading, failure, and retry states.
4. Select **Join** and enter a validated email address.
5. Complete the accessible six-digit OTP verification flow.
6. Finish the four profile steps: name, party name, age, and pronouns.
7. Optionally enter an invite code and submit the signup.
8. Receive a clear success state for the selected party.

## Assessment requirement coverage

| Requirement | Implementation |
| --- | --- |
| Progressive disclosure | Email and OTP verification appear before the four-step profile wizard. |
| Real-time validation | Email, name, party name, age, pronouns, and invite code validate on blur and while correcting errors. |
| Input constraints | Trimming and whitespace protection, character limits, numeric-only age, six numeric OTP digits, and an 18-100 age range. |
| Error handling | Contextual field errors, global toast alerts, retryable party loading, OTP delivery failure, unavailable party name, and final submission failure. |
| Loading states | Buttons show a spinner and remain disabled during simulated requests to prevent duplicate submissions. |
| Back navigation | Every signup step supports backward navigation without losing entered data. |
| Success feedback | Successful signup displays a confirmation screen tied to the selected party. |
| Responsive UX | Dedicated mobile, tablet, and desktop layouts with accessible controls and keyboard-friendly OTP behavior. |

## UX improvements

- Added a clear 18+ eligibility error instead of silently accepting an invalid age.
- Improved OTP entry with auto-advance, backspace navigation, arrow-key support, paste support, resend timing, and focused error recovery.
- Added accessible labels, error associations, focus handling, keyboard dismissal for the Terms dialog, and reduced duplicate-action risk.
- Preserved the visual character of the reference app while making errors and recovery actions more understandable.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- CSS
- Lucide React icons
- Vercel

## Run locally

```bash
git clone https://github.com/prerna1112/partygroup.git
cd partygroup
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate the project

```bash
npm run lint
npx tsc --noEmit
npm test
```

## Demo values

These values make the success and failure scenarios reproducible during assessment review:

| Scenario | Value |
| --- | --- |
| Valid OTP | `123456` |
| OTP delivery failure | Any valid email beginning with `fail@` |
| Unavailable party name | `extrovert` |
| Successful invite code | `PARTY30` |
| Final submission failure | `FAIL500` |
| Party-list failure | Add `?partyError=1` to the live or local URL, then select **Try again** |

The application simulates network delays, OTP verification, party-name availability, party loading, and signup responses in the browser. No personal information is transmitted or persisted.

## Author

Built by [Prerna Kaushik](https://github.com/prerna1112).
