/**
 * Группирует элементы массива по ключу, полученному из функции-селектора.
 * Возвращает объект, где ключи — это значения, полученные из keyFn, а значения — массивы элементов с этим ключом.
 *
 * @param array - исходный массив для группировки
 * @param keyFn - функция, которая возвращает ключ группировки для каждого элемента
 * @returns объект с сгруппированными элементами
 */
export const groupBy = <T, K extends string | number>(
    array: T[],
    keyFn: (item: T) => K
): Record<K, T[]> => {
    return array.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<K, T[]>);
};