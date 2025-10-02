export type Retryable<T> = T & {
    shouldRetry: boolean;
};
