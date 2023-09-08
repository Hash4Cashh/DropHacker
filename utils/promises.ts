export const TIME_LIMIT_MES = "TIME_OUT";
export const TIME_LIMIT = 7;
export const DOUBLE_TIME_LIMIT = 10;

export async function timeLimitPromise<T>(func: Promise<any>, timeLimit: number = TIME_LIMIT, throwError = false) {
    let timeout;

    const timeoutPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
            if(throwError) reject(TIME_LIMIT_MES);
            resolve(TIME_LIMIT_MES);
        }, timeLimit * 1000); // seconds
    });

    const response = await Promise.race([func, timeoutPromise]);
    
    if(timeout) clearTimeout(timeout);

    return response as T;
}