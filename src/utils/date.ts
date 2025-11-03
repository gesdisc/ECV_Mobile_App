export const formatDate = (isoDateString: string) => {
    const date = new Date(isoDateString);
    return date.toISOString().split("T")[0];
};