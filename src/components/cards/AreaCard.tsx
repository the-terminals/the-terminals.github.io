import { Card, CardContent } from "@/components/ui/card";
import { areaIcons } from "@/data/areaIcons";

export type Area = { icon: string; title: string; description: string };

const AreaCard = ({ area }: { area: Area }) => {
  const Icon = areaIcons[area.icon] ?? areaIcons.Lightbulb;
  return (
    <Card className="interactive-card h-full border-0 shadow-elegant">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-primary/10 rounded-lg mr-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{area.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
          {area.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default AreaCard;
