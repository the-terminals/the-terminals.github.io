import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AreasOfWork from "@/components/AreasOfWork";
import KnowledgeSection from "@/components/KnowledgeSection";
import QuickLinks from "@/components/QuickLinks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <AreasOfWork />
        <KnowledgeSection />
        <QuickLinks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
