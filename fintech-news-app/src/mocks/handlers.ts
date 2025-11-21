import { http, HttpResponse } from 'msw';
import { mockArticles } from './articles';
import { mockCategories } from './categories';

export const handlers = [
  // 記事一覧取得
  http.get('/api/articles', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');

    let filteredArticles = mockArticles;
    
    if (category && category !== 'all') {
      filteredArticles = mockArticles.filter(article => article.category === category);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    return HttpResponse.json({
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total: filteredArticles.length,
        hasMore: endIndex < filteredArticles.length,
      },
    });
  }),

  // 個別記事取得
  http.get('/api/articles/:id', ({ params }) => {
    const { id } = params;
    const article = mockArticles.find(a => a.id === id);

    if (!article) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(article);
  }),

  // カテゴリ一覧取得
  http.get('/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // 記事検索
  http.get('/api/articles/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const searchResults = mockArticles.filter(article =>
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.summary.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    return HttpResponse.json(searchResults);
  }),
];
