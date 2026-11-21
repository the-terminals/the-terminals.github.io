import {
  Users,
  BookOpen,
  Heart,
  Palette,
  Cpu,
  Lightbulb,
  Wrench,
  Globe,
  MapPin,
  Building,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import areas from "@/data/areasOfWork.json";

const areaIcons: Record<string, LucideIcon> = {
  BookOpen,
  Building,
  Cpu,
  Globe,
  Heart,
  Lightbulb,
  MapPin,
  Palette,
  RefreshCw,
  Users,
  Wrench,
};

const AreasOfWork = () => {
  return (
    <section id="areas" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Areas of <span className="text-primary">Impact</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our diverse fields of work encompass comprehensive academic and social development, 
            fostering innovation and excellence across multiple disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => {
            const Icon = areaIcons[area.icon];
            return (
              <Card key={area.title} className="interactive-card h-full border-0 shadow-elegant">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {area.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AreasOfWork;
