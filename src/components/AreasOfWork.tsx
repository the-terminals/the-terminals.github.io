import AreaCard from "./cards/AreaCard";
import areas from "@/data/areasOfWork.json";

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
          {areas.map((area) => (
            <AreaCard key={area.title} area={area} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AreasOfWork;
