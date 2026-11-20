import { BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import knowledgeData from "@/data/knowledge.json";
import BookCard from "./cards/BookCard";

const KnowledgeSection = () => {
  const books = knowledgeData.books.slice(0, 8);

  return (
    <section id="knowledge" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Books <span className="text-primary">Collection</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of books for Islamic education
          </p>
        </div>

        {/* Books Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-display font-bold text-foreground">
              Books Collection
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link to="/explore-knowledge">View All Books</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeSection;
