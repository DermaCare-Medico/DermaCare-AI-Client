This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Frontend-only demo authentication

For local UI testing without the authentication API, set `NEXT_PUBLIC_DEMO_AUTH=true` before starting Next.js:

```powershell
$env:NEXT_PUBLIC_DEMO_AUTH = "true"
npm run dev
```

With demo mode enabled, use `/register`, then enter the fixed demo OTP `123456` at `/verify-email`. Verification is local only; no email or backend request is made. At `/login`, use the clearly labeled fictional demo account:

- Email: `demo.patient@dermacare.local`
- Password: `DemoPass123`

Successful login opens `/patient/dashboard`. The demo session is stored in `sessionStorage` for the current browser tab and is cleared on logout. Demo mode is not secure authentication; do not use real credentials or health information. Unset `NEXT_PUBLIC_DEMO_AUTH` or set it to `false` to use the normal API-backed authentication flow.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# starter-pack-with-redux
