import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2 gold-gradient">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: March 8, 2026</p>

      <section className="space-y-8 text-gray-300 text-sm leading-relaxed">

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">1. Introduction</h2>
          <p>Welcome to Aureum Fitness. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">2. Information We Collect</h2>
          <p>We collect information you provide directly to us when you register for an account or use our services, including:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Name and email address</li>
            <li>Body measurements (height, weight, body fat percentage)</li>
            <li>Fitness and activity data (workouts, steps, active minutes)</li>
            <li>Nutritional data (food logs, calorie intake)</li>
            <li>Progress photos you choose to upload</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your fitness and nutrition experience</li>
            <li>Track your progress and generate insights</li>
            <li>Send you technical notices and support messages</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">4. Health & Fitness Data</h2>
          <p>Your health and fitness data is stored securely and is only accessible to you. We do not sell, trade, or share your personal health data with third parties without your explicit consent, except as required by law.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">5. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting us.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">6. Security</h2>
          <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">7. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. You also have the right to object to or restrict certain types of processing of your data.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold gold-text mb-2">8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:info@manuscript.be" className="gold-text underline">info@manuscript.be</a></p>
        </div>

      </section>
    </div>
  );
}