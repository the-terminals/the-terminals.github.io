import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, Code, Database, Palette, TestTube, TrendingUp, ChevronRight, Target, Users, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import careerPathsData from "@/data/careerPaths.json";

const careerPaths = careerPathsData;
const careerIcons: Record<string, LucideIcon> = {
  Code,
  Database,
  Palette,
  Target,
  TestTube,
  Users,
};

const CareerIcon = ({ name, className }: { name: string; className: string }) => {
  const Icon = careerIcons[name];
  return <Icon className={className} />;
};

const categories = [...new Set(careerPaths.map(path => path.category))];

const CareerGuidance = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<typeof careerPaths[0] | null>(null);

  const filteredPaths = selectedCategory 
    ? careerPaths.filter(path => path.category === selectedCategory)
    : careerPaths;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Find Your <span className="text-primary">Career Path</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore different career paths in technology and business. Discover the skills you need 
            and understand the progression from entry-level to senior positions.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            All Careers
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Career Cards Grid */}
        {!selectedCareer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map((career) => {
              const Icon = careerIcons[career.icon];
              return (
                <Card 
                  key={career.id}
                  className="group cursor-pointer border-0 shadow-elegant hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  onClick={() => setSelectedCareer(career)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {career.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                      {career.role_title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {career.focus}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      View Career Path
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Career Detail View */
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCareer(null)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Careers
            </Button>

            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <CareerIcon name={selectedCareer.icon} className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {selectedCareer.category}
                    </Badge>
                    <CardTitle className="text-2xl">{selectedCareer.role_title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Focus */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Role Focus
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedCareer.focus}
                  </p>
                </div>

                {/* Career Progression */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Career Progression
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20" />
                    <div className="space-y-4">
                      {selectedCareer.progression.map((step, index) => (
                        <div key={index} className="flex items-center gap-4 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            index === selectedCareer.progression.length - 1 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {index + 1}
                          </div>
                          <div className={`flex-1 p-3 rounded-lg ${
                            index === selectedCareer.progression.length - 1 
                              ? 'bg-primary/10 border border-primary/20' 
                              : 'bg-muted/50'
                          }`}>
                            <span className={`font-medium ${
                              index === selectedCareer.progression.length - 1 
                                ? 'text-primary' 
                                : 'text-foreground'
                            }`}>
                              {step}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Key Skills Required
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.key_skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="px-3 py-1.5 text-sm bg-card hover:bg-primary/10 hover:border-primary/50 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CareerGuidance;
