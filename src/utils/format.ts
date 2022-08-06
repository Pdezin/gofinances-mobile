export const formatHelper = {
  formatDate(date: Date | string): string {
    if (date) {
      if (typeof date === "string") date = new Date(date);

      return Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    }
    return "";
  },
  formatCurrency(value: number | string): string {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  },
};
