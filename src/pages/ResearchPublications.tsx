import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Users, Calendar, ChevronDown, ChevronRight, Filter, Search, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import researchPillarsData from "@/data/researchPillars.json";

const researchPillars = researchPillarsData;

const typeColors: Record<string, string> = {
  "Peer-Reviewed Journal": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "White Paper": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Annual Report": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Conference Symposium": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Strategic Framework": "bg-rose-500/10 text-rose-600 border-rose-500/20"
};

const typeIcons: Record<string, React.ReactNode> = {
  "Peer-Reviewed Journal": <BookOpen className="w-4 h-4" />,
  "White Paper": <FileText className="w-4 h-4" />,
  "Annual Report": <Calendar className="w-4 h-4" />,
  "Conference Symposium": <Users className="w-4 h-4" />,
  "Strategic Framework": <Sparkles className="w-4 h-4" />
};

interface InitiativeCardProps {
  initiative: {
    title: string;
    type: string;
    focus: string;
  };
  index: number;
}

const InitiativeCard = ({ initiative, index }: InitiativeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        isHovered ? "scale-[1.02]" : ""
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${typeColors[initiative.type]} flex items-center justify-center`}>
            {typeIcons[initiative.type]}
          </div>
          <Badge variant="outline" className={`${typeColors[initiative.type]} text-xs font-medium`}>
            {initiative.type}
          </Badge>
        </div>
        
        <h4 className="font-semibold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-3">
          {initiative.title}
        </h4>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/60"></span>
          <span className="italic">{initiative.focus}</span>
        </div>
        
        <div className={`mt-4 pt-3 border-t border-border/50 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/10">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface PillarSectionProps {
  pillar: {
    category: string;
    mission: string;
    initiatives: Array<{
      title: string;
      type: string;
      focus: string;
    }>;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const PillarSection = ({ pillar, isExpanded, onToggle }: PillarSectionProps) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="overflow-hidden border border-border/50 hover:border-primary/20 transition-all duration-300">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="p-6 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-foreground">{pillar.category}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{pillar.mission}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {pillar.initiatives.length} Publications
                </Badge>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="border-t border-border/50 pt-6">
              <p className="text-muted-foreground mb-6">{pillar.mission}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pillar.initiatives.map((initiative, index) => (
                  <InitiativeCard key={index} initiative={initiative} index={index} />
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const ResearchPublications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set(["Society"]));

  const publicationTypes = [...new Set(researchPillars.flatMap(p => p.initiatives.map(i => i.type)))];

  const filteredPillars = researchPillars.map(pillar => ({
    ...pillar,
    initiatives: pillar.initiatives.filter(initiative => {
      const matchesSearch = initiative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           initiative.focus.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !selectedType || initiative.type === selectedType;
      return matchesSearch && matchesType;
    })
  })).filter(pillar => pillar.initiatives.length > 0);

  const togglePillar = (category: string) => {
    setExpandedPillars(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPillars(new Set(filteredPillars.map(p => p.category)));
  };

  const collapseAll = () => {
    setExpandedPillars(new Set());
  };

  const totalPublications = researchPillars.reduce((acc, p) => acc + p.initiatives.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Research & Publications
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Explore our comprehensive collection of peer-reviewed journals, white papers, 
              strategic frameworks, and annual reports across {researchPillars.length} research pillars.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{totalPublications}</p>
                  <p className="text-muted-foreground">Publications</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{researchPillars.length}</p>
                  <p className="text-muted-foreground">Research Pillars</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-border/50 sticky top-16 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Filter by type:</span>
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(null)}
                className="text-xs"
              >
                All
              </Button>
              {publicationTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs">
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs">
              Collapse All
            </Button>
            <span className="text-sm text-muted-foreground ml-auto">
              Showing {filteredPillars.reduce((acc, p) => acc + p.initiatives.length, 0)} results
            </span>
          </div>
        </div>
      </section>

      {/* Research Pillars */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {filteredPillars.map(pillar => (
              <PillarSection
                key={pillar.category}
                pillar={pillar}
                isExpanded={expandedPillars.has(pillar.category)}
                onToggle={() => togglePillar(pillar.category)}
              />
            ))}
          </div>
          
          {filteredPillars.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or filters
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Publication Types Legend */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">Publication Types</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(typeColors).map(([type, colorClass]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  {typeIcons[type]}
                </div>
                <span className="text-sm text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ResearchPublications;
