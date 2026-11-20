import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BookCard, { type Book } from "@/components/cards/BookCard";
import { resolveKnowledgeImage } from "@/data/knowledgeAssets";
import { useJsonFile } from "./useJsonFile";
import { uploadImage } from "./storage";
import { ConfirmRemove, LoadState, PageHeader, RowActions } from "./AdminParts";

type KnowledgeFile = { books: Book[] } & Record<string, unknown>;

const fileName = (image: string) => image.split("/").pop() || image;

const BooksAdmin = () => {
  const { data, loading, saving, error, reload, save: saveFile } = useJsonFile<KnowledgeFile>("knowledge.json");
  const [editing, setEditing] = useState<{ isNew: boolean; value: Book } | null>(null);
  const [preview, setPreview] = useState<Book | null>(null);
  const [removing, setRemoving] = useState<Book | null>(null);
  const [query, setQuery] = useState("");

  // cover upload
  const [localPreview, setLocalPreview] = useState<string | null>(null); // shows the picked file instantly
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // free the temporary preview URL when it is replaced or the form closes
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const books = useMemo(() => data?.books ?? [], [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? books.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(q)) : books;
  }, [books, query]);

  const writeBooks = (next: Book[]) => saveFile({ ...(data as KnowledgeFile), books: next });

  const openEditor = (value: Book, isNew: boolean) => {
    setLocalPreview(null);
    setEditing({ isNew, value });
  };

  const closeEditor = () => {
    setLocalPreview(null);
    setEditing(null);
  };

  const openAdd = () => {
    const nextId = books.reduce((m, b) => Math.max(m, b.id), 0) + 1;
    openEditor({ id: nextId, title: "", author: "", image: "" }, true);
  };

  const setField = (key: keyof Book, value: string) =>
    setEditing((prev) => (prev ? { ...prev, value: { ...prev.value, [key]: value } } : prev));

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, WebP or GIF).");
      return;
    }
    setLocalPreview(URL.createObjectURL(file)); // instant preview
    setUploading(true);
    try {
      const path = await uploadImage(file);
      setField("image", path);
      toast.success(`Image saved to public${path}`);
    } catch (err) {
      setLocalPreview(null);
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    handleFile(file);
  };

  const openFilePicker = () => {
    if (!uploading && !saving) fileInput.current?.click();
  };

  const save = async () => {
    if (!editing) return;
    const value = {
      ...editing.value,
      title: editing.value.title.trim(),
      author: editing.value.author.trim(),
    };
    const next = editing.isNew ? [...books, value] : books.map((b) => (b.id === value.id ? value : b));
    if (await writeBooks(next)) closeEditor();
  };

  const remove = async () => {
    if (!removing) return;
    const book = removing;
    setRemoving(null);
    await writeBooks(books.filter((b) => b.id !== book.id));
  };

  const valid =
    editing && editing.value.title.trim() && editing.value.author.trim() && editing.value.image;

  return (
    <div>
      <PageHeader
        title="Books"
        count={data ? books.length : undefined}
        addLabel="Add book"
        onAdd={openAdd}
        onReload={reload}
        disabled={loading || saving}
      />

      <LoadState loading={loading} error={error} onRetry={reload} />

      {data && !loading && (
        <>
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or author"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Card className="divide-y divide-border">
            {filtered.map((book) => (
              <div key={book.id} className="flex items-center gap-3 p-3">
                <img
                  src={resolveKnowledgeImage(book.image)}
                  alt=""
                  className="h-14 w-10 rounded object-cover shrink-0 bg-muted"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{book.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {book.author} · #{book.id}
                  </p>
                </div>
                <RowActions
                  onPreview={() => setPreview(book)}
                  onEdit={() => openEditor(book, false)}
                  onRemove={() => setRemoving(book)}
                  disabled={saving}
                />
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="p-6 text-center text-muted-foreground">
                {query ? "No matching books." : "No books yet."}
              </p>
            )}
          </Card>
        </>
      )}

      {/* Add / edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && !saving && !uploading && closeEditor()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? "Add book" : "Edit book"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-[1fr_180px] gap-6">
              <div className="grid gap-3 content-start">
                <div className="grid gap-1.5">
                  <Label htmlFor="book-title">Title</Label>
                  <Input
                    id="book-title"
                    value={editing.value.title}
                    onChange={(e) => setField("title", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="book-author">Author</Label>
                  <Input
                    id="book-author"
                    value={editing.value.author}
                    onChange={(e) => setField("author", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="book-image">Cover image</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      id="book-image"
                      type="button"
                      variant="outline"
                      onClick={openFilePicker}
                      disabled={uploading || saving}
                      className="shrink-0"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploading ? "Uploading…" : "Upload image"}
                    </Button>
                    <span className="text-sm text-muted-foreground truncate">
                      {editing.value.image ? fileName(editing.value.image) : "No image yet"}
                    </span>
                  </div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={onFileChosen}
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP or GIF, up to 5 MB. Saved in public/images/books.
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Live preview</Label>
                <button
                  type="button"
                  onClick={openFilePicker}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  disabled={uploading || saving}
                  title="Click or drop an image to change the cover"
                  className={`group/cover relative mt-1.5 block w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    dragging ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <BookCard
                    book={{
                      ...editing.value,
                      image: localPreview ?? editing.value.image,
                      title: editing.value.title || "Title",
                      author: editing.value.author || "Author",
                    }}
                  />
                  <span
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/55 text-white text-sm font-medium transition-opacity ${
                      uploading || dragging || !editing.value.image
                        ? "opacity-100"
                        : "opacity-0 group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100"
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <ImagePlus className="h-6 w-6" />
                    )}
                    {uploading
                      ? "Uploading…"
                      : dragging
                        ? "Drop image here"
                        : editing.value.image
                          ? "Change image"
                          : "Add cover image"}
                  </span>
                </button>
                <p className="mt-1.5 text-center text-xs text-muted-foreground">
                  Click the cover or drop an image on it
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closeEditor} disabled={saving || uploading}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!valid || saving || uploading}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          {preview && <BookCard book={preview} />}
        </DialogContent>
      </Dialog>

      <ConfirmRemove
        name={removing?.title ?? ""}
        open={!!removing}
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default BooksAdmin;
