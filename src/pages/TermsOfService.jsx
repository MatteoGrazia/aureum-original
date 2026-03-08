import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2 gold-gradient">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: March 8, 2026</p>

      <section className="space-y-8 text-gray-300 text-sm leading-relaxed">

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using Aureum Fitness, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">2. Description of Service</h2>
          <p>Aureum Fitness is a personal fitness and nutrition tracking application that allows users to log workouts, track nutrition, monitor daily activity, and visualize progress over time.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">4. User Content</h2>
          <p>You retain ownership of all data and content you submit to the app, including fitness logs, photos, and nutritional information. By submitting content, you grant us a limited license to store and process it solely for the purpose of providing our services to you.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">5. Health Disclaimer</h2>
          <p>Aureum Fitness is intended for informational and tracking purposes only. The app does not provide medical advice. Always consult a qualified healthcare professional before starting any new fitness or diet program. We are not responsible for any health outcomes resulting from use of this app.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">6. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Transmit any harmful, offensive, or disruptive content</li>
            <li>Reverse engineer or attempt to extract the source code of the application</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">7. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms. You may also delete your account at any time.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Aureum Fitness shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">9. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of any significant changes. Continued use of the service after changes constitutes acceptance of the new Terms.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: <a href="mailto:info@manuscript.be" className="gold-text underline">info@manuscript.be</a></p>
        </div>

      </section>
    </div>
  );
}