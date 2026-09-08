"use client";

import { useRef, useState } from "react";
import { Copy, FileUp, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Input,
  Select,
} from "@/components/ui";
import {
  useDeleteFile,
  useFileContainers,
  useUploadFile,
} from "@/lib/api/hooks/use-files";
import { fileBlobUrl } from "@/lib/api/services/files";
import { filesService } from "@/lib/api/services/files";
import type { StoredFile } from "@/lib/types";

/** One stored file: thumbnail (non-images render blank), id, copy and delete. */
function FileRow({
  file,
  onCopy,
  onDelete,
}: {
  file: StoredFile;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- proxied blob, no loader */}
      <img
        src={fileBlobUrl(file.id)}
        alt=""
        className="size-12 shrink-0 rounded-lg border border-border bg-muted object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs">{file.id}</p>
        {file.url && <p className="truncate text-xs text-muted-foreground">{file.url}</p>}
      </div>
      <Button size="sm" variant="ghost" onClick={() => onCopy(file.id)}>
        <Copy /> Kopiuj id
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onDelete(file.id)}>
        <Trash2 />
      </Button>
    </div>
  );
}

/**
 * File store tooling (`/v1/files`). The API has no browse endpoint - a file is
 * reachable only by id - so this screen uploads, looks up by id and deletes;
 * uploads made here are kept in a session list for convenience.
 */
export default function FilesPage() {
  const { data: containers } = useFileContainers();
  const upload = useUploadFile();
  const remove = useDeleteFile();
  const fileInput = useRef<HTMLInputElement>(null);

  const [container, setContainer] = useState("Public");
  const [uploaded, setUploaded] = useState<StoredFile[]>([]);
  const [lookupId, setLookupId] = useState("");
  const [lookup, setLookup] = useState<StoredFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const containerOptions = (containers ?? []).length
    ? (containers ?? []).map((c) => ({ value: c.name, label: c.displayName || c.name }))
    : [
        { value: "Public", label: "Public" },
        { value: "Private", label: "Private" },
      ];

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setOk(null);
    try {
      const stored = await upload.mutateAsync({ file, container });
      setUploaded((prev) => [stored, ...prev]);
      setOk(`Wgrano „${file.name}”.`);
    } catch {
      setError("Nie udało się wgrać pliku.");
    }
  }

  async function find() {
    setError(null);
    setLookup(null);
    if (!lookupId.trim()) return setError("Podaj identyfikator pliku.");
    try {
      setLookup(await filesService.get(lookupId.trim()));
    } catch {
      setError("Nie znaleziono pliku o tym identyfikatorze.");
    }
  }

  async function drop(id: string) {
    if (!confirm("Usunąć plik trwale?")) return;
    try {
      await remove.mutateAsync(id);
      setUploaded((prev) => prev.filter((f) => f.id !== id));
      if (lookup?.id === id) setLookup(null);
      setOk("Plik usunięty.");
    } catch {
      setError("Nie udało się usunąć pliku.");
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    setOk("Skopiowano do schowka.");
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <PageHeader title="Pliki" />

      <div className="grid gap-3 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wgraj plik</CardTitle>
            <CardDescription>
              Plik trafia do wybranego kontenera i jest adresowany identyfikatorem - używanym np.
              jako zdjęcie główne artykułu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Field label="Kontener">
              {({ id }) => (
                <Select
                  id={id}
                  options={containerOptions}
                  value={container}
                  onChange={(e) => setContainer(e.target.value)}
                />
              )}
            </Field>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            <Button onClick={() => fileInput.current?.click()} loading={upload.isPending}>
              <FileUp /> Wybierz plik
            </Button>
            {error && <p className="text-sm text-danger">{error}</p>}
            {ok && <p className="text-sm text-success">{ok}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Znajdź plik</CardTitle>
            <CardDescription>API nie udostępnia listy plików - potrzebny jest identyfikator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Field label="Identyfikator pliku">
              {({ id }) => (
                <div className="flex gap-2">
                  <Input id={id} value={lookupId} onChange={(e) => setLookupId(e.target.value)} />
                  <Button variant="outline" onClick={find}>
                    <Search /> Szukaj
                  </Button>
                </div>
              )}
            </Field>
            {lookup ? (
              <FileRow file={lookup} onCopy={copy} onDelete={drop} />
            ) : (
              <p className="text-xs text-muted-foreground">Wklej identyfikator, aby zobaczyć podgląd.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Wgrane w tej sesji</CardTitle>
          <Badge variant="muted">{uploaded.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {uploaded.length ? (
            uploaded.map((f) => <FileRow key={f.id} file={f} onCopy={copy} onDelete={drop} />)
          ) : (
            <EmptyState
              icon={FileUp}
              title="Brak wgranych plików"
              description="Lista pokazuje pliki wgrane w tej sesji - API nie udostępnia przeglądania magazynu."
              className="border-0"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
