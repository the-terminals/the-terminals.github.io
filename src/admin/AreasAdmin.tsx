import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AreaCard, { type Area } from "@/components/cards/AreaCard";
import { areaIconNames, areaIcons } from "@/data/areaIcons";
import { useJsonFile } from "./useJsonFile";
import { ConfirmRemove, LoadState, PageHeader, ReorderHint, RowActions } from "./AdminParts";
import SortableList from "./SortableList";

const emptyArea: Area = { icon: "Lightbulb", title: "", description: "" };

const AreasAdmin = () => {
  const { data, loading, saving, error, reload, save: saveFile } = useJsonFile<Area[]>("areasOfWork.json");
  const [editing, setEditing] = useState<{ index: number | null; value: Area } | null>(null);
  const [preview, setPreview] = useState<Area | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const areas = data ?? [];

  const setField = (key: keyof Area, value: string) =>
    editing && setEditing({ ...editing, value: { ...editing.value, [key]: value } });

  const save = async () => {
    if (!editing) return;
    const value = {
      ...editing.value,
      title: editing.value.title.trim(),
      description: editing.value.description.trim(),
    };
    const isNew = editing.index === null;
    const next = isNew ? [...areas, value] : areas.map((a, i) => (i === editing.index ? value : a));
    if (await saveFile(next)) setEditing(null);
  };

  const remove = async () => {
    if (removing === null) return;
    const index = removing;
    setRemoving(null);
    await saveFile(areas.filter((_, i) => i !== index));
  };

  const valid = editing && editing.value.title.trim() && editing.value.description.trim();

  return (
    <div>
      <PageHeader
        title="Areas of Impact"
        count={data ? areas.length : undefined}
        addLabel="Add area"
        onAdd={() => setEditing({ index: null, value: emptyArea })}
        onReload={reload}
        disabled={loading || saving}
      />

      <LoadState loading={loading} error={error} onRetry={reload} />

      {data && !loading && areas.length > 1 && <ReorderHint />}
      {data && !loading && (
        <Card className="divide-y divide-border">
          <SortableList items={areas} onReorder={(next) => saveFile(next, "Order saved")} disabled={saving}>
            {(area, i, handle) => {
              const Icon = areaIcons[area.icon] ?? areaIcons.Lightbulb;
              return (
                <div className="flex items-center gap-3 p-3">
                  {handle}
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{area.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{area.description}</p>
                  </div>
                  <RowActions
                    onPreview={() => setPreview(area)}
                    onEdit={() => setEditing({ index: i, value: area })}
                    onRemove={() => setRemoving(i)}
                    disabled={saving}
                  />
                </div>
              );
            }}
          </SortableList>
          {areas.length === 0 && <p className="p-6 text-center text-muted-foreground">No areas yet.</p>}
        </Card>
      )}

      {/* Add / edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && !saving && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.index === null ? "Add area" : "Edit area"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-3 content-start">
                <div className="grid gap-1.5">
                  <Label htmlFor="area-icon">Icon</Label>
                  <Select value={editing.value.icon} onValueChange={(v) => setField("icon", v)}>
                    <SelectTrigger id="area-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {areaIconNames.map((name) => {
                        const Icon = areaIcons[name];
                        return (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" /> {name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="area-title">Title</Label>
                  <Input
                    id="area-title"
                    value={editing.value.title}
                    onChange={(e) => setField("title", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="area-description">Description</Label>
                  <Textarea
                    id="area-description"
                    rows={4}
                    value={editing.value.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Live preview</Label>
                <div className="mt-1.5 rounded-lg bg-secondary/30 p-4">
                  <AreaCard area={{ ...editing.value, title: editing.value.title || "Title" }} />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-secondary/30 p-4">{preview && <AreaCard area={preview} />}</div>
        </DialogContent>
      </Dialog>

      <ConfirmRemove
        name={removing !== null ? (areas[removing]?.title ?? "") : ""}
        open={removing !== null}
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default AreasAdmin;
