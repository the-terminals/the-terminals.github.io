import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { loadFile, saveFile, type DataFile } from "./storage";

export function useJsonFile<T>(file: DataFile) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loadFile<T>(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Writes the whole file. The new data shows immediately and is rolled back if the write fails.
   * Returns true on success.
   */
  const save = async (next: T, successMessage = `Saved to src/data/${file}`) => {
    const previous = data;
    setData(next);
    setSaving(true);
    try {
      await saveFile(file, next);
      toast.success(successMessage);
      return true;
    } catch (e) {
      setData(previous);
      toast.error((e as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { data, loading, saving, error, reload, save };
}
