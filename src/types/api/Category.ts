export interface Category {
    id: string;
    name: string;
    eventCategories: string[] | null;
}

export interface CategoriesResponse {
    result: Category[];
}
