import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

// Stable ids for plain JSON objects, so rows keep their identity while being dragged.
const ids = new WeakMap<object, string>();
let counter = 0;
const idOf = (item: object) => {
  let id = ids.get(item);
  if (!id) {
    id = `row-${++counter}`;
    ids.set(item, id);
  }
  return id;
};

const SortableRow = ({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: (handle: ReactNode) => ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      disabled={disabled}
      aria-label="Drag to reorder"
      title={disabled ? undefined : "Drag to reorder"}
      className="-ml-1 flex h-8 w-6 shrink-0 touch-none items-center justify-center rounded text-muted-foreground cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative bg-card ${isDragging ? "z-10 rounded-md shadow-lg ring-1 ring-primary/40" : ""}`}
    >
      {children(handle)}
    </div>
  );
};

/**
 * A list whose rows can be reordered by dragging the grip handle
 * (or with the keyboard: focus the handle, press Space, move with ↑/↓, press Space again).
 */
function SortableList<T extends object>({
  items,
  onReorder,
  disabled,
  children,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  disabled?: boolean;
  children: (item: T, index: number, handle: ReactNode) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const rowIds = items.map(idOf);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = rowIds.indexOf(String(active.id));
    const to = rowIds.indexOf(String(over.id));
    if (from !== -1 && to !== -1) onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy} disabled={disabled}>
        {items.map((item, i) => (
          <SortableRow key={rowIds[i]} id={rowIds[i]} disabled={disabled}>
            {(handle) => children(item, i, handle)}
          </SortableRow>
        ))}
      </SortableContext>
    </DndContext>
  );
}

export default SortableList;
