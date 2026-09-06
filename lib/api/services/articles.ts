import { getPagedItems, http } from "@/lib/api/client";
import type { Article, ArticleCategory } from "@/lib/types";

/**
 * Content module (`/v1/articles`) - the CMS behind resident-facing notices
 * (segregation guides, outage announcements). Articles are drafts until
 * published, carry a category and an optional main photo from the file store.
 */

interface BaseCategory {
  id: string;
  name: string;
}

interface ArticleDto {
  id: string;
  title: string;
  shortDescription: string | null;
  content?: string | null;
  mainPhotoId: string | null;
  createdAt: string;
  categoryId: string;
  category?: BaseCategory | null;
  isPublish: boolean | null;
}

function mapArticle(d: ArticleDto): Article {
  return {
    id: d.id,
    title: d.title,
    shortDescription: d.shortDescription ?? null,
    content: d.content ?? null,
    mainPhotoId: d.mainPhotoId ?? null,
    createdAt: d.createdAt,
    categoryId: d.categoryId,
    categoryName: d.category?.name ?? "-",
    published: !!d.isPublish,
  };
}

interface ArticleCategoryDto {
  id: string;
  name: string;
  numberOfArticles?: number;
}

export interface ArticleFilters {
  search?: string;
  categoryId?: string;
  published?: "all" | "published" | "draft";
}

export interface ArticleInput {
  title: string;
  shortDescription?: string | null;
  content?: string | null;
  categoryId: string;
}

export const articlesService = {
  async list(f: ArticleFilters = {}): Promise<Article[]> {
    const dtos = await getPagedItems<ArticleDto>("/v1/articles", {
      Search: f.search,
      CategoryId: f.categoryId,
      IsPublish:
        f.published && f.published !== "all" ? f.published === "published" : undefined,
    });
    return dtos.map(mapArticle).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  get(id: string): Promise<Article> {
    return http.get<ArticleDto>(`/v1/articles/${id}`).then(mapArticle);
  },

  async create(input: ArticleInput): Promise<string> {
    const res = await http.post<{ articleId: string }>("/v1/articles", articleBody(input));
    return res?.articleId ?? "";
  },

  update(id: string, input: ArticleInput): Promise<void> {
    return http.put<void>(`/v1/articles/${id}/information`, articleBody(input));
  },

  publish(id: string): Promise<void> {
    return http.put<void>(`/v1/articles/${id}/publish`);
  },

  hide(id: string): Promise<void> {
    return http.put<void>(`/v1/articles/${id}/hide`);
  },

  remove(id: string): Promise<void> {
    return http.del<void>(`/v1/articles/${id}`);
  },

  /**
   * Points the article's main photo at an uploaded file (see filesService).
   * The command also needs `articleId` in the body - Swagger documents only
   * `mainPhotoId`, and without the id the request fails to bind (400).
   */
  setPhoto(id: string, fileId: string): Promise<void> {
    return http.put<void>(`/v1/articles/${id}/photo`, { articleId: id, mainPhotoId: fileId });
  },

  removePhoto(id: string): Promise<void> {
    return http.del<void>(`/v1/articles/${id}/photo`);
  },

  /* ---- Categories ------------------------------------------------- */

  async categories(search?: string): Promise<ArticleCategory[]> {
    const dtos = await getPagedItems<ArticleCategoryDto>("/v1/articles/categories", {
      Search: search,
    });
    return dtos
      .map((c) => ({ id: c.id, name: c.name, articleCount: c.numberOfArticles ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name, "pl"));
  },

  async createCategory(name: string): Promise<string> {
    const res = await http.post<{ articleCategoryId: string }>("/v1/articles/categories", {
      name: name.trim(),
    });
    return res?.articleCategoryId ?? "";
  },

  renameCategory(id: string, name: string): Promise<void> {
    return http.put<void>(`/v1/articles/categories/${id}/information`, { name: name.trim() });
  },

  removeCategory(id: string): Promise<void> {
    return http.del<void>(`/v1/articles/categories/${id}`);
  },
};

function articleBody(input: ArticleInput) {
  return {
    title: input.title.trim(),
    shortDescription: input.shortDescription?.trim() || null,
    content: input.content?.trim() || null,
    categoryId: input.categoryId,
  };
}
