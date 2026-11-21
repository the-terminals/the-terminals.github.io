import { useState } from "react";
import { ArrowLeft, BookOpen, LayoutGrid, List as ListIcon, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookPdfActions, BookPdfDialog } from "@/components/BookPdfPreview";
import type { Book } from "@/components/cards/BookCard";
import knowledgeData from "@/data/knowledge.json";
import { resolveKnowledgeImage } from "@/data/knowledgeAssets";

type BookView = "card" | "list";

/**
 * Cover with the book name and writer at the bottom.
 * Clicking it opens the book in a new tab when the book has a PDF.
 */
const BookCover = ({ book }: { book: Book }) => {
  const cover = (
    <>
      <img
        src={resolveKnowledgeImage(book.image)}
        alt={book.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-white/80 text-xs line-clamp-1">{book.author}</p>
      </div>
    </>
  );

  if (!book.pdf) return <div className="aspect-[3/4] relative overflow-hidden">{cover}</div>;

  return (
    <a
      href={book.pdf}
      target="_blank"
      rel="noreferrer"
      title={`Open ${book.title} in a new tab`}
      className="block aspect-[3/4] relative overflow-hidden"
    >
      {cover}
    </a>
  );
};

const BookGridItem = ({ book, onPreview }: { book: Book; onPreview: () => void }) => (
  <Card className="interactive-card group border-0 shadow-elegant overflow-hidden">
    <BookCover book={book} />
    {book.pdf && (
      <CardContent className="p-3">
        <BookPdfActions book={book} onPreview={onPreview} className="justify-center" />
      </CardContent>
    )}
  </Card>
);

const BookListItem = ({ book, onPreview }: { book: Book; onPreview: () => void }) => {
  const thumbnail = (
    <img
      src={resolveKnowledgeImage(book.image)}
      alt={book.title}
      className="h-20 w-14 rounded object-cover bg-muted"
    />
  );

  return (
    <div className="flex items-center gap-4 p-3">
      {book.pdf ? (
        <a
          href={book.pdf}
          target="_blank"
          rel="noreferrer"
          title={`Open ${book.title} in a new tab`}
          className="shrink-0"
        >
          {thumbnail}
        </a>
      ) : (
        <span className="shrink-0">{thumbnail}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground line-clamp-2">{book.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
      </div>
      <BookPdfActions book={book} onPreview={onPreview} />
    </div>
  );
};

const ViewButton = ({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    size="icon"
    className="h-8 w-8"
    onClick={onClick}
    title={label}
    aria-label={label}
    aria-pressed={active}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

const ExploreKnowledge = () => {
  const books = knowledgeData.books as Book[];
  const [previewPdf, setPreviewPdf] = useState<Book | null>(null);
  const [view, setView] = useState<BookView>("card");

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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Books Collection
                </h2>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-border p-1">
                <ViewButton
                  active={view === "card"}
                  icon={LayoutGrid}
                  label="Card view"
                  onClick={() => setView("card")}
                />
                <ViewButton
                  active={view === "list"}
                  icon={ListIcon}
                  label="List view"
                  onClick={() => setView("list")}
                />
              </div>
            </div>

            {view === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {books.map((book) => (
                  <BookGridItem key={book.id} book={book} onPreview={() => setPreviewPdf(book)} />
                ))}
              </div>
            ) : (
              <Card className="divide-y divide-border border-0 shadow-elegant">
                {books.map((book) => (
                  <BookListItem key={book.id} book={book} onPreview={() => setPreviewPdf(book)} />
                ))}
              </Card>
            )}
          </section>
        </div>
      </main>
      <Footer />

      <BookPdfDialog
        open={!!previewPdf}
        onOpenChange={(o) => !o && setPreviewPdf(null)}
        title={previewPdf?.title ?? ""}
        pdf={previewPdf?.pdf}
      />
    </div>
  );
};

export default ExploreKnowledge;
