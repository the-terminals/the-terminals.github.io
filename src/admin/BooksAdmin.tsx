import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookCard, { type Book } from "@/components/cards/BookCard";
import { knowledgeImageOptions, resolveKnowledgeImage } from "@/data/knowledgeAssets";
import { useJsonFile } from "./useJsonFile";
import { ConfirmRemove, LoadState, PageHeader, RowActions } from "./AdminParts";

type KnowledgeFile = { books: Book[] } & Record<string, unknown>;

const URL_OPTION = "__url";

const BooksAdmin = () => {
  const { data, loading, saving, error, reload, save: saveFile } = useJsonFile<KnowledgeFile>("knowledge.json");
  const [editing, setEditing] = useState<{ isNew: boolean; value: Book } | null>(null);
  const [preview, setPreview] = useState<Book | null>(null);
  const [removing, setRemoving] = useState<Book | null>(null);
  const [query, setQuery] = useState("");

  const books = useMemo(() => data?.books ?? [], [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? books.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(q)) : books;
  }, [books, query]);

  const writeBooks = (next: Book[]) => saveFile({ ...(data as KnowledgeFile), books: next });

  const openAdd = () => {
    const nextId = books.reduce((m, b) => Math.max(m, b.id), 0) + 1;
    setEditing({
      isNew: true,
      value: { id: nextId, title: "", author: "", image: knowledgeImageOptions[0] ?? "" },
    });
  };

  const setField = (key: keyof Book, value: string) =>
    editing && setEditing({ ...editing, value: { ...editing.value, [key]: value } });

  const save = async () => {
    if (!editing) return;
    const value = {
      ...editing.value,
      title: editing.value.title.trim(),
      author: editing.value.author.trim(),
      image: editing.value.image.trim(),
    };
    const next = editing.isNew ? [...books, value] : books.map((b) => (b.id === value.id ? value : b));
    if (await writeBooks(next)) setEditing(null);
  };

  const remove = async () => {
    if (!removing) return;
    const book = removing;
    setRemoving(null);
    await writeBooks(books.filter((b) => b.id !== book.id));
  };

  const imageIsBundled = editing ? knowledgeImageOptions.includes(editing.value.image) : true;
  const valid =
    editing && editing.value.title.trim() && editing.value.author.trim() && editing.value.image.trim();

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
                  onEdit={() => setEditing({ isNew: false, value: book })}
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
      <Dialog open={!!editing} onOpenChange={(o) => !o && !saving && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? "Add book" : "Edit book"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-[1fr_180px] gap-6">
              <div className="grid gap-3 content-start">
                <div className="grid gap-1.5">
                  <Label htmlFor="book-title">Title</Label>
                  <Input id="book-title" value={editing.value.title} onChange={(e) => setField("title", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="book-author">Author</Label>
                  <Input id="book-author" value={editing.value.author} onChange={(e) => setField("author", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="book-image">Cover image</Label>
                  <Select
                    value={imageIsBundled ? editing.value.image : URL_OPTION}
                    onValueChange={(v) => setField("image", v === URL_OPTION ? "" : v)}
                  >
                    <SelectTrigger id="book-image">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {knowledgeImageOptions.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                      <SelectItem value={URL_OPTION}>Image URL…</SelectItem>
                    </SelectContent>
                  </Select>
                  {!imageIsBundled && (
                    <Input
                      placeholder="https://example.com/cover.jpg"
                      value={editing.value.image}
                      onChange={(e) => setField("image", e.target.value)}
                    />
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Live preview</Label>
                <div className="mt-1.5">
                  <BookCard
                    book={{
                      ...editing.value,
                      title: editing.value.title || "Title",
                      author: editing.value.author || "Author",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!valid || saving}>
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
