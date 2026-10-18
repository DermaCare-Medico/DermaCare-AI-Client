export default function DisclaimerPage() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Medical Disclaimer
        </h1>
        <div className="prose prose-lg text-white/60 max-w-none">
          <p>
            The information provided by DermaCare AI&rsquo;s AI-powered skin
            screening tool is intended for educational and informational
            purposes only. It is not a substitute for professional medical
            advice, diagnosis, or treatment.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            Important Limitations
          </h2>
          <ul className="list-disc list-inside space-y-2 mt-4 text-white/60">
            <li>
              The AI screening provides preliminary insights based on image
              analysis and should not be interpreted as a medical diagnosis.
            </li>
            <li>
              DermaCare AI does not replace the need for an in-person
              evaluation by a qualified dermatologist or healthcare provider.
            </li>
            <li>
              If you believe you have a medical emergency, call your doctor or
              emergency services immediately.
            </li>
            <li>
              Always seek the advice of your physician or other qualified
              health provider with any questions you may have regarding a
              medical condition.
            </li>
          </ul>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            Consultation with Specialists
          </h2>
          <p>
            While DermaCare AI facilitates connections with verified
            dermatologists, the consultation service is intended to complement
            but not replace regular medical care. Users should follow the
            advice of their healthcare provider regarding any treatment or
            follow-up care.
          </p>
          <h2 className="text-2xl font-bold text-primary mb-4 mt-6">
            No Guarantees
          </h2>
          <p>
            DermaCare AI does not guarantee the accuracy, completeness, or
            usefulness of any information provided. The platform is provided
            &quot;as is&quot; without warranties of any kind.
          </p>
          <p className="mt-6">
            <em>
              Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </em>
          </p>
        </div>
      </div>
    </section>
  );
}
