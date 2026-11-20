import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import knowledgeData from "@/data/knowledge.json";
import { resolveKnowledgeImage } from "@/data/knowledgeAssets";

const ExploreKnowledge = () => {
  const { books } = knowledgeData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Books <span className="text-primary">Collection</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Explore our comprehensive collection of books
              </p>
            </div>
          </div>

          {/* Books Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Books Collection
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="interactive-card group border-0 shadow-elegant overflow-hidden">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={resolveKnowledgeImage(book.image)}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-white/80 text-xs line-clamp-1">
                        {book.author}
                      </p>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreKnowledge;
