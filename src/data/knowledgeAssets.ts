import bookAqeedah from "@/assets/book-aqeedah.jpg";
import bookEthics from "@/assets/book-ethics.jpg";
import bookFiqh from "@/assets/book-fiqh.jpg";
import bookHadith from "@/assets/book-hadith.jpg";
import bookHistory from "@/assets/book-history.jpg";
import bookQuran from "@/assets/book-quran.jpg";
import bookSirah from "@/assets/book-sirah.jpg";
import bookSpirituality from "@/assets/book-spirituality.jpg";
import courseArabic from "@/assets/course-arabic.jpg";
import courseEconomics from "@/assets/course-economics.jpg";
import courseProphets from "@/assets/course-prophets.jpg";
import courseRiyad from "@/assets/course-riyad.jpg";

const knowledgeImages: Record<string, string> = {
  "book-aqeedah.jpg": bookAqeedah,
  "book-ethics.jpg": bookEthics,
  "book-fiqh.jpg": bookFiqh,
  "book-hadith.jpg": bookHadith,
  "book-history.jpg": bookHistory,
  "book-quran.jpg": bookQuran,
  "book-sirah.jpg": bookSirah,
  "book-spirituality.jpg": bookSpirituality,
  "course-arabic.jpg": courseArabic,
  "course-economics.jpg": courseEconomics,
  "course-prophets.jpg": courseProphets,
  "course-riyad.jpg": courseRiyad,
};

export const resolveKnowledgeImage = (image: string) => knowledgeImages[image];
