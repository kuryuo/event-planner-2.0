export const combineDateTime = (date: Date | undefined, time: string): string | undefined => {
    if (!date || !time) return undefined;
    const combined = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
};
