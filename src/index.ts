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

export interface CacheStorageProvider {
   // read function to get stored value
   readValue?: Function;

   // write function to set stored value
   writeValue?: Function;
}

export interface CacheValue {
    value: any;
    created: number;
}

function readInMemoryCache(key: string): CacheValue {
    return cache[key];
}

function writeInMemoryCache(key: string, data: CacheValue) {
    cache[key] = data;
    cacheTime[key] = Date.now();
}

/**
 * Given an observable take the value emitted and cache it. If called the cached value will be emitted
 * unless the cached value has expired.
 * @param  {string} key A unique identifier for the observable
 * @param  {Observable<any>} observable The observable, eg from HttpClient.get
 * @param  {CacheOptions} options? Cache options object
 * @param  {CacheStorageProvider} storageProvider? Read and write functions for the cache
 * @returns Observable
 */
export function CacheObserver(
    key: string, 
    observable: Observable<any>, 
    options?: CacheOptions,
    storageProvider?: CacheStorageProvider
    ): Observable<any> {
    return Observable.create(function (observer) {
        const emitDuplicates = (options) ? options.emitDuplicates : true;
        const alwaysGetValue = (options) ? options.alwaysGetValue : false;
        const readFunction = (storageProvider?.readValue) ? storageProvider.readValue : readInMemoryCache;
        const writeFunction = (storageProvider?.writeValue) ? storageProvider.writeValue : writeInMemoryCache;
        const cachedValue: CacheValue = readFunction(key);
 
        if (cachedValue) {
            const age = Date.now() - cachedValue.created;
            const expiresMs = (options && options.expiresMs) ? options.expiresMs : Number.MAX_VALUE;

            if (age < expiresMs && !emitDuplicates) {
                // Emit the cached value
                observer.next(cachedValue.value);

                // If we always get fresh value then do not complete here
                if (!alwaysGetValue) {
                    observer.complete();
                    return;
                }
            } else {
                // Cached value has expired
                if (alwaysGetValue) {
                    // Emit the cached value as we'll get a fresh value
                    observer.next(cachedValue.value);
                }
            }
        }
        const subscription = observable.subscribe((value) => {
            writeFunction(key, {created: Date.now(), value: value });
            if (!emitDuplicates && cachedValue) {
                // If the fresh value is the same as the cached value then do not emit
                if (JSON.stringify(cachedValue.value) === JSON.stringify(value)) {
                    observer.complete();
                    return;
                }
            }

            observer.next(value);
            observer.complete();
            subscription.unsubscribe();
        }, (error) => { observer.error(error); });
    });
}