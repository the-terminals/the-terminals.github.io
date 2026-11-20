import { Eye, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PageHeader = ({
  title,
  count,
  onAdd,
  addLabel,
  onReload,
  disabled,
}: {
  title: string;
  count?: number;
  onAdd: () => void;
  addLabel: string;
  onReload: () => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
      {count !== undefined && <p className="text-sm text-muted-foreground">{count} items</p>}
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onReload} disabled={disabled}>
        <RefreshCw className="h-4 w-4 mr-2" /> Reload
      </Button>
      <Button size="sm" onClick={onAdd} disabled={disabled}>
        <Plus className="h-4 w-4 mr-2" /> {addLabel}
      </Button>
    </div>
  </div>
);

export const RowActions = ({
  onPreview,
  onEdit,
  onRemove,
  disabled,
}: {
  onPreview: () => void;
  onEdit: () => void;
  onRemove: () => void;
  disabled?: boolean;
}) => (
  <div className="flex gap-1 shrink-0">
    <Button variant="ghost" size="sm" onClick={onPreview} title="Preview">
      <Eye className="h-4 w-4" />
      <span className="hidden sm:inline ml-1">Preview</span>
    </Button>
    <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled} title="Edit">
      <Pencil className="h-4 w-4" />
      <span className="hidden sm:inline ml-1">Edit</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onRemove}
      disabled={disabled}
      title="Remove"
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      <span className="hidden sm:inline ml-1">Remove</span>
    </Button>
  </div>
);

export const ConfirmRemove = ({
  name,
  open,
  onCancel,
  onConfirm,
}: {
  name: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove “{name}”?</AlertDialogTitle>
        <AlertDialogDescription>
          This removes it from the website. You can add it again later.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Remove
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const LoadState = ({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  if (loading)
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  if (error)
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <p className="text-destructive mb-3">{error}</p>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  return null;
};
