import { ArrowRight, FileText, Mail, BookOpen, Brain, type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router-dom";
import links from "@/data/quickLinks.json";

const linkIcons: Record<string, LucideIcon> = {
  BookOpen,
  Brain,
  FileText,
  Mail,
};

const QuickLinks = () => {
  return (
    <section id="quick-access" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Quick <span className="text-primary">Access</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Navigate directly to our key resources and services designed to support 
            your academic and professional growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link) => {
            const Icon = linkIcons[link.icon];
            return (
              <Card
                key={link.title}
                className="interactive-card group border-0 shadow-elegant"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <Link
                      to={link.href.startsWith("#") ? `/${link.href}` : link.href}
                      className="inline-flex items-center"
                    >
                      {link.action}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
