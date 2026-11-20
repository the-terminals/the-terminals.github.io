import { Button } from "./ui/button";
import { Card } from "./ui/card";
import siteData from "@/data/site.json";

const Hero = () => {

  return (
    <section id="home" className="relative min-h-screen flex items-center hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Empowering Minds,
                <br />
                <span className="text-primary">Connecting Communities</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                The Terminals is a university-oriented intellectual group dedicated to 
                knowledge sharing, research & development, career guidance, and consultancy 
                for academic excellence and community growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" size="lg">
                Join Our Community
              </Button>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <Card className="p-8 shadow-premium">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Our Mission Areas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {siteData.missionAreas.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
