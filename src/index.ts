import { Observable } from "rxjs";

var cache = {};
var cacheTime = {};

export class CacheStrategy {
    public static OneMinute: CacheOptions = { expiresMs: 60000 };
    public static OneHour: CacheOptions = { expiresMs: 3600000 };
    public static OneDay: CacheOptions = { expiresMs: 86400000 };
    public static Fresh: CacheOptions = { alwaysGetValue: true, emitDuplicates: false };
}

export interface CacheOptions {
    // Time in milliseconds before the cached value expires
    // Default: unlimited
    expiresMs?: number;

    // Whether to always get a fresh value. If try 2 values will be emitted: the cached and fresh values
    // Default: false
    alwaysGetValue?: boolean;

    // Whether a duplicate value will be emitted.
    emitDuplicates?: boolean;
}

/**
 * Given an observable take the value emitted and cache it. If called the cached value will be emitted
 * unless the cached value has expired.
 * @param  {string} key A unique identifier for the observable
 * @param  {Observable<any>} observable The observable, eg from HttpClient.get
 * @param  {CacheOptions} options? Cache options object
 * @returns Observable
 */
export function CacheObserver(key: string, observable: Observable<any>, options?: CacheOptions): Observable<any> {
    return Observable.create(function (observer) {
        const emitDuplicates = (options) ? options.emitDuplicates : true;
        const cachedValue = cache[key];
        const alwaysGetValue = (options) ? options.alwaysGetValue : false;

        if (cachedValue) {
            const age = Date.now() - cacheTime[key];
            const expiresMs = (options && options.expiresMs) ? options.expiresMs : Number.MAX_VALUE;

            if (age < expiresMs && !emitDuplicates) {
                // Emit the cached value
                observer.next(cachedValue);

                // If we always get fresh value then do not complete here
                if (!alwaysGetValue) {
                    observer.complete();
                    return;
                }
            } else {
                // Cached value has expired
                if (alwaysGetValue) {
                    // Emit the cached value as we'll get a fresh value
                    observer.next(cachedValue);
                }
            }
        }
        const subscription = observable.subscribe((value) => {
            if (!emitDuplicates && cachedValue) {
                // If the fresh value is the same as the cached value then do not emit
                if (JSON.stringify(cachedValue) === JSON.stringify(value)) {
                    cacheTime[key] = Date.now();
                    observer.complete();
                    return;
                }
            }
            cache[key] = value;
            cacheTime[key] = Date.now();

            observer.next(value);
            observer.complete();
            subscription.unsubscribe();
        }, (error) => { observer.error(error); });
    });
}