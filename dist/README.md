# Cache Observer
This package is intended to make caching easier for Angular HttpClient calls. It can be used to ensure a user interface is presented as quickly as possible and it can minimize API calls to a backend.

## Installation
`npm install rx-cache-observer`

## Adding To A Project
In the code where you are using `HttpClient` add the following import:

```typescript
import { CacheObserver, CacheOptions, CacheStrategy } from 'rx-cache-observer';`
```

Lets add caching to this API call:
```typescript
  public getJoke(): Observable<any> {
    const url = 'https://api.chucknorris.io/jokes/random';
    return this.httpClient.get(url);
  }
```

We add the function `CacheObserver` which takes a key (in this case the url), our original observable and a caching strategy:
```typescript
  public getJoke(): Observable<any> {
    const url = 'https://api.chucknorris.io/jokes/random';
    return CacheObserver(url, this.httpClient.get(url), CacheStrategy.OneMinute);
  }
  ```

Now, whenever our api call to `getJoke` is made it will get a joke from the server the first time, the second time it is called it will return the cached joke. If it has been longer than 1 minute the joke will be obtained from the server again.

## Caching Observer
`CacheObserver` takes 3 parameters:
- __key__ - This is a unique string to identify the cached data. For example if your api gets orders then you can name this `orders`. If there are multiple
- __observable_ - This is the observable you want to cache values from. Typically this will be for `get` API calls.
- __options__ - This is an optional parameter of type `CacheOptions` which specifies how values are cached.

## Caching Options
Here are some examples of CacheOptions you can use:

#### `CacheStrategy.OneMinute`
This CacheOptions object will cache values for at most 1 minute.

#### `CacheStrategy.OneHour`
This CacheOptions object will cache values for at most 1 hour.

#### `CacheStrategy.OneDay`
This CacheOptions object will cache values for at most 1 day.

#### `CacheStrategy.Fresh`
This CacheOptions object will cache values and will emit the cached value, it will also call the API and also emit the new value if the new value is different. This means that your observable may emit 2 values. This strategy is great if you always want to display data to the user as fast as possible and ensure that if there is new data it is also shown.

#### `{ expiresMs: 5000 }`
This CacheOptions object will cache values for 5 seconds. The value for expiresMs is in milliseconds.

#### `{ alwaysGetValue: true }`
This CacheOptions object will emit the cached value then get the new value and emit to also.

#### `{ alwaysGetValue: true, emitDuplicates: false }`
This CacheOptions object is the same as `CacheStrategy.Fresh`: It will emit the cached value and get a new value which if the cached value and new value are different then it will emit the new value as well.

## Examples
### Always Cached
```typescript
  public getJoke(): Observable<any> {
    return CacheObserver(url, this.httpClient.get('https://api.chucknorris.io/jokes/random')}
  ```

### Fast and Fresh
Return cached data but also get fresh data and return that too.
  ```typescript
  public getJoke(): Observable<any> {
    return CacheObserver(url, this.httpClient.get('https://api.chucknorris.io/jokes/random'), { alwaysGetValue: true });
  }
  ```

### Cache for 30 seconds
Return cached data if not requested in 30 seconds.
  ```typescript
  public getJoke(): Observable<any> {
    return CacheObserver(url, this.httpClient.get('https://api.chucknorris.io/jokes/random'), { expiresMs: 30000 });
  }
  ```