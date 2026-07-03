export const formatMoneyRu = (value) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(
        Math.round(value)
    );
