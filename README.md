# Extroverts Signup Wizard

A responsive, front-end-only replication of the Extroverts mobile onboarding experience created for the Frontend Engineering Assessment.

## Implemented experience

- Location permission with an honest Delhi NCR coverage fallback
- Branded welcome and Terms and Conditions screens
- Responsive party discovery with loading, error and retry states
- Email verification and an accessible six-digit OTP experience
- Four-step profile wizard: name, party name, age and pronouns
- Optional invite code, final submission failure handling and success feedback
- Back navigation that preserves entered information
- Mobile, tablet and desktop layouts

## Run locally

```bash
npm install
npm run dev
```

## Validate

```bash
npm run lint
npm test
```

## Assessment demo values

These values make every success and failure state reproducible in a screen recording:

- Valid OTP: `123456`
- Email delivery failure: any valid address beginning with `fail@`
- Unavailable party name: `extrovert`
- Successful invite code: `PARTY30`
- Final submission failure: `FAIL500`
- Party-list failure: add `?partyError=1` to the site URL, then use **Try again**

Demo values are documented here rather than displayed in the normal product UI so the deployed experience remains visually faithful to the reference app.

## Front-end-only behavior

The assessment explicitly requests a front-end-only exercise. Network delays, OTP verification, username availability, party loading and signup responses are therefore simulated locally. No personal information is transmitted or persisted.
