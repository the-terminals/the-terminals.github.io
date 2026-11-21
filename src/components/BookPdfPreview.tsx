import { Download, ExternalLink, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type BookPdf = { title: string; pdf?: string };

/** Preview in a modal, open in a new tab and download. Renders nothing while the book has no PDF. */
export const BookPdfActions = ({
  book,
  onPreview,
  className,
}: {
  book: BookPdf;
  onPreview: () => void;
  className?: string;
}) => {
  if (!book.pdf) return null;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onPreview} title="Preview PDF">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9" asChild title="Open in new tab">
        <a href={book.pdf} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9" asChild title="Download PDF">
        <a href={book.pdf} download>
          <Download className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
};

/** PDF reader modal, shared by /super-admin and the public book pages. */
export const BookPdfDialog = ({
  open,
  onOpenChange,
  title,
  pdf,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdf?: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-5xl max-h-[92vh] gap-3">
      <DialogHeader className="pr-8">
        <DialogTitle className="truncate">{title}</DialogTitle>
      </DialogHeader>
      {pdf && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={pdf} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={pdf} download>
                <Download className="h-4 w-4 mr-2" /> Download
              </a>
            </Button>
          </div>
          <iframe src={pdf} title={title} className="h-[72vh] w-full rounded-md border border-border bg-muted" />
        </>
      )}
    </DialogContent>
  </Dialog>
);
