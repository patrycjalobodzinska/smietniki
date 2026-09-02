"use client";

import { useState } from "react";
import { Eye, EyeOff, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  Field,
  Input,
  Select,
  StatCard,
  Tabs,
  type Column,
} from "@/components/ui";
import { ArticleDialog } from "@/components/domain/forms/article-dialog";
import {
  useArticleCategories,
  useArticles,
  useCreateArticleCategory,
  useDeleteArticle,
  useDeleteArticleCategory,
  useRenameArticleCategory,
  useToggleArticlePublish,
} from "@/lib/api/hooks/use-articles";
import { fileBlobUrl } from "@/lib/api/services/files";
import type { Article, ArticleCategory } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Content module (`/v1/articles`) — resident-facing notices and guides, with
 * draft/published state, categories and a main photo from the file store.
 */

const TABS = [
  { value: "articles", label: "Artykuły" },
  { value: "categories", label: "Kategorie" },
];

const PUBLISH_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "published", label: "Opublikowane" },
  { value: "draft", label: "Szkice" },
];

function CategoryDialog({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category?: ArticleCategory;
}) {
  const create = useCreateArticleCategory();
  const rename = useRenameArticleCategory();
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!name.trim()) return setError("Podaj nazwę kategorii.");
    const onDone = { onSuccess: onClose, onError: () => setError("Nie udało się zapisać kategorii.") };
    if (category) rename.mutate({ id: category.id, name }, onDone);
    else create.mutate(name, onDone);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={category ? "Zmień nazwę kategorii" : "Nowa kategoria"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={create.isPending || rename.isPending}>
            Zapisz
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nazwa" required>
          {({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}

export default function ContentPage() {
  const [tab, setTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState<"all" | "published" | "draft">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [edited, setEdited] = useState<Article | null>(null);
  const [catAddOpen, setCatAddOpen] = useState(false);
  const [catEdited, setCatEdited] = useState<ArticleCategory | null>(null);

  const { data: articles, isLoading } = useArticles({
    search,
    categoryId: categoryId || undefined,
    published,
  });
  const { data: categories, isLoading: categoriesLoading } = useArticleCategories();
  const togglePublish = useToggleArticlePublish();
  const removeArticle = useDeleteArticle();
  const removeCategory = useDeleteArticleCategory();

  const rows = articles ?? [];
  const publishedCount = rows.filter((a) => a.published).length;

  const categoryOptions = [
    { value: "", label: "Wszystkie kategorie" },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const articleCols: Column<Article>[] = [
    {
      key: "title",
      header: "Artykuł",
      cell: (a) => (
        <div className="flex items-center gap-3">
          {a.mainPhotoId ? (
            // eslint-disable-next-line @next/next/no-img-element -- proxied blob, no loader
            <img
              src={fileBlobUrl(a.mainPhotoId)}
              alt=""
              className="size-10 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{a.title}</p>
            {a.shortDescription && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{a.shortDescription}</p>
            )}
          </div>
        </div>
      ),
    },
    { key: "category", header: "Kategoria", cell: (a) => <Badge variant="outline">{a.categoryName}</Badge> },
    {
      key: "state",
      header: "Status",
      cell: (a) =>
        a.published ? (
          <Badge variant="success" dot>Opublikowany</Badge>
        ) : (
          <Badge variant="muted" dot>Szkic</Badge>
        ),
    },
    {
      key: "created",
      header: "Utworzony",
      cell: (a) => <span className="text-sm text-muted-foreground">{formatDateTime(a.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (a) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            loading={togglePublish.isPending && togglePublish.variables?.id === a.id}
            onClick={() => togglePublish.mutate({ id: a.id, publish: !a.published })}
          >
            {a.published ? <EyeOff /> : <Eye />}
            {a.published ? "Ukryj" : "Publikuj"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEdited(a)}>
            <Pencil /> Edytuj
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm(`Usunąć artykuł „${a.title}”?`)) removeArticle.mutate(a.id);
            }}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const categoryCols: Column<ArticleCategory>[] = [
    { key: "name", header: "Kategoria", cell: (c) => <span className="font-medium">{c.name}</span> },
    {
      key: "count",
      header: "Artykuły",
      align: "right",
      cell: (c) => <span className="tabular-nums">{c.articleCount}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (c) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => setCatEdited(c)}>
            <Pencil /> Zmień nazwę
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm(`Usunąć kategorię „${c.name}”?`)) removeCategory.mutate(c.id);
            }}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Treści"
        description="Artykuły i komunikaty dla mieszkańców wraz z kategoriami."
        actions={
          tab === "articles" ? (
            <Button onClick={() => setAddOpen(true)}>
              <Plus /> Nowy artykuł
            </Button>
          ) : (
            <Button onClick={() => setCatAddOpen(true)}>
              <Plus /> Nowa kategoria
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Artykuły" value={rows.length} icon={FileText} />
        <StatCard label="Opublikowane" value={publishedCount} tone="success" />
        <StatCard label="Kategorie" value={categories?.length ?? 0} />
      </div>

      <Tabs items={TABS} value={tab} onValueChange={setTab} />

      {tab === "articles" ? (
        <>
          <FilterBar>
            <div className="min-w-56 flex-1">
              <Input
                icon={<Search />}
                placeholder="Szukaj tytułu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <Select
              options={categoryOptions}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 w-52"
            />
            <Select
              options={PUBLISH_OPTIONS}
              value={published}
              onChange={(e) => setPublished(e.target.value as "all" | "published" | "draft")}
              className="h-9 w-44"
            />
          </FilterBar>
          <DataTable
            columns={articleCols}
            data={rows}
            rowKey={(a) => a.id}
            loading={isLoading}
            emptyTitle="Brak artykułów"
            emptyDescription="Dodaj pierwszy komunikat dla mieszkańców."
            pageSize={15}
          />
        </>
      ) : (
        <DataTable
          columns={categoryCols}
          data={categories}
          rowKey={(c) => c.id}
          loading={categoriesLoading}
          emptyTitle="Brak kategorii"
          emptyDescription="Kategoria jest wymagana przy tworzeniu artykułu."
          pageSize={15}
        />
      )}

      {addOpen && <ArticleDialog open onClose={() => setAddOpen(false)} />}
      {edited && <ArticleDialog open article={edited} onClose={() => setEdited(null)} />}
      {catAddOpen && <CategoryDialog open onClose={() => setCatAddOpen(false)} />}
      {catEdited && (
        <CategoryDialog open category={catEdited} onClose={() => setCatEdited(null)} />
      )}
    </div>
  );
}
