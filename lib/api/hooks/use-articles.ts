"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  articlesService,
  type ArticleFilters,
  type ArticleInput,
} from "@/lib/api/services/articles";

export function useArticles(f: ArticleFilters = {}) {
  return useQuery({ queryKey: qk.articles.list(f), queryFn: () => articlesService.list(f) });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: qk.articles.detail(id),
    queryFn: () => articlesService.get(id),
    enabled: !!id,
  });
}

export function useArticleCategories(search?: string) {
  return useQuery({
    queryKey: qk.articles.categories({ search }),
    queryFn: () => articlesService.categories(search),
  });
}

function useArticleMutation<TVars>(fn: (v: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.articles.all }),
  });
}

export function useCreateArticle() {
  return useArticleMutation((input: ArticleInput) => articlesService.create(input));
}
export function useUpdateArticle() {
  return useArticleMutation(({ id, input }: { id: string; input: ArticleInput }) =>
    articlesService.update(id, input),
  );
}
export function useToggleArticlePublish() {
  return useArticleMutation(({ id, publish }: { id: string; publish: boolean }) =>
    publish ? articlesService.publish(id) : articlesService.hide(id),
  );
}
export function useDeleteArticle() {
  return useArticleMutation((id: string) => articlesService.remove(id));
}
export function useSetArticlePhoto() {
  return useArticleMutation(({ id, fileId }: { id: string; fileId: string }) =>
    articlesService.setPhoto(id, fileId),
  );
}
export function useRemoveArticlePhoto() {
  return useArticleMutation((id: string) => articlesService.removePhoto(id));
}
export function useCreateArticleCategory() {
  return useArticleMutation((name: string) => articlesService.createCategory(name));
}
export function useRenameArticleCategory() {
  return useArticleMutation(({ id, name }: { id: string; name: string }) =>
    articlesService.renameCategory(id, name),
  );
}
export function useDeleteArticleCategory() {
  return useArticleMutation((id: string) => articlesService.removeCategory(id));
}
