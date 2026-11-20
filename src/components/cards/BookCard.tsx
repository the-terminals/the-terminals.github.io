import { Card } from "@/components/ui/card";
import { resolveKnowledgeImage } from "@/data/knowledgeAssets";

export type Book = { id: number; title: string; author: string; image: string };

const BookCard = ({ book }: { book: Book }) => (
  <Card className="group border-0 shadow-elegant overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
    <div className="aspect-[3/4] relative overflow-hidden">
      <img
        src={resolveKnowledgeImage(book.image)}
        alt={book.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-2 left-2 right-2">
        <h4 className="text-white font-semibold text-xs mb-0.5 line-clamp-2">{book.title}</h4>
        <p className="text-white/80 text-[10px] line-clamp-1">{book.author}</p>
      </div>
    </div>
  </Card>
);

export default BookCard;
