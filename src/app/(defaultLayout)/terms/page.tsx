export default function TermsPage() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Terms & Conditions
        </h1>
        <div className="prose prose-lg text-white/60 max-w-none">
          <p>
            Welcome to DermaCare AI. These Terms of &quot;Terms&quot; (&quot;Terms&quot;) govern your
            use of our platform. Please read them carefully.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using DermaCare AI, you agree to be bound by these
            Terms and our Privacy Policy. If you do not agree, please do not use
            our services.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            2. Services Description
          </h2>
          <p>
            DermaCare AI provides AI-powered skin screening tools and facilitates
            connections with verified dermatologists for consultation services.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            3. Disclaimer of Medical Advice
          </h2>
          <p>
            The AI screening provided by DermaCare AI is for informational
            purposes only and does not constitute medical advice, diagnosis, or
            treatment. Always seek the advice of a qualified healthcare provider
            with any questions you may have regarding a medical condition.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            4. User Responsibilities
          </h2>
          <p>
            You agree to provide accurate information and to use the platform in
            compliance with all applicable laws and regulations.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            5. Intellectual Property
          </h2>
          <p>
            All content on the platform, including text, graphics, logos, and
            software, is the property of DermaCare AI or its licensors and is
            protected by copyright and trademark laws.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, DermaCare AI shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising from your use of the platform.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            7. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of [Jurisdiction], without regard to its conflict of law
            principles.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            8. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify users of any changes by posting the updated Terms on our
            platform.
          </p>
          <p className="mt-6">
            <em>
              Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </em>
          </p>
        </div>
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>
            <strong>Disclaimer:</strong> This is a project-specific draft and
            does not constitute legal advice. For actual legal terms, please
            consult with a legal professional.
          </p>
        </div>
      </div>
    </section>
  );
}
