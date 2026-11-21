import { useState } from "react";
import { BookOpen, Eye } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { BookPdfDialog } from "@/components/BookPdfPreview";
import type { Book } from "@/components/cards/BookCard";
import knowledgeData from "@/data/knowledge.json";
import { resolveKnowledgeImage } from "@/data/knowledgeAssets";

const KnowledgeSection = () => {
  const books = (knowledgeData.books as Book[]).slice(0, 8);
  const [previewPdf, setPreviewPdf] = useState<Book | null>(null);

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
              <Card key={book.id} className="group border-0 shadow-elegant overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <button
                  type="button"
                  disabled={!book.pdf}
                  onClick={() => book.pdf && setPreviewPdf(book)}
                  title={book.pdf ? `Preview ${book.title}` : undefined}
                  className={`relative block aspect-[3/4] w-full overflow-hidden text-left ${
                    book.pdf ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <img
                    src={resolveKnowledgeImage(book.image)}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="block text-white font-semibold text-xs mb-0.5 line-clamp-2">
                      {book.title}
                    </span>
                    <span className="block text-white/80 text-[10px] line-clamp-1">
                      {book.author}
                    </span>
                  </div>
                  {book.pdf && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="h-6 w-6" />
                    </span>
                  )}
                </button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link to="/explore-knowledge">View All Books</Link>
            </Button>
          </div>
        </div>
      </div>

      <BookPdfDialog
        open={!!previewPdf}
        onOpenChange={(o) => !o && setPreviewPdf(null)}
        title={previewPdf?.title ?? ""}
        pdf={previewPdf?.pdf}
      />
    </section>
  );
};

export default KnowledgeSection;
