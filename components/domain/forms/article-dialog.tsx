"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button, Dialog, Field, Input, Select, Textarea } from "@/components/ui";
import {
  useArticleCategories,
  useCreateArticle,
  useRemoveArticlePhoto,
  useSetArticlePhoto,
  useUpdateArticle,
} from "@/lib/api/hooks/use-articles";
import { useUploadFile } from "@/lib/api/hooks/use-files";
import { fileBlobUrl } from "@/lib/api/services/files";
import type { Article } from "@/lib/types";

/**
 * Create / edit an article (POST /v1/articles, PUT /v1/articles/{id}/information)
 * including its main photo, which goes through the file store first
 * (POST /v1/files → PUT /v1/articles/{id}/photo).
 */
export function ArticleDialog({
  open,
  onClose,
  article,
}: {
  open: boolean;
  onClose: () => void;
  article?: Article;
}) {
  const editing = !!article;
  const create = useCreateArticle();
  const update = useUpdateArticle();
  const upload = useUploadFile();
  const setPhoto = useSetArticlePhoto();
  const removePhoto = useRemoveArticlePhoto();
  const { data: categories } = useArticleCategories();
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [shortDescription, setShortDescription] = useState(article?.shortDescription ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [photoId, setPhotoId] = useState(article?.mainPhotoId ?? null);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = [
    { value: "", label: "— wybierz kategorię —" },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  function submit() {
    setError(null);
    if (!title.trim()) return setError("Podaj tytuł artykułu.");
    if (!categoryId) return setError("Wybierz kategorię.");
    const input = { title, shortDescription, content, categoryId };
    const onDone = { onSuccess: onClose, onError: () => setError("Nie udało się zapisać artykułu.") };
    if (editing) update.mutate({ id: article.id, input }, onDone);
    else create.mutate(input, onDone);
  }

  async function pickPhoto(file: File | undefined) {
    if (!file || !article) return;
    setError(null);
    try {
      const stored = await upload.mutateAsync({ file, container: "Public" });
      await setPhoto.mutateAsync({ id: article.id, fileId: stored.id });
      setPhotoId(stored.id);
    } catch {
      setError("Nie udało się wgrać zdjęcia.");
    }
  }

  async function dropPhoto() {
    if (!article) return;
    try {
      await removePhoto.mutateAsync(article.id);
      setPhotoId(null);
    } catch {
      setError("Nie udało się usunąć zdjęcia.");
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edytuj artykuł" : "Nowy artykuł"}
      description="Treść dla mieszkańców — publikacja odbywa się osobną akcją."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={pending}>
            {editing ? "Zapisz zmiany" : "Utwórz"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Tytuł" required>
          {({ id }) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} />}
        </Field>
        <Field label="Kategoria" required>
          {({ id }) => (
            <Select
              id={id}
              options={categoryOptions}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          )}
        </Field>
        <Field label="Skrót" hint="Krótki opis widoczny na liście.">
          {({ id }) => (
            <Textarea
              id={id}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
            />
          )}
        </Field>
        <Field label="Treść">
          {({ id }) => (
            <Textarea id={id} value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
          )}
        </Field>

        {editing && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Zdjęcie główne</p>
            {photoId ? (
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- proxied blob, no loader */}
                <img
                  src={fileBlobUrl(photoId)}
                  alt="Zdjęcie główne artykułu"
                  className="h-24 w-40 rounded-xl border border-border object-cover"
                />
                <Button variant="ghost" size="sm" onClick={dropPhoto} loading={removePhoto.isPending}>
                  <Trash2 /> Usuń
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Brak zdjęcia.</p>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickPhoto(e.target.files?.[0])}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInput.current?.click()}
              loading={upload.isPending || setPhoto.isPending}
            >
              <ImagePlus /> {photoId ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
