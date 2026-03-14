import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import ServicesSection from './components/ServicesSection';
import WorkflowSection from './components/WorkflowSection';
import FeatureSection from './components/FeatureSection';

import CTA from './components/CTA';
import Footer from './components/Footer';
import CompanyDeepDive from './components/CompanyDeepDive';

const LandingPage = () => {
  useEffect(() => {
    document.title = "Groo | Professional Agriculture Equipment Booking";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <ServicesSection />
      <WorkflowSection />
      <FeatureSection />
      <CompanyDeepDive />

      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
