export interface StatisticData<T extends string> {
    name: string;
    type: T;
    hasMaps?: boolean;
    mapOptional?: boolean;
    secondaryFilter?: string;
    explanatoryText?: string;
    defaultSecondaryFilter?: number;
}
