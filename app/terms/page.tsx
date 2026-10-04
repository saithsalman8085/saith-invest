export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050b12] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <h1 className="mb-8 text-3xl font-bold">
            Terms & Conditions
          </h1>

          <div className="space-y-6 text-sm leading-7 text-slate-300">
            <p>
              By creating an account or using ClaudeInvest, you agree to these Terms & Conditions.
            </p>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                1. Account
              </h2>
              <p>
                Users must provide accurate information and keep their passwords, verification codes, and account details secure. Sharing account credentials with others is not permitted.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                2. Deposits & Investments
              </h2>
              <p>
                Before making an investment, users should carefully review the plan amount, duration, returns, fees, and other relevant details. <strong>All investments are made entirely at the user's own risk.</strong>
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                3. Investment Risk & Loss
              </h2>
              <p>
                Investments involve financial risk, and losses may occur due to market conditions, technical issues, payment problems, regulatory requirements, or other circumstances.
              </p>
              <p>
                <strong>ClaudeInvest and the website developer/owner shall not be responsible or liable for any investment loss, financial loss, or loss of funds suffered by a user, except where such liability cannot legally be excluded under applicable law.</strong>
              </p>
              <p>
                Users should only invest money they can afford to lose and should not use essential living expenses or borrowed money for investments.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                4. Withdrawals
              </h2>
              <p>
                Withdrawals may require identity verification and will be processed according to the withdrawal rules and applicable fees displayed on the platform. Processing times may vary.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                5. KYC & Verification
              </h2>
              <p>
                ClaudeInvest may request identification documents or additional information for security, verification, or legal compliance purposes. Providing false or fraudulent information may result in account suspension or termination.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                6. Prohibited Activities
              </h2>
              <p>
                Fraud, money laundering, fake accounts, identity misuse, referral abuse, hacking, exploiting technical errors, and other illegal activities are strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                7. Account Suspension
              </h2>
              <p>
                ClaudeInvest may restrict, suspend, or terminate an account in cases involving fraud, abuse, security violations, false information, or violations of these Terms & Conditions.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                8. Website Availability & Closure
              </h2>
              <p>
                ClaudeInvest does not guarantee that the website will always remain available or error-free. The website may become temporarily or permanently unavailable due to maintenance, technical issues, third-party services, legal requirements, or other circumstances.
              </p>
              <p>
                <strong>Users acknowledge that ClaudeInvest may suspend, close, or permanently discontinue its services at any time. In such circumstances, the responsibility of ClaudeInvest and the website developer/owner shall be limited to the extent permitted by applicable law.</strong>
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                9. Changes to Terms
              </h2>
              <p>
                ClaudeInvest may update these Terms & Conditions when necessary. Updated terms will be published on the website.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">
                10. Acceptance
              </h2>
              <p>
                By registering for or using ClaudeInvest, you confirm that you have read, understood, and agreed to these Terms & Conditions and the Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}