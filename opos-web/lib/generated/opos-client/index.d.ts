
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Question
 * 
 */
export type Question = $Result.DefaultSelection<Prisma.$QuestionPayload>
/**
 * Model Option
 * 
 */
export type Option = $Result.DefaultSelection<Prisma.$OptionPayload>
/**
 * Model CaseStudy
 * 
 */
export type CaseStudy = $Result.DefaultSelection<Prisma.$CaseStudyPayload>
/**
 * Model ImportBatch
 * 
 */
export type ImportBatch = $Result.DefaultSelection<Prisma.$ImportBatchPayload>
/**
 * Model ImportBatchQuestion
 * 
 */
export type ImportBatchQuestion = $Result.DefaultSelection<Prisma.$ImportBatchQuestionPayload>
/**
 * Model TestSession
 * 
 */
export type TestSession = $Result.DefaultSelection<Prisma.$TestSessionPayload>
/**
 * Model TestAnswer
 * 
 */
export type TestAnswer = $Result.DefaultSelection<Prisma.$TestAnswerPayload>
/**
 * Model ReviewQueue
 * 
 */
export type ReviewQueue = $Result.DefaultSelection<Prisma.$ReviewQueuePayload>
/**
 * Model Achievement
 * 
 */
export type Achievement = $Result.DefaultSelection<Prisma.$AchievementPayload>
/**
 * Model UserProgress
 * 
 */
export type UserProgress = $Result.DefaultSelection<Prisma.$UserProgressPayload>
/**
 * Model AppSettings
 * 
 */
export type AppSettings = $Result.DefaultSelection<Prisma.$AppSettingsPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Questions
 * const questions = await prisma.question.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Questions
   * const questions = await prisma.question.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.question`: Exposes CRUD operations for the **Question** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Questions
    * const questions = await prisma.question.findMany()
    * ```
    */
  get question(): Prisma.QuestionDelegate<ExtArgs>;

  /**
   * `prisma.option`: Exposes CRUD operations for the **Option** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Options
    * const options = await prisma.option.findMany()
    * ```
    */
  get option(): Prisma.OptionDelegate<ExtArgs>;

  /**
   * `prisma.caseStudy`: Exposes CRUD operations for the **CaseStudy** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CaseStudies
    * const caseStudies = await prisma.caseStudy.findMany()
    * ```
    */
  get caseStudy(): Prisma.CaseStudyDelegate<ExtArgs>;

  /**
   * `prisma.importBatch`: Exposes CRUD operations for the **ImportBatch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ImportBatches
    * const importBatches = await prisma.importBatch.findMany()
    * ```
    */
  get importBatch(): Prisma.ImportBatchDelegate<ExtArgs>;

  /**
   * `prisma.importBatchQuestion`: Exposes CRUD operations for the **ImportBatchQuestion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ImportBatchQuestions
    * const importBatchQuestions = await prisma.importBatchQuestion.findMany()
    * ```
    */
  get importBatchQuestion(): Prisma.ImportBatchQuestionDelegate<ExtArgs>;

  /**
   * `prisma.testSession`: Exposes CRUD operations for the **TestSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TestSessions
    * const testSessions = await prisma.testSession.findMany()
    * ```
    */
  get testSession(): Prisma.TestSessionDelegate<ExtArgs>;

  /**
   * `prisma.testAnswer`: Exposes CRUD operations for the **TestAnswer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TestAnswers
    * const testAnswers = await prisma.testAnswer.findMany()
    * ```
    */
  get testAnswer(): Prisma.TestAnswerDelegate<ExtArgs>;

  /**
   * `prisma.reviewQueue`: Exposes CRUD operations for the **ReviewQueue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReviewQueues
    * const reviewQueues = await prisma.reviewQueue.findMany()
    * ```
    */
  get reviewQueue(): Prisma.ReviewQueueDelegate<ExtArgs>;

  /**
   * `prisma.achievement`: Exposes CRUD operations for the **Achievement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Achievements
    * const achievements = await prisma.achievement.findMany()
    * ```
    */
  get achievement(): Prisma.AchievementDelegate<ExtArgs>;

  /**
   * `prisma.userProgress`: Exposes CRUD operations for the **UserProgress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProgresses
    * const userProgresses = await prisma.userProgress.findMany()
    * ```
    */
  get userProgress(): Prisma.UserProgressDelegate<ExtArgs>;

  /**
   * `prisma.appSettings`: Exposes CRUD operations for the **AppSettings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppSettings
    * const appSettings = await prisma.appSettings.findMany()
    * ```
    */
  get appSettings(): Prisma.AppSettingsDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Question: 'Question',
    Option: 'Option',
    CaseStudy: 'CaseStudy',
    ImportBatch: 'ImportBatch',
    ImportBatchQuestion: 'ImportBatchQuestion',
    TestSession: 'TestSession',
    TestAnswer: 'TestAnswer',
    ReviewQueue: 'ReviewQueue',
    Achievement: 'Achievement',
    UserProgress: 'UserProgress',
    AppSettings: 'AppSettings'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "question" | "option" | "caseStudy" | "importBatch" | "importBatchQuestion" | "testSession" | "testAnswer" | "reviewQueue" | "achievement" | "userProgress" | "appSettings"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Question: {
        payload: Prisma.$QuestionPayload<ExtArgs>
        fields: Prisma.QuestionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.QuestionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.QuestionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          findFirst: {
            args: Prisma.QuestionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.QuestionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          findMany: {
            args: Prisma.QuestionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>[]
          }
          create: {
            args: Prisma.QuestionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          createMany: {
            args: Prisma.QuestionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.QuestionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>[]
          }
          delete: {
            args: Prisma.QuestionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          update: {
            args: Prisma.QuestionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          deleteMany: {
            args: Prisma.QuestionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.QuestionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.QuestionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          aggregate: {
            args: Prisma.QuestionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateQuestion>
          }
          groupBy: {
            args: Prisma.QuestionGroupByArgs<ExtArgs>
            result: $Utils.Optional<QuestionGroupByOutputType>[]
          }
          count: {
            args: Prisma.QuestionCountArgs<ExtArgs>
            result: $Utils.Optional<QuestionCountAggregateOutputType> | number
          }
        }
      }
      Option: {
        payload: Prisma.$OptionPayload<ExtArgs>
        fields: Prisma.OptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>
          }
          findFirst: {
            args: Prisma.OptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>
          }
          findMany: {
            args: Prisma.OptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>[]
          }
          create: {
            args: Prisma.OptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>
          }
          createMany: {
            args: Prisma.OptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>[]
          }
          delete: {
            args: Prisma.OptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>
          }
          update: {
            args: Prisma.OptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>
          }
          deleteMany: {
            args: Prisma.OptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OptionPayload>
          }
          aggregate: {
            args: Prisma.OptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOption>
          }
          groupBy: {
            args: Prisma.OptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<OptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.OptionCountArgs<ExtArgs>
            result: $Utils.Optional<OptionCountAggregateOutputType> | number
          }
        }
      }
      CaseStudy: {
        payload: Prisma.$CaseStudyPayload<ExtArgs>
        fields: Prisma.CaseStudyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CaseStudyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CaseStudyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>
          }
          findFirst: {
            args: Prisma.CaseStudyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CaseStudyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>
          }
          findMany: {
            args: Prisma.CaseStudyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>[]
          }
          create: {
            args: Prisma.CaseStudyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>
          }
          createMany: {
            args: Prisma.CaseStudyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CaseStudyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>[]
          }
          delete: {
            args: Prisma.CaseStudyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>
          }
          update: {
            args: Prisma.CaseStudyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>
          }
          deleteMany: {
            args: Prisma.CaseStudyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CaseStudyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CaseStudyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CaseStudyPayload>
          }
          aggregate: {
            args: Prisma.CaseStudyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCaseStudy>
          }
          groupBy: {
            args: Prisma.CaseStudyGroupByArgs<ExtArgs>
            result: $Utils.Optional<CaseStudyGroupByOutputType>[]
          }
          count: {
            args: Prisma.CaseStudyCountArgs<ExtArgs>
            result: $Utils.Optional<CaseStudyCountAggregateOutputType> | number
          }
        }
      }
      ImportBatch: {
        payload: Prisma.$ImportBatchPayload<ExtArgs>
        fields: Prisma.ImportBatchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ImportBatchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ImportBatchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>
          }
          findFirst: {
            args: Prisma.ImportBatchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ImportBatchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>
          }
          findMany: {
            args: Prisma.ImportBatchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>[]
          }
          create: {
            args: Prisma.ImportBatchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>
          }
          createMany: {
            args: Prisma.ImportBatchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ImportBatchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>[]
          }
          delete: {
            args: Prisma.ImportBatchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>
          }
          update: {
            args: Prisma.ImportBatchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>
          }
          deleteMany: {
            args: Prisma.ImportBatchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ImportBatchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ImportBatchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchPayload>
          }
          aggregate: {
            args: Prisma.ImportBatchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateImportBatch>
          }
          groupBy: {
            args: Prisma.ImportBatchGroupByArgs<ExtArgs>
            result: $Utils.Optional<ImportBatchGroupByOutputType>[]
          }
          count: {
            args: Prisma.ImportBatchCountArgs<ExtArgs>
            result: $Utils.Optional<ImportBatchCountAggregateOutputType> | number
          }
        }
      }
      ImportBatchQuestion: {
        payload: Prisma.$ImportBatchQuestionPayload<ExtArgs>
        fields: Prisma.ImportBatchQuestionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ImportBatchQuestionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ImportBatchQuestionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>
          }
          findFirst: {
            args: Prisma.ImportBatchQuestionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ImportBatchQuestionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>
          }
          findMany: {
            args: Prisma.ImportBatchQuestionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>[]
          }
          create: {
            args: Prisma.ImportBatchQuestionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>
          }
          createMany: {
            args: Prisma.ImportBatchQuestionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ImportBatchQuestionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>[]
          }
          delete: {
            args: Prisma.ImportBatchQuestionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>
          }
          update: {
            args: Prisma.ImportBatchQuestionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>
          }
          deleteMany: {
            args: Prisma.ImportBatchQuestionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ImportBatchQuestionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ImportBatchQuestionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportBatchQuestionPayload>
          }
          aggregate: {
            args: Prisma.ImportBatchQuestionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateImportBatchQuestion>
          }
          groupBy: {
            args: Prisma.ImportBatchQuestionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ImportBatchQuestionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ImportBatchQuestionCountArgs<ExtArgs>
            result: $Utils.Optional<ImportBatchQuestionCountAggregateOutputType> | number
          }
        }
      }
      TestSession: {
        payload: Prisma.$TestSessionPayload<ExtArgs>
        fields: Prisma.TestSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TestSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TestSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>
          }
          findFirst: {
            args: Prisma.TestSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TestSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>
          }
          findMany: {
            args: Prisma.TestSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>[]
          }
          create: {
            args: Prisma.TestSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>
          }
          createMany: {
            args: Prisma.TestSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TestSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>[]
          }
          delete: {
            args: Prisma.TestSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>
          }
          update: {
            args: Prisma.TestSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>
          }
          deleteMany: {
            args: Prisma.TestSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TestSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TestSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSessionPayload>
          }
          aggregate: {
            args: Prisma.TestSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTestSession>
          }
          groupBy: {
            args: Prisma.TestSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TestSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TestSessionCountArgs<ExtArgs>
            result: $Utils.Optional<TestSessionCountAggregateOutputType> | number
          }
        }
      }
      TestAnswer: {
        payload: Prisma.$TestAnswerPayload<ExtArgs>
        fields: Prisma.TestAnswerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TestAnswerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TestAnswerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>
          }
          findFirst: {
            args: Prisma.TestAnswerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TestAnswerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>
          }
          findMany: {
            args: Prisma.TestAnswerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>[]
          }
          create: {
            args: Prisma.TestAnswerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>
          }
          createMany: {
            args: Prisma.TestAnswerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TestAnswerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>[]
          }
          delete: {
            args: Prisma.TestAnswerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>
          }
          update: {
            args: Prisma.TestAnswerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>
          }
          deleteMany: {
            args: Prisma.TestAnswerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TestAnswerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TestAnswerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestAnswerPayload>
          }
          aggregate: {
            args: Prisma.TestAnswerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTestAnswer>
          }
          groupBy: {
            args: Prisma.TestAnswerGroupByArgs<ExtArgs>
            result: $Utils.Optional<TestAnswerGroupByOutputType>[]
          }
          count: {
            args: Prisma.TestAnswerCountArgs<ExtArgs>
            result: $Utils.Optional<TestAnswerCountAggregateOutputType> | number
          }
        }
      }
      ReviewQueue: {
        payload: Prisma.$ReviewQueuePayload<ExtArgs>
        fields: Prisma.ReviewQueueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReviewQueueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReviewQueueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>
          }
          findFirst: {
            args: Prisma.ReviewQueueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReviewQueueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>
          }
          findMany: {
            args: Prisma.ReviewQueueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>[]
          }
          create: {
            args: Prisma.ReviewQueueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>
          }
          createMany: {
            args: Prisma.ReviewQueueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReviewQueueCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>[]
          }
          delete: {
            args: Prisma.ReviewQueueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>
          }
          update: {
            args: Prisma.ReviewQueueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>
          }
          deleteMany: {
            args: Prisma.ReviewQueueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReviewQueueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ReviewQueueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewQueuePayload>
          }
          aggregate: {
            args: Prisma.ReviewQueueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReviewQueue>
          }
          groupBy: {
            args: Prisma.ReviewQueueGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReviewQueueGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReviewQueueCountArgs<ExtArgs>
            result: $Utils.Optional<ReviewQueueCountAggregateOutputType> | number
          }
        }
      }
      Achievement: {
        payload: Prisma.$AchievementPayload<ExtArgs>
        fields: Prisma.AchievementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AchievementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AchievementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>
          }
          findFirst: {
            args: Prisma.AchievementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AchievementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>
          }
          findMany: {
            args: Prisma.AchievementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>[]
          }
          create: {
            args: Prisma.AchievementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>
          }
          createMany: {
            args: Prisma.AchievementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AchievementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>[]
          }
          delete: {
            args: Prisma.AchievementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>
          }
          update: {
            args: Prisma.AchievementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>
          }
          deleteMany: {
            args: Prisma.AchievementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AchievementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AchievementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AchievementPayload>
          }
          aggregate: {
            args: Prisma.AchievementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAchievement>
          }
          groupBy: {
            args: Prisma.AchievementGroupByArgs<ExtArgs>
            result: $Utils.Optional<AchievementGroupByOutputType>[]
          }
          count: {
            args: Prisma.AchievementCountArgs<ExtArgs>
            result: $Utils.Optional<AchievementCountAggregateOutputType> | number
          }
        }
      }
      UserProgress: {
        payload: Prisma.$UserProgressPayload<ExtArgs>
        fields: Prisma.UserProgressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProgressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProgressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          findFirst: {
            args: Prisma.UserProgressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProgressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          findMany: {
            args: Prisma.UserProgressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>[]
          }
          create: {
            args: Prisma.UserProgressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          createMany: {
            args: Prisma.UserProgressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProgressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>[]
          }
          delete: {
            args: Prisma.UserProgressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          update: {
            args: Prisma.UserProgressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          deleteMany: {
            args: Prisma.UserProgressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProgressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserProgressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          aggregate: {
            args: Prisma.UserProgressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProgress>
          }
          groupBy: {
            args: Prisma.UserProgressGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProgressGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProgressCountArgs<ExtArgs>
            result: $Utils.Optional<UserProgressCountAggregateOutputType> | number
          }
        }
      }
      AppSettings: {
        payload: Prisma.$AppSettingsPayload<ExtArgs>
        fields: Prisma.AppSettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppSettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppSettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          findFirst: {
            args: Prisma.AppSettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppSettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          findMany: {
            args: Prisma.AppSettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>[]
          }
          create: {
            args: Prisma.AppSettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          createMany: {
            args: Prisma.AppSettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppSettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>[]
          }
          delete: {
            args: Prisma.AppSettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          update: {
            args: Prisma.AppSettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          deleteMany: {
            args: Prisma.AppSettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppSettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AppSettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingsPayload>
          }
          aggregate: {
            args: Prisma.AppSettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppSettings>
          }
          groupBy: {
            args: Prisma.AppSettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppSettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppSettingsCountArgs<ExtArgs>
            result: $Utils.Optional<AppSettingsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type QuestionCountOutputType
   */

  export type QuestionCountOutputType = {
    options: number
    testAnswers: number
    importEvents: number
    progressSnapshots: number
  }

  export type QuestionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    options?: boolean | QuestionCountOutputTypeCountOptionsArgs
    testAnswers?: boolean | QuestionCountOutputTypeCountTestAnswersArgs
    importEvents?: boolean | QuestionCountOutputTypeCountImportEventsArgs
    progressSnapshots?: boolean | QuestionCountOutputTypeCountProgressSnapshotsArgs
  }

  // Custom InputTypes
  /**
   * QuestionCountOutputType without action
   */
  export type QuestionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionCountOutputType
     */
    select?: QuestionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * QuestionCountOutputType without action
   */
  export type QuestionCountOutputTypeCountOptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OptionWhereInput
  }

  /**
   * QuestionCountOutputType without action
   */
  export type QuestionCountOutputTypeCountTestAnswersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestAnswerWhereInput
  }

  /**
   * QuestionCountOutputType without action
   */
  export type QuestionCountOutputTypeCountImportEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ImportBatchQuestionWhereInput
  }

  /**
   * QuestionCountOutputType without action
   */
  export type QuestionCountOutputTypeCountProgressSnapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProgressWhereInput
  }


  /**
   * Count Type CaseStudyCountOutputType
   */

  export type CaseStudyCountOutputType = {
    questions: number
  }

  export type CaseStudyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questions?: boolean | CaseStudyCountOutputTypeCountQuestionsArgs
  }

  // Custom InputTypes
  /**
   * CaseStudyCountOutputType without action
   */
  export type CaseStudyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudyCountOutputType
     */
    select?: CaseStudyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CaseStudyCountOutputType without action
   */
  export type CaseStudyCountOutputTypeCountQuestionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QuestionWhereInput
  }


  /**
   * Count Type ImportBatchCountOutputType
   */

  export type ImportBatchCountOutputType = {
    items: number
  }

  export type ImportBatchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | ImportBatchCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * ImportBatchCountOutputType without action
   */
  export type ImportBatchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchCountOutputType
     */
    select?: ImportBatchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ImportBatchCountOutputType without action
   */
  export type ImportBatchCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ImportBatchQuestionWhereInput
  }


  /**
   * Count Type TestSessionCountOutputType
   */

  export type TestSessionCountOutputType = {
    answers: number
  }

  export type TestSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    answers?: boolean | TestSessionCountOutputTypeCountAnswersArgs
  }

  // Custom InputTypes
  /**
   * TestSessionCountOutputType without action
   */
  export type TestSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSessionCountOutputType
     */
    select?: TestSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TestSessionCountOutputType without action
   */
  export type TestSessionCountOutputTypeCountAnswersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestAnswerWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Question
   */

  export type AggregateQuestion = {
    _count: QuestionCountAggregateOutputType | null
    _avg: QuestionAvgAggregateOutputType | null
    _sum: QuestionSumAggregateOutputType | null
    _min: QuestionMinAggregateOutputType | null
    _max: QuestionMaxAggregateOutputType | null
  }

  export type QuestionAvgAggregateOutputType = {
    topicNumber: number | null
    reserveOrder: number | null
  }

  export type QuestionSumAggregateOutputType = {
    topicNumber: number | null
    reserveOrder: number | null
  }

  export type QuestionMinAggregateOutputType = {
    id: string | null
    externalId: string | null
    examPart: string | null
    examExercise: string | null
    topicNumber: number | null
    topicTitle: string | null
    section: string | null
    subsection: string | null
    questionType: string | null
    difficulty: string | null
    text: string | null
    explanation: string | null
    sourceDocument: string | null
    sourceReference: string | null
    tagsJson: string | null
    status: string | null
    isDemo: boolean | null
    isFavorite: boolean | null
    isDoubtful: boolean | null
    isArchived: boolean | null
    reserveOrder: number | null
    caseStudyId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QuestionMaxAggregateOutputType = {
    id: string | null
    externalId: string | null
    examPart: string | null
    examExercise: string | null
    topicNumber: number | null
    topicTitle: string | null
    section: string | null
    subsection: string | null
    questionType: string | null
    difficulty: string | null
    text: string | null
    explanation: string | null
    sourceDocument: string | null
    sourceReference: string | null
    tagsJson: string | null
    status: string | null
    isDemo: boolean | null
    isFavorite: boolean | null
    isDoubtful: boolean | null
    isArchived: boolean | null
    reserveOrder: number | null
    caseStudyId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QuestionCountAggregateOutputType = {
    id: number
    externalId: number
    examPart: number
    examExercise: number
    topicNumber: number
    topicTitle: number
    section: number
    subsection: number
    questionType: number
    difficulty: number
    text: number
    explanation: number
    sourceDocument: number
    sourceReference: number
    tagsJson: number
    status: number
    isDemo: number
    isFavorite: number
    isDoubtful: number
    isArchived: number
    reserveOrder: number
    caseStudyId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type QuestionAvgAggregateInputType = {
    topicNumber?: true
    reserveOrder?: true
  }

  export type QuestionSumAggregateInputType = {
    topicNumber?: true
    reserveOrder?: true
  }

  export type QuestionMinAggregateInputType = {
    id?: true
    externalId?: true
    examPart?: true
    examExercise?: true
    topicNumber?: true
    topicTitle?: true
    section?: true
    subsection?: true
    questionType?: true
    difficulty?: true
    text?: true
    explanation?: true
    sourceDocument?: true
    sourceReference?: true
    tagsJson?: true
    status?: true
    isDemo?: true
    isFavorite?: true
    isDoubtful?: true
    isArchived?: true
    reserveOrder?: true
    caseStudyId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QuestionMaxAggregateInputType = {
    id?: true
    externalId?: true
    examPart?: true
    examExercise?: true
    topicNumber?: true
    topicTitle?: true
    section?: true
    subsection?: true
    questionType?: true
    difficulty?: true
    text?: true
    explanation?: true
    sourceDocument?: true
    sourceReference?: true
    tagsJson?: true
    status?: true
    isDemo?: true
    isFavorite?: true
    isDoubtful?: true
    isArchived?: true
    reserveOrder?: true
    caseStudyId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QuestionCountAggregateInputType = {
    id?: true
    externalId?: true
    examPart?: true
    examExercise?: true
    topicNumber?: true
    topicTitle?: true
    section?: true
    subsection?: true
    questionType?: true
    difficulty?: true
    text?: true
    explanation?: true
    sourceDocument?: true
    sourceReference?: true
    tagsJson?: true
    status?: true
    isDemo?: true
    isFavorite?: true
    isDoubtful?: true
    isArchived?: true
    reserveOrder?: true
    caseStudyId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type QuestionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Question to aggregate.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Questions
    **/
    _count?: true | QuestionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: QuestionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: QuestionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: QuestionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: QuestionMaxAggregateInputType
  }

  export type GetQuestionAggregateType<T extends QuestionAggregateArgs> = {
        [P in keyof T & keyof AggregateQuestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateQuestion[P]>
      : GetScalarType<T[P], AggregateQuestion[P]>
  }




  export type QuestionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QuestionWhereInput
    orderBy?: QuestionOrderByWithAggregationInput | QuestionOrderByWithAggregationInput[]
    by: QuestionScalarFieldEnum[] | QuestionScalarFieldEnum
    having?: QuestionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: QuestionCountAggregateInputType | true
    _avg?: QuestionAvgAggregateInputType
    _sum?: QuestionSumAggregateInputType
    _min?: QuestionMinAggregateInputType
    _max?: QuestionMaxAggregateInputType
  }

  export type QuestionGroupByOutputType = {
    id: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection: string | null
    questionType: string
    difficulty: string
    text: string
    explanation: string | null
    sourceDocument: string | null
    sourceReference: string | null
    tagsJson: string
    status: string
    isDemo: boolean
    isFavorite: boolean
    isDoubtful: boolean
    isArchived: boolean
    reserveOrder: number | null
    caseStudyId: string | null
    createdAt: Date
    updatedAt: Date
    _count: QuestionCountAggregateOutputType | null
    _avg: QuestionAvgAggregateOutputType | null
    _sum: QuestionSumAggregateOutputType | null
    _min: QuestionMinAggregateOutputType | null
    _max: QuestionMaxAggregateOutputType | null
  }

  type GetQuestionGroupByPayload<T extends QuestionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<QuestionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof QuestionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], QuestionGroupByOutputType[P]>
            : GetScalarType<T[P], QuestionGroupByOutputType[P]>
        }
      >
    >


  export type QuestionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    externalId?: boolean
    examPart?: boolean
    examExercise?: boolean
    topicNumber?: boolean
    topicTitle?: boolean
    section?: boolean
    subsection?: boolean
    questionType?: boolean
    difficulty?: boolean
    text?: boolean
    explanation?: boolean
    sourceDocument?: boolean
    sourceReference?: boolean
    tagsJson?: boolean
    status?: boolean
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: boolean
    caseStudyId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    caseStudy?: boolean | Question$caseStudyArgs<ExtArgs>
    options?: boolean | Question$optionsArgs<ExtArgs>
    testAnswers?: boolean | Question$testAnswersArgs<ExtArgs>
    reviewQueue?: boolean | Question$reviewQueueArgs<ExtArgs>
    importEvents?: boolean | Question$importEventsArgs<ExtArgs>
    progressSnapshots?: boolean | Question$progressSnapshotsArgs<ExtArgs>
    _count?: boolean | QuestionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["question"]>

  export type QuestionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    externalId?: boolean
    examPart?: boolean
    examExercise?: boolean
    topicNumber?: boolean
    topicTitle?: boolean
    section?: boolean
    subsection?: boolean
    questionType?: boolean
    difficulty?: boolean
    text?: boolean
    explanation?: boolean
    sourceDocument?: boolean
    sourceReference?: boolean
    tagsJson?: boolean
    status?: boolean
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: boolean
    caseStudyId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    caseStudy?: boolean | Question$caseStudyArgs<ExtArgs>
  }, ExtArgs["result"]["question"]>

  export type QuestionSelectScalar = {
    id?: boolean
    externalId?: boolean
    examPart?: boolean
    examExercise?: boolean
    topicNumber?: boolean
    topicTitle?: boolean
    section?: boolean
    subsection?: boolean
    questionType?: boolean
    difficulty?: boolean
    text?: boolean
    explanation?: boolean
    sourceDocument?: boolean
    sourceReference?: boolean
    tagsJson?: boolean
    status?: boolean
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: boolean
    caseStudyId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type QuestionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    caseStudy?: boolean | Question$caseStudyArgs<ExtArgs>
    options?: boolean | Question$optionsArgs<ExtArgs>
    testAnswers?: boolean | Question$testAnswersArgs<ExtArgs>
    reviewQueue?: boolean | Question$reviewQueueArgs<ExtArgs>
    importEvents?: boolean | Question$importEventsArgs<ExtArgs>
    progressSnapshots?: boolean | Question$progressSnapshotsArgs<ExtArgs>
    _count?: boolean | QuestionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type QuestionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    caseStudy?: boolean | Question$caseStudyArgs<ExtArgs>
  }

  export type $QuestionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Question"
    objects: {
      caseStudy: Prisma.$CaseStudyPayload<ExtArgs> | null
      options: Prisma.$OptionPayload<ExtArgs>[]
      testAnswers: Prisma.$TestAnswerPayload<ExtArgs>[]
      reviewQueue: Prisma.$ReviewQueuePayload<ExtArgs> | null
      importEvents: Prisma.$ImportBatchQuestionPayload<ExtArgs>[]
      progressSnapshots: Prisma.$UserProgressPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      externalId: string
      examPart: string
      examExercise: string
      topicNumber: number
      topicTitle: string
      section: string
      subsection: string | null
      questionType: string
      difficulty: string
      text: string
      explanation: string | null
      sourceDocument: string | null
      sourceReference: string | null
      tagsJson: string
      status: string
      isDemo: boolean
      isFavorite: boolean
      isDoubtful: boolean
      isArchived: boolean
      reserveOrder: number | null
      caseStudyId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["question"]>
    composites: {}
  }

  type QuestionGetPayload<S extends boolean | null | undefined | QuestionDefaultArgs> = $Result.GetResult<Prisma.$QuestionPayload, S>

  type QuestionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<QuestionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: QuestionCountAggregateInputType | true
    }

  export interface QuestionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Question'], meta: { name: 'Question' } }
    /**
     * Find zero or one Question that matches the filter.
     * @param {QuestionFindUniqueArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QuestionFindUniqueArgs>(args: SelectSubset<T, QuestionFindUniqueArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Question that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {QuestionFindUniqueOrThrowArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QuestionFindUniqueOrThrowArgs>(args: SelectSubset<T, QuestionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Question that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionFindFirstArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QuestionFindFirstArgs>(args?: SelectSubset<T, QuestionFindFirstArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Question that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionFindFirstOrThrowArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QuestionFindFirstOrThrowArgs>(args?: SelectSubset<T, QuestionFindFirstOrThrowArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Questions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Questions
     * const questions = await prisma.question.findMany()
     * 
     * // Get first 10 Questions
     * const questions = await prisma.question.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const questionWithIdOnly = await prisma.question.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends QuestionFindManyArgs>(args?: SelectSubset<T, QuestionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Question.
     * @param {QuestionCreateArgs} args - Arguments to create a Question.
     * @example
     * // Create one Question
     * const Question = await prisma.question.create({
     *   data: {
     *     // ... data to create a Question
     *   }
     * })
     * 
     */
    create<T extends QuestionCreateArgs>(args: SelectSubset<T, QuestionCreateArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Questions.
     * @param {QuestionCreateManyArgs} args - Arguments to create many Questions.
     * @example
     * // Create many Questions
     * const question = await prisma.question.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends QuestionCreateManyArgs>(args?: SelectSubset<T, QuestionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Questions and returns the data saved in the database.
     * @param {QuestionCreateManyAndReturnArgs} args - Arguments to create many Questions.
     * @example
     * // Create many Questions
     * const question = await prisma.question.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Questions and only return the `id`
     * const questionWithIdOnly = await prisma.question.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends QuestionCreateManyAndReturnArgs>(args?: SelectSubset<T, QuestionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Question.
     * @param {QuestionDeleteArgs} args - Arguments to delete one Question.
     * @example
     * // Delete one Question
     * const Question = await prisma.question.delete({
     *   where: {
     *     // ... filter to delete one Question
     *   }
     * })
     * 
     */
    delete<T extends QuestionDeleteArgs>(args: SelectSubset<T, QuestionDeleteArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Question.
     * @param {QuestionUpdateArgs} args - Arguments to update one Question.
     * @example
     * // Update one Question
     * const question = await prisma.question.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends QuestionUpdateArgs>(args: SelectSubset<T, QuestionUpdateArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Questions.
     * @param {QuestionDeleteManyArgs} args - Arguments to filter Questions to delete.
     * @example
     * // Delete a few Questions
     * const { count } = await prisma.question.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends QuestionDeleteManyArgs>(args?: SelectSubset<T, QuestionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Questions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Questions
     * const question = await prisma.question.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends QuestionUpdateManyArgs>(args: SelectSubset<T, QuestionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Question.
     * @param {QuestionUpsertArgs} args - Arguments to update or create a Question.
     * @example
     * // Update or create a Question
     * const question = await prisma.question.upsert({
     *   create: {
     *     // ... data to create a Question
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Question we want to update
     *   }
     * })
     */
    upsert<T extends QuestionUpsertArgs>(args: SelectSubset<T, QuestionUpsertArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Questions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionCountArgs} args - Arguments to filter Questions to count.
     * @example
     * // Count the number of Questions
     * const count = await prisma.question.count({
     *   where: {
     *     // ... the filter for the Questions we want to count
     *   }
     * })
    **/
    count<T extends QuestionCountArgs>(
      args?: Subset<T, QuestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], QuestionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Question.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends QuestionAggregateArgs>(args: Subset<T, QuestionAggregateArgs>): Prisma.PrismaPromise<GetQuestionAggregateType<T>>

    /**
     * Group by Question.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends QuestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: QuestionGroupByArgs['orderBy'] }
        : { orderBy?: QuestionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, QuestionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQuestionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Question model
   */
  readonly fields: QuestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Question.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__QuestionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    caseStudy<T extends Question$caseStudyArgs<ExtArgs> = {}>(args?: Subset<T, Question$caseStudyArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    options<T extends Question$optionsArgs<ExtArgs> = {}>(args?: Subset<T, Question$optionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "findMany"> | Null>
    testAnswers<T extends Question$testAnswersArgs<ExtArgs> = {}>(args?: Subset<T, Question$testAnswersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "findMany"> | Null>
    reviewQueue<T extends Question$reviewQueueArgs<ExtArgs> = {}>(args?: Subset<T, Question$reviewQueueArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    importEvents<T extends Question$importEventsArgs<ExtArgs> = {}>(args?: Subset<T, Question$importEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "findMany"> | Null>
    progressSnapshots<T extends Question$progressSnapshotsArgs<ExtArgs> = {}>(args?: Subset<T, Question$progressSnapshotsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Question model
   */ 
  interface QuestionFieldRefs {
    readonly id: FieldRef<"Question", 'String'>
    readonly externalId: FieldRef<"Question", 'String'>
    readonly examPart: FieldRef<"Question", 'String'>
    readonly examExercise: FieldRef<"Question", 'String'>
    readonly topicNumber: FieldRef<"Question", 'Int'>
    readonly topicTitle: FieldRef<"Question", 'String'>
    readonly section: FieldRef<"Question", 'String'>
    readonly subsection: FieldRef<"Question", 'String'>
    readonly questionType: FieldRef<"Question", 'String'>
    readonly difficulty: FieldRef<"Question", 'String'>
    readonly text: FieldRef<"Question", 'String'>
    readonly explanation: FieldRef<"Question", 'String'>
    readonly sourceDocument: FieldRef<"Question", 'String'>
    readonly sourceReference: FieldRef<"Question", 'String'>
    readonly tagsJson: FieldRef<"Question", 'String'>
    readonly status: FieldRef<"Question", 'String'>
    readonly isDemo: FieldRef<"Question", 'Boolean'>
    readonly isFavorite: FieldRef<"Question", 'Boolean'>
    readonly isDoubtful: FieldRef<"Question", 'Boolean'>
    readonly isArchived: FieldRef<"Question", 'Boolean'>
    readonly reserveOrder: FieldRef<"Question", 'Int'>
    readonly caseStudyId: FieldRef<"Question", 'String'>
    readonly createdAt: FieldRef<"Question", 'DateTime'>
    readonly updatedAt: FieldRef<"Question", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Question findUnique
   */
  export type QuestionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question findUniqueOrThrow
   */
  export type QuestionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question findFirst
   */
  export type QuestionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Questions.
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Questions.
     */
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * Question findFirstOrThrow
   */
  export type QuestionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Questions.
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Questions.
     */
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * Question findMany
   */
  export type QuestionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Questions to fetch.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Questions.
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * Question create
   */
  export type QuestionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * The data needed to create a Question.
     */
    data: XOR<QuestionCreateInput, QuestionUncheckedCreateInput>
  }

  /**
   * Question createMany
   */
  export type QuestionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Questions.
     */
    data: QuestionCreateManyInput | QuestionCreateManyInput[]
  }

  /**
   * Question createManyAndReturn
   */
  export type QuestionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Questions.
     */
    data: QuestionCreateManyInput | QuestionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Question update
   */
  export type QuestionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * The data needed to update a Question.
     */
    data: XOR<QuestionUpdateInput, QuestionUncheckedUpdateInput>
    /**
     * Choose, which Question to update.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question updateMany
   */
  export type QuestionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Questions.
     */
    data: XOR<QuestionUpdateManyMutationInput, QuestionUncheckedUpdateManyInput>
    /**
     * Filter which Questions to update
     */
    where?: QuestionWhereInput
  }

  /**
   * Question upsert
   */
  export type QuestionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * The filter to search for the Question to update in case it exists.
     */
    where: QuestionWhereUniqueInput
    /**
     * In case the Question found by the `where` argument doesn't exist, create a new Question with this data.
     */
    create: XOR<QuestionCreateInput, QuestionUncheckedCreateInput>
    /**
     * In case the Question was found with the provided `where` argument, update it with this data.
     */
    update: XOR<QuestionUpdateInput, QuestionUncheckedUpdateInput>
  }

  /**
   * Question delete
   */
  export type QuestionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter which Question to delete.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question deleteMany
   */
  export type QuestionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Questions to delete
     */
    where?: QuestionWhereInput
  }

  /**
   * Question.caseStudy
   */
  export type Question$caseStudyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    where?: CaseStudyWhereInput
  }

  /**
   * Question.options
   */
  export type Question$optionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    where?: OptionWhereInput
    orderBy?: OptionOrderByWithRelationInput | OptionOrderByWithRelationInput[]
    cursor?: OptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OptionScalarFieldEnum | OptionScalarFieldEnum[]
  }

  /**
   * Question.testAnswers
   */
  export type Question$testAnswersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    where?: TestAnswerWhereInput
    orderBy?: TestAnswerOrderByWithRelationInput | TestAnswerOrderByWithRelationInput[]
    cursor?: TestAnswerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TestAnswerScalarFieldEnum | TestAnswerScalarFieldEnum[]
  }

  /**
   * Question.reviewQueue
   */
  export type Question$reviewQueueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    where?: ReviewQueueWhereInput
  }

  /**
   * Question.importEvents
   */
  export type Question$importEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    where?: ImportBatchQuestionWhereInput
    orderBy?: ImportBatchQuestionOrderByWithRelationInput | ImportBatchQuestionOrderByWithRelationInput[]
    cursor?: ImportBatchQuestionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ImportBatchQuestionScalarFieldEnum | ImportBatchQuestionScalarFieldEnum[]
  }

  /**
   * Question.progressSnapshots
   */
  export type Question$progressSnapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    where?: UserProgressWhereInput
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    cursor?: UserProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * Question without action
   */
  export type QuestionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
  }


  /**
   * Model Option
   */

  export type AggregateOption = {
    _count: OptionCountAggregateOutputType | null
    _min: OptionMinAggregateOutputType | null
    _max: OptionMaxAggregateOutputType | null
  }

  export type OptionMinAggregateOutputType = {
    id: string | null
    questionId: string | null
    label: string | null
    text: string | null
    isCorrect: boolean | null
    explanation: string | null
  }

  export type OptionMaxAggregateOutputType = {
    id: string | null
    questionId: string | null
    label: string | null
    text: string | null
    isCorrect: boolean | null
    explanation: string | null
  }

  export type OptionCountAggregateOutputType = {
    id: number
    questionId: number
    label: number
    text: number
    isCorrect: number
    explanation: number
    _all: number
  }


  export type OptionMinAggregateInputType = {
    id?: true
    questionId?: true
    label?: true
    text?: true
    isCorrect?: true
    explanation?: true
  }

  export type OptionMaxAggregateInputType = {
    id?: true
    questionId?: true
    label?: true
    text?: true
    isCorrect?: true
    explanation?: true
  }

  export type OptionCountAggregateInputType = {
    id?: true
    questionId?: true
    label?: true
    text?: true
    isCorrect?: true
    explanation?: true
    _all?: true
  }

  export type OptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Option to aggregate.
     */
    where?: OptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Options to fetch.
     */
    orderBy?: OptionOrderByWithRelationInput | OptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Options from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Options.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Options
    **/
    _count?: true | OptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OptionMaxAggregateInputType
  }

  export type GetOptionAggregateType<T extends OptionAggregateArgs> = {
        [P in keyof T & keyof AggregateOption]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOption[P]>
      : GetScalarType<T[P], AggregateOption[P]>
  }




  export type OptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OptionWhereInput
    orderBy?: OptionOrderByWithAggregationInput | OptionOrderByWithAggregationInput[]
    by: OptionScalarFieldEnum[] | OptionScalarFieldEnum
    having?: OptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OptionCountAggregateInputType | true
    _min?: OptionMinAggregateInputType
    _max?: OptionMaxAggregateInputType
  }

  export type OptionGroupByOutputType = {
    id: string
    questionId: string
    label: string
    text: string
    isCorrect: boolean
    explanation: string | null
    _count: OptionCountAggregateOutputType | null
    _min: OptionMinAggregateOutputType | null
    _max: OptionMaxAggregateOutputType | null
  }

  type GetOptionGroupByPayload<T extends OptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OptionGroupByOutputType[P]>
            : GetScalarType<T[P], OptionGroupByOutputType[P]>
        }
      >
    >


  export type OptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    questionId?: boolean
    label?: boolean
    text?: boolean
    isCorrect?: boolean
    explanation?: boolean
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["option"]>

  export type OptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    questionId?: boolean
    label?: boolean
    text?: boolean
    isCorrect?: boolean
    explanation?: boolean
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["option"]>

  export type OptionSelectScalar = {
    id?: boolean
    questionId?: boolean
    label?: boolean
    text?: boolean
    isCorrect?: boolean
    explanation?: boolean
  }

  export type OptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }
  export type OptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }

  export type $OptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Option"
    objects: {
      question: Prisma.$QuestionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      questionId: string
      label: string
      text: string
      isCorrect: boolean
      explanation: string | null
    }, ExtArgs["result"]["option"]>
    composites: {}
  }

  type OptionGetPayload<S extends boolean | null | undefined | OptionDefaultArgs> = $Result.GetResult<Prisma.$OptionPayload, S>

  type OptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OptionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OptionCountAggregateInputType | true
    }

  export interface OptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Option'], meta: { name: 'Option' } }
    /**
     * Find zero or one Option that matches the filter.
     * @param {OptionFindUniqueArgs} args - Arguments to find a Option
     * @example
     * // Get one Option
     * const option = await prisma.option.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OptionFindUniqueArgs>(args: SelectSubset<T, OptionFindUniqueArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Option that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OptionFindUniqueOrThrowArgs} args - Arguments to find a Option
     * @example
     * // Get one Option
     * const option = await prisma.option.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OptionFindUniqueOrThrowArgs>(args: SelectSubset<T, OptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Option that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionFindFirstArgs} args - Arguments to find a Option
     * @example
     * // Get one Option
     * const option = await prisma.option.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OptionFindFirstArgs>(args?: SelectSubset<T, OptionFindFirstArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Option that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionFindFirstOrThrowArgs} args - Arguments to find a Option
     * @example
     * // Get one Option
     * const option = await prisma.option.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OptionFindFirstOrThrowArgs>(args?: SelectSubset<T, OptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Options that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Options
     * const options = await prisma.option.findMany()
     * 
     * // Get first 10 Options
     * const options = await prisma.option.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const optionWithIdOnly = await prisma.option.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OptionFindManyArgs>(args?: SelectSubset<T, OptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Option.
     * @param {OptionCreateArgs} args - Arguments to create a Option.
     * @example
     * // Create one Option
     * const Option = await prisma.option.create({
     *   data: {
     *     // ... data to create a Option
     *   }
     * })
     * 
     */
    create<T extends OptionCreateArgs>(args: SelectSubset<T, OptionCreateArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Options.
     * @param {OptionCreateManyArgs} args - Arguments to create many Options.
     * @example
     * // Create many Options
     * const option = await prisma.option.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OptionCreateManyArgs>(args?: SelectSubset<T, OptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Options and returns the data saved in the database.
     * @param {OptionCreateManyAndReturnArgs} args - Arguments to create many Options.
     * @example
     * // Create many Options
     * const option = await prisma.option.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Options and only return the `id`
     * const optionWithIdOnly = await prisma.option.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OptionCreateManyAndReturnArgs>(args?: SelectSubset<T, OptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Option.
     * @param {OptionDeleteArgs} args - Arguments to delete one Option.
     * @example
     * // Delete one Option
     * const Option = await prisma.option.delete({
     *   where: {
     *     // ... filter to delete one Option
     *   }
     * })
     * 
     */
    delete<T extends OptionDeleteArgs>(args: SelectSubset<T, OptionDeleteArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Option.
     * @param {OptionUpdateArgs} args - Arguments to update one Option.
     * @example
     * // Update one Option
     * const option = await prisma.option.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OptionUpdateArgs>(args: SelectSubset<T, OptionUpdateArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Options.
     * @param {OptionDeleteManyArgs} args - Arguments to filter Options to delete.
     * @example
     * // Delete a few Options
     * const { count } = await prisma.option.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OptionDeleteManyArgs>(args?: SelectSubset<T, OptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Options.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Options
     * const option = await prisma.option.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OptionUpdateManyArgs>(args: SelectSubset<T, OptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Option.
     * @param {OptionUpsertArgs} args - Arguments to update or create a Option.
     * @example
     * // Update or create a Option
     * const option = await prisma.option.upsert({
     *   create: {
     *     // ... data to create a Option
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Option we want to update
     *   }
     * })
     */
    upsert<T extends OptionUpsertArgs>(args: SelectSubset<T, OptionUpsertArgs<ExtArgs>>): Prisma__OptionClient<$Result.GetResult<Prisma.$OptionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Options.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionCountArgs} args - Arguments to filter Options to count.
     * @example
     * // Count the number of Options
     * const count = await prisma.option.count({
     *   where: {
     *     // ... the filter for the Options we want to count
     *   }
     * })
    **/
    count<T extends OptionCountArgs>(
      args?: Subset<T, OptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Option.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OptionAggregateArgs>(args: Subset<T, OptionAggregateArgs>): Prisma.PrismaPromise<GetOptionAggregateType<T>>

    /**
     * Group by Option.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OptionGroupByArgs['orderBy'] }
        : { orderBy?: OptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Option model
   */
  readonly fields: OptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Option.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    question<T extends QuestionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, QuestionDefaultArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Option model
   */ 
  interface OptionFieldRefs {
    readonly id: FieldRef<"Option", 'String'>
    readonly questionId: FieldRef<"Option", 'String'>
    readonly label: FieldRef<"Option", 'String'>
    readonly text: FieldRef<"Option", 'String'>
    readonly isCorrect: FieldRef<"Option", 'Boolean'>
    readonly explanation: FieldRef<"Option", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Option findUnique
   */
  export type OptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * Filter, which Option to fetch.
     */
    where: OptionWhereUniqueInput
  }

  /**
   * Option findUniqueOrThrow
   */
  export type OptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * Filter, which Option to fetch.
     */
    where: OptionWhereUniqueInput
  }

  /**
   * Option findFirst
   */
  export type OptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * Filter, which Option to fetch.
     */
    where?: OptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Options to fetch.
     */
    orderBy?: OptionOrderByWithRelationInput | OptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Options.
     */
    cursor?: OptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Options from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Options.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Options.
     */
    distinct?: OptionScalarFieldEnum | OptionScalarFieldEnum[]
  }

  /**
   * Option findFirstOrThrow
   */
  export type OptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * Filter, which Option to fetch.
     */
    where?: OptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Options to fetch.
     */
    orderBy?: OptionOrderByWithRelationInput | OptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Options.
     */
    cursor?: OptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Options from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Options.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Options.
     */
    distinct?: OptionScalarFieldEnum | OptionScalarFieldEnum[]
  }

  /**
   * Option findMany
   */
  export type OptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * Filter, which Options to fetch.
     */
    where?: OptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Options to fetch.
     */
    orderBy?: OptionOrderByWithRelationInput | OptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Options.
     */
    cursor?: OptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Options from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Options.
     */
    skip?: number
    distinct?: OptionScalarFieldEnum | OptionScalarFieldEnum[]
  }

  /**
   * Option create
   */
  export type OptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * The data needed to create a Option.
     */
    data: XOR<OptionCreateInput, OptionUncheckedCreateInput>
  }

  /**
   * Option createMany
   */
  export type OptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Options.
     */
    data: OptionCreateManyInput | OptionCreateManyInput[]
  }

  /**
   * Option createManyAndReturn
   */
  export type OptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Options.
     */
    data: OptionCreateManyInput | OptionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Option update
   */
  export type OptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * The data needed to update a Option.
     */
    data: XOR<OptionUpdateInput, OptionUncheckedUpdateInput>
    /**
     * Choose, which Option to update.
     */
    where: OptionWhereUniqueInput
  }

  /**
   * Option updateMany
   */
  export type OptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Options.
     */
    data: XOR<OptionUpdateManyMutationInput, OptionUncheckedUpdateManyInput>
    /**
     * Filter which Options to update
     */
    where?: OptionWhereInput
  }

  /**
   * Option upsert
   */
  export type OptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * The filter to search for the Option to update in case it exists.
     */
    where: OptionWhereUniqueInput
    /**
     * In case the Option found by the `where` argument doesn't exist, create a new Option with this data.
     */
    create: XOR<OptionCreateInput, OptionUncheckedCreateInput>
    /**
     * In case the Option was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OptionUpdateInput, OptionUncheckedUpdateInput>
  }

  /**
   * Option delete
   */
  export type OptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
    /**
     * Filter which Option to delete.
     */
    where: OptionWhereUniqueInput
  }

  /**
   * Option deleteMany
   */
  export type OptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Options to delete
     */
    where?: OptionWhereInput
  }

  /**
   * Option without action
   */
  export type OptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Option
     */
    select?: OptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OptionInclude<ExtArgs> | null
  }


  /**
   * Model CaseStudy
   */

  export type AggregateCaseStudy = {
    _count: CaseStudyCountAggregateOutputType | null
    _avg: CaseStudyAvgAggregateOutputType | null
    _sum: CaseStudySumAggregateOutputType | null
    _min: CaseStudyMinAggregateOutputType | null
    _max: CaseStudyMaxAggregateOutputType | null
  }

  export type CaseStudyAvgAggregateOutputType = {
    topicNumber: number | null
  }

  export type CaseStudySumAggregateOutputType = {
    topicNumber: number | null
  }

  export type CaseStudyMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    topicNumber: number | null
    section: string | null
    source: string | null
  }

  export type CaseStudyMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    topicNumber: number | null
    section: string | null
    source: string | null
  }

  export type CaseStudyCountAggregateOutputType = {
    id: number
    title: number
    description: number
    topicNumber: number
    section: number
    source: number
    _all: number
  }


  export type CaseStudyAvgAggregateInputType = {
    topicNumber?: true
  }

  export type CaseStudySumAggregateInputType = {
    topicNumber?: true
  }

  export type CaseStudyMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    topicNumber?: true
    section?: true
    source?: true
  }

  export type CaseStudyMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    topicNumber?: true
    section?: true
    source?: true
  }

  export type CaseStudyCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    topicNumber?: true
    section?: true
    source?: true
    _all?: true
  }

  export type CaseStudyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CaseStudy to aggregate.
     */
    where?: CaseStudyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseStudies to fetch.
     */
    orderBy?: CaseStudyOrderByWithRelationInput | CaseStudyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CaseStudyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseStudies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseStudies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CaseStudies
    **/
    _count?: true | CaseStudyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CaseStudyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CaseStudySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CaseStudyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CaseStudyMaxAggregateInputType
  }

  export type GetCaseStudyAggregateType<T extends CaseStudyAggregateArgs> = {
        [P in keyof T & keyof AggregateCaseStudy]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCaseStudy[P]>
      : GetScalarType<T[P], AggregateCaseStudy[P]>
  }




  export type CaseStudyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CaseStudyWhereInput
    orderBy?: CaseStudyOrderByWithAggregationInput | CaseStudyOrderByWithAggregationInput[]
    by: CaseStudyScalarFieldEnum[] | CaseStudyScalarFieldEnum
    having?: CaseStudyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CaseStudyCountAggregateInputType | true
    _avg?: CaseStudyAvgAggregateInputType
    _sum?: CaseStudySumAggregateInputType
    _min?: CaseStudyMinAggregateInputType
    _max?: CaseStudyMaxAggregateInputType
  }

  export type CaseStudyGroupByOutputType = {
    id: string
    title: string
    description: string | null
    topicNumber: number | null
    section: string | null
    source: string | null
    _count: CaseStudyCountAggregateOutputType | null
    _avg: CaseStudyAvgAggregateOutputType | null
    _sum: CaseStudySumAggregateOutputType | null
    _min: CaseStudyMinAggregateOutputType | null
    _max: CaseStudyMaxAggregateOutputType | null
  }

  type GetCaseStudyGroupByPayload<T extends CaseStudyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CaseStudyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CaseStudyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CaseStudyGroupByOutputType[P]>
            : GetScalarType<T[P], CaseStudyGroupByOutputType[P]>
        }
      >
    >


  export type CaseStudySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    topicNumber?: boolean
    section?: boolean
    source?: boolean
    questions?: boolean | CaseStudy$questionsArgs<ExtArgs>
    _count?: boolean | CaseStudyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["caseStudy"]>

  export type CaseStudySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    topicNumber?: boolean
    section?: boolean
    source?: boolean
  }, ExtArgs["result"]["caseStudy"]>

  export type CaseStudySelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    topicNumber?: boolean
    section?: boolean
    source?: boolean
  }

  export type CaseStudyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questions?: boolean | CaseStudy$questionsArgs<ExtArgs>
    _count?: boolean | CaseStudyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CaseStudyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CaseStudyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CaseStudy"
    objects: {
      questions: Prisma.$QuestionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string | null
      topicNumber: number | null
      section: string | null
      source: string | null
    }, ExtArgs["result"]["caseStudy"]>
    composites: {}
  }

  type CaseStudyGetPayload<S extends boolean | null | undefined | CaseStudyDefaultArgs> = $Result.GetResult<Prisma.$CaseStudyPayload, S>

  type CaseStudyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CaseStudyFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CaseStudyCountAggregateInputType | true
    }

  export interface CaseStudyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CaseStudy'], meta: { name: 'CaseStudy' } }
    /**
     * Find zero or one CaseStudy that matches the filter.
     * @param {CaseStudyFindUniqueArgs} args - Arguments to find a CaseStudy
     * @example
     * // Get one CaseStudy
     * const caseStudy = await prisma.caseStudy.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CaseStudyFindUniqueArgs>(args: SelectSubset<T, CaseStudyFindUniqueArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CaseStudy that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CaseStudyFindUniqueOrThrowArgs} args - Arguments to find a CaseStudy
     * @example
     * // Get one CaseStudy
     * const caseStudy = await prisma.caseStudy.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CaseStudyFindUniqueOrThrowArgs>(args: SelectSubset<T, CaseStudyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CaseStudy that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseStudyFindFirstArgs} args - Arguments to find a CaseStudy
     * @example
     * // Get one CaseStudy
     * const caseStudy = await prisma.caseStudy.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CaseStudyFindFirstArgs>(args?: SelectSubset<T, CaseStudyFindFirstArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CaseStudy that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseStudyFindFirstOrThrowArgs} args - Arguments to find a CaseStudy
     * @example
     * // Get one CaseStudy
     * const caseStudy = await prisma.caseStudy.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CaseStudyFindFirstOrThrowArgs>(args?: SelectSubset<T, CaseStudyFindFirstOrThrowArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CaseStudies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseStudyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CaseStudies
     * const caseStudies = await prisma.caseStudy.findMany()
     * 
     * // Get first 10 CaseStudies
     * const caseStudies = await prisma.caseStudy.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const caseStudyWithIdOnly = await prisma.caseStudy.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CaseStudyFindManyArgs>(args?: SelectSubset<T, CaseStudyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CaseStudy.
     * @param {CaseStudyCreateArgs} args - Arguments to create a CaseStudy.
     * @example
     * // Create one CaseStudy
     * const CaseStudy = await prisma.caseStudy.create({
     *   data: {
     *     // ... data to create a CaseStudy
     *   }
     * })
     * 
     */
    create<T extends CaseStudyCreateArgs>(args: SelectSubset<T, CaseStudyCreateArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CaseStudies.
     * @param {CaseStudyCreateManyArgs} args - Arguments to create many CaseStudies.
     * @example
     * // Create many CaseStudies
     * const caseStudy = await prisma.caseStudy.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CaseStudyCreateManyArgs>(args?: SelectSubset<T, CaseStudyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CaseStudies and returns the data saved in the database.
     * @param {CaseStudyCreateManyAndReturnArgs} args - Arguments to create many CaseStudies.
     * @example
     * // Create many CaseStudies
     * const caseStudy = await prisma.caseStudy.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CaseStudies and only return the `id`
     * const caseStudyWithIdOnly = await prisma.caseStudy.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CaseStudyCreateManyAndReturnArgs>(args?: SelectSubset<T, CaseStudyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CaseStudy.
     * @param {CaseStudyDeleteArgs} args - Arguments to delete one CaseStudy.
     * @example
     * // Delete one CaseStudy
     * const CaseStudy = await prisma.caseStudy.delete({
     *   where: {
     *     // ... filter to delete one CaseStudy
     *   }
     * })
     * 
     */
    delete<T extends CaseStudyDeleteArgs>(args: SelectSubset<T, CaseStudyDeleteArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CaseStudy.
     * @param {CaseStudyUpdateArgs} args - Arguments to update one CaseStudy.
     * @example
     * // Update one CaseStudy
     * const caseStudy = await prisma.caseStudy.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CaseStudyUpdateArgs>(args: SelectSubset<T, CaseStudyUpdateArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CaseStudies.
     * @param {CaseStudyDeleteManyArgs} args - Arguments to filter CaseStudies to delete.
     * @example
     * // Delete a few CaseStudies
     * const { count } = await prisma.caseStudy.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CaseStudyDeleteManyArgs>(args?: SelectSubset<T, CaseStudyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CaseStudies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseStudyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CaseStudies
     * const caseStudy = await prisma.caseStudy.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CaseStudyUpdateManyArgs>(args: SelectSubset<T, CaseStudyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CaseStudy.
     * @param {CaseStudyUpsertArgs} args - Arguments to update or create a CaseStudy.
     * @example
     * // Update or create a CaseStudy
     * const caseStudy = await prisma.caseStudy.upsert({
     *   create: {
     *     // ... data to create a CaseStudy
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CaseStudy we want to update
     *   }
     * })
     */
    upsert<T extends CaseStudyUpsertArgs>(args: SelectSubset<T, CaseStudyUpsertArgs<ExtArgs>>): Prisma__CaseStudyClient<$Result.GetResult<Prisma.$CaseStudyPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CaseStudies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseStudyCountArgs} args - Arguments to filter CaseStudies to count.
     * @example
     * // Count the number of CaseStudies
     * const count = await prisma.caseStudy.count({
     *   where: {
     *     // ... the filter for the CaseStudies we want to count
     *   }
     * })
    **/
    count<T extends CaseStudyCountArgs>(
      args?: Subset<T, CaseStudyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CaseStudyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CaseStudy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseStudyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CaseStudyAggregateArgs>(args: Subset<T, CaseStudyAggregateArgs>): Prisma.PrismaPromise<GetCaseStudyAggregateType<T>>

    /**
     * Group by CaseStudy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseStudyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CaseStudyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CaseStudyGroupByArgs['orderBy'] }
        : { orderBy?: CaseStudyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CaseStudyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCaseStudyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CaseStudy model
   */
  readonly fields: CaseStudyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CaseStudy.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CaseStudyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    questions<T extends CaseStudy$questionsArgs<ExtArgs> = {}>(args?: Subset<T, CaseStudy$questionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CaseStudy model
   */ 
  interface CaseStudyFieldRefs {
    readonly id: FieldRef<"CaseStudy", 'String'>
    readonly title: FieldRef<"CaseStudy", 'String'>
    readonly description: FieldRef<"CaseStudy", 'String'>
    readonly topicNumber: FieldRef<"CaseStudy", 'Int'>
    readonly section: FieldRef<"CaseStudy", 'String'>
    readonly source: FieldRef<"CaseStudy", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CaseStudy findUnique
   */
  export type CaseStudyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * Filter, which CaseStudy to fetch.
     */
    where: CaseStudyWhereUniqueInput
  }

  /**
   * CaseStudy findUniqueOrThrow
   */
  export type CaseStudyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * Filter, which CaseStudy to fetch.
     */
    where: CaseStudyWhereUniqueInput
  }

  /**
   * CaseStudy findFirst
   */
  export type CaseStudyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * Filter, which CaseStudy to fetch.
     */
    where?: CaseStudyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseStudies to fetch.
     */
    orderBy?: CaseStudyOrderByWithRelationInput | CaseStudyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CaseStudies.
     */
    cursor?: CaseStudyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseStudies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseStudies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CaseStudies.
     */
    distinct?: CaseStudyScalarFieldEnum | CaseStudyScalarFieldEnum[]
  }

  /**
   * CaseStudy findFirstOrThrow
   */
  export type CaseStudyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * Filter, which CaseStudy to fetch.
     */
    where?: CaseStudyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseStudies to fetch.
     */
    orderBy?: CaseStudyOrderByWithRelationInput | CaseStudyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CaseStudies.
     */
    cursor?: CaseStudyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseStudies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseStudies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CaseStudies.
     */
    distinct?: CaseStudyScalarFieldEnum | CaseStudyScalarFieldEnum[]
  }

  /**
   * CaseStudy findMany
   */
  export type CaseStudyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * Filter, which CaseStudies to fetch.
     */
    where?: CaseStudyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CaseStudies to fetch.
     */
    orderBy?: CaseStudyOrderByWithRelationInput | CaseStudyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CaseStudies.
     */
    cursor?: CaseStudyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CaseStudies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CaseStudies.
     */
    skip?: number
    distinct?: CaseStudyScalarFieldEnum | CaseStudyScalarFieldEnum[]
  }

  /**
   * CaseStudy create
   */
  export type CaseStudyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * The data needed to create a CaseStudy.
     */
    data: XOR<CaseStudyCreateInput, CaseStudyUncheckedCreateInput>
  }

  /**
   * CaseStudy createMany
   */
  export type CaseStudyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CaseStudies.
     */
    data: CaseStudyCreateManyInput | CaseStudyCreateManyInput[]
  }

  /**
   * CaseStudy createManyAndReturn
   */
  export type CaseStudyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CaseStudies.
     */
    data: CaseStudyCreateManyInput | CaseStudyCreateManyInput[]
  }

  /**
   * CaseStudy update
   */
  export type CaseStudyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * The data needed to update a CaseStudy.
     */
    data: XOR<CaseStudyUpdateInput, CaseStudyUncheckedUpdateInput>
    /**
     * Choose, which CaseStudy to update.
     */
    where: CaseStudyWhereUniqueInput
  }

  /**
   * CaseStudy updateMany
   */
  export type CaseStudyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CaseStudies.
     */
    data: XOR<CaseStudyUpdateManyMutationInput, CaseStudyUncheckedUpdateManyInput>
    /**
     * Filter which CaseStudies to update
     */
    where?: CaseStudyWhereInput
  }

  /**
   * CaseStudy upsert
   */
  export type CaseStudyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * The filter to search for the CaseStudy to update in case it exists.
     */
    where: CaseStudyWhereUniqueInput
    /**
     * In case the CaseStudy found by the `where` argument doesn't exist, create a new CaseStudy with this data.
     */
    create: XOR<CaseStudyCreateInput, CaseStudyUncheckedCreateInput>
    /**
     * In case the CaseStudy was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CaseStudyUpdateInput, CaseStudyUncheckedUpdateInput>
  }

  /**
   * CaseStudy delete
   */
  export type CaseStudyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
    /**
     * Filter which CaseStudy to delete.
     */
    where: CaseStudyWhereUniqueInput
  }

  /**
   * CaseStudy deleteMany
   */
  export type CaseStudyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CaseStudies to delete
     */
    where?: CaseStudyWhereInput
  }

  /**
   * CaseStudy.questions
   */
  export type CaseStudy$questionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    where?: QuestionWhereInput
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    cursor?: QuestionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * CaseStudy without action
   */
  export type CaseStudyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseStudy
     */
    select?: CaseStudySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseStudyInclude<ExtArgs> | null
  }


  /**
   * Model ImportBatch
   */

  export type AggregateImportBatch = {
    _count: ImportBatchCountAggregateOutputType | null
    _avg: ImportBatchAvgAggregateOutputType | null
    _sum: ImportBatchSumAggregateOutputType | null
    _min: ImportBatchMinAggregateOutputType | null
    _max: ImportBatchMaxAggregateOutputType | null
  }

  export type ImportBatchAvgAggregateOutputType = {
    totalQuestionsDetected: number | null
    createdCount: number | null
    updatedCount: number | null
    skippedCount: number | null
    errorCount: number | null
  }

  export type ImportBatchSumAggregateOutputType = {
    totalQuestionsDetected: number | null
    createdCount: number | null
    updatedCount: number | null
    skippedCount: number | null
    errorCount: number | null
  }

  export type ImportBatchMinAggregateOutputType = {
    id: string | null
    filename: string | null
    importedAt: Date | null
    sourceMetadataJson: string | null
    totalQuestionsDetected: number | null
    createdCount: number | null
    updatedCount: number | null
    skippedCount: number | null
    errorCount: number | null
    warningsJson: string | null
    rawSummaryJson: string | null
    revertedAt: Date | null
  }

  export type ImportBatchMaxAggregateOutputType = {
    id: string | null
    filename: string | null
    importedAt: Date | null
    sourceMetadataJson: string | null
    totalQuestionsDetected: number | null
    createdCount: number | null
    updatedCount: number | null
    skippedCount: number | null
    errorCount: number | null
    warningsJson: string | null
    rawSummaryJson: string | null
    revertedAt: Date | null
  }

  export type ImportBatchCountAggregateOutputType = {
    id: number
    filename: number
    importedAt: number
    sourceMetadataJson: number
    totalQuestionsDetected: number
    createdCount: number
    updatedCount: number
    skippedCount: number
    errorCount: number
    warningsJson: number
    rawSummaryJson: number
    revertedAt: number
    _all: number
  }


  export type ImportBatchAvgAggregateInputType = {
    totalQuestionsDetected?: true
    createdCount?: true
    updatedCount?: true
    skippedCount?: true
    errorCount?: true
  }

  export type ImportBatchSumAggregateInputType = {
    totalQuestionsDetected?: true
    createdCount?: true
    updatedCount?: true
    skippedCount?: true
    errorCount?: true
  }

  export type ImportBatchMinAggregateInputType = {
    id?: true
    filename?: true
    importedAt?: true
    sourceMetadataJson?: true
    totalQuestionsDetected?: true
    createdCount?: true
    updatedCount?: true
    skippedCount?: true
    errorCount?: true
    warningsJson?: true
    rawSummaryJson?: true
    revertedAt?: true
  }

  export type ImportBatchMaxAggregateInputType = {
    id?: true
    filename?: true
    importedAt?: true
    sourceMetadataJson?: true
    totalQuestionsDetected?: true
    createdCount?: true
    updatedCount?: true
    skippedCount?: true
    errorCount?: true
    warningsJson?: true
    rawSummaryJson?: true
    revertedAt?: true
  }

  export type ImportBatchCountAggregateInputType = {
    id?: true
    filename?: true
    importedAt?: true
    sourceMetadataJson?: true
    totalQuestionsDetected?: true
    createdCount?: true
    updatedCount?: true
    skippedCount?: true
    errorCount?: true
    warningsJson?: true
    rawSummaryJson?: true
    revertedAt?: true
    _all?: true
  }

  export type ImportBatchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportBatch to aggregate.
     */
    where?: ImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatches to fetch.
     */
    orderBy?: ImportBatchOrderByWithRelationInput | ImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ImportBatches
    **/
    _count?: true | ImportBatchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ImportBatchAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ImportBatchSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ImportBatchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ImportBatchMaxAggregateInputType
  }

  export type GetImportBatchAggregateType<T extends ImportBatchAggregateArgs> = {
        [P in keyof T & keyof AggregateImportBatch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateImportBatch[P]>
      : GetScalarType<T[P], AggregateImportBatch[P]>
  }




  export type ImportBatchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ImportBatchWhereInput
    orderBy?: ImportBatchOrderByWithAggregationInput | ImportBatchOrderByWithAggregationInput[]
    by: ImportBatchScalarFieldEnum[] | ImportBatchScalarFieldEnum
    having?: ImportBatchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ImportBatchCountAggregateInputType | true
    _avg?: ImportBatchAvgAggregateInputType
    _sum?: ImportBatchSumAggregateInputType
    _min?: ImportBatchMinAggregateInputType
    _max?: ImportBatchMaxAggregateInputType
  }

  export type ImportBatchGroupByOutputType = {
    id: string
    filename: string
    importedAt: Date
    sourceMetadataJson: string | null
    totalQuestionsDetected: number
    createdCount: number
    updatedCount: number
    skippedCount: number
    errorCount: number
    warningsJson: string | null
    rawSummaryJson: string | null
    revertedAt: Date | null
    _count: ImportBatchCountAggregateOutputType | null
    _avg: ImportBatchAvgAggregateOutputType | null
    _sum: ImportBatchSumAggregateOutputType | null
    _min: ImportBatchMinAggregateOutputType | null
    _max: ImportBatchMaxAggregateOutputType | null
  }

  type GetImportBatchGroupByPayload<T extends ImportBatchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ImportBatchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ImportBatchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ImportBatchGroupByOutputType[P]>
            : GetScalarType<T[P], ImportBatchGroupByOutputType[P]>
        }
      >
    >


  export type ImportBatchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    importedAt?: boolean
    sourceMetadataJson?: boolean
    totalQuestionsDetected?: boolean
    createdCount?: boolean
    updatedCount?: boolean
    skippedCount?: boolean
    errorCount?: boolean
    warningsJson?: boolean
    rawSummaryJson?: boolean
    revertedAt?: boolean
    items?: boolean | ImportBatch$itemsArgs<ExtArgs>
    _count?: boolean | ImportBatchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["importBatch"]>

  export type ImportBatchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    importedAt?: boolean
    sourceMetadataJson?: boolean
    totalQuestionsDetected?: boolean
    createdCount?: boolean
    updatedCount?: boolean
    skippedCount?: boolean
    errorCount?: boolean
    warningsJson?: boolean
    rawSummaryJson?: boolean
    revertedAt?: boolean
  }, ExtArgs["result"]["importBatch"]>

  export type ImportBatchSelectScalar = {
    id?: boolean
    filename?: boolean
    importedAt?: boolean
    sourceMetadataJson?: boolean
    totalQuestionsDetected?: boolean
    createdCount?: boolean
    updatedCount?: boolean
    skippedCount?: boolean
    errorCount?: boolean
    warningsJson?: boolean
    rawSummaryJson?: boolean
    revertedAt?: boolean
  }

  export type ImportBatchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | ImportBatch$itemsArgs<ExtArgs>
    _count?: boolean | ImportBatchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ImportBatchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ImportBatchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ImportBatch"
    objects: {
      items: Prisma.$ImportBatchQuestionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      filename: string
      importedAt: Date
      sourceMetadataJson: string | null
      totalQuestionsDetected: number
      createdCount: number
      updatedCount: number
      skippedCount: number
      errorCount: number
      warningsJson: string | null
      rawSummaryJson: string | null
      revertedAt: Date | null
    }, ExtArgs["result"]["importBatch"]>
    composites: {}
  }

  type ImportBatchGetPayload<S extends boolean | null | undefined | ImportBatchDefaultArgs> = $Result.GetResult<Prisma.$ImportBatchPayload, S>

  type ImportBatchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ImportBatchFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ImportBatchCountAggregateInputType | true
    }

  export interface ImportBatchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ImportBatch'], meta: { name: 'ImportBatch' } }
    /**
     * Find zero or one ImportBatch that matches the filter.
     * @param {ImportBatchFindUniqueArgs} args - Arguments to find a ImportBatch
     * @example
     * // Get one ImportBatch
     * const importBatch = await prisma.importBatch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ImportBatchFindUniqueArgs>(args: SelectSubset<T, ImportBatchFindUniqueArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ImportBatch that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ImportBatchFindUniqueOrThrowArgs} args - Arguments to find a ImportBatch
     * @example
     * // Get one ImportBatch
     * const importBatch = await prisma.importBatch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ImportBatchFindUniqueOrThrowArgs>(args: SelectSubset<T, ImportBatchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ImportBatch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchFindFirstArgs} args - Arguments to find a ImportBatch
     * @example
     * // Get one ImportBatch
     * const importBatch = await prisma.importBatch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ImportBatchFindFirstArgs>(args?: SelectSubset<T, ImportBatchFindFirstArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ImportBatch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchFindFirstOrThrowArgs} args - Arguments to find a ImportBatch
     * @example
     * // Get one ImportBatch
     * const importBatch = await prisma.importBatch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ImportBatchFindFirstOrThrowArgs>(args?: SelectSubset<T, ImportBatchFindFirstOrThrowArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ImportBatches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ImportBatches
     * const importBatches = await prisma.importBatch.findMany()
     * 
     * // Get first 10 ImportBatches
     * const importBatches = await prisma.importBatch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const importBatchWithIdOnly = await prisma.importBatch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ImportBatchFindManyArgs>(args?: SelectSubset<T, ImportBatchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ImportBatch.
     * @param {ImportBatchCreateArgs} args - Arguments to create a ImportBatch.
     * @example
     * // Create one ImportBatch
     * const ImportBatch = await prisma.importBatch.create({
     *   data: {
     *     // ... data to create a ImportBatch
     *   }
     * })
     * 
     */
    create<T extends ImportBatchCreateArgs>(args: SelectSubset<T, ImportBatchCreateArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ImportBatches.
     * @param {ImportBatchCreateManyArgs} args - Arguments to create many ImportBatches.
     * @example
     * // Create many ImportBatches
     * const importBatch = await prisma.importBatch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ImportBatchCreateManyArgs>(args?: SelectSubset<T, ImportBatchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ImportBatches and returns the data saved in the database.
     * @param {ImportBatchCreateManyAndReturnArgs} args - Arguments to create many ImportBatches.
     * @example
     * // Create many ImportBatches
     * const importBatch = await prisma.importBatch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ImportBatches and only return the `id`
     * const importBatchWithIdOnly = await prisma.importBatch.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ImportBatchCreateManyAndReturnArgs>(args?: SelectSubset<T, ImportBatchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ImportBatch.
     * @param {ImportBatchDeleteArgs} args - Arguments to delete one ImportBatch.
     * @example
     * // Delete one ImportBatch
     * const ImportBatch = await prisma.importBatch.delete({
     *   where: {
     *     // ... filter to delete one ImportBatch
     *   }
     * })
     * 
     */
    delete<T extends ImportBatchDeleteArgs>(args: SelectSubset<T, ImportBatchDeleteArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ImportBatch.
     * @param {ImportBatchUpdateArgs} args - Arguments to update one ImportBatch.
     * @example
     * // Update one ImportBatch
     * const importBatch = await prisma.importBatch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ImportBatchUpdateArgs>(args: SelectSubset<T, ImportBatchUpdateArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ImportBatches.
     * @param {ImportBatchDeleteManyArgs} args - Arguments to filter ImportBatches to delete.
     * @example
     * // Delete a few ImportBatches
     * const { count } = await prisma.importBatch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ImportBatchDeleteManyArgs>(args?: SelectSubset<T, ImportBatchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ImportBatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ImportBatches
     * const importBatch = await prisma.importBatch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ImportBatchUpdateManyArgs>(args: SelectSubset<T, ImportBatchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ImportBatch.
     * @param {ImportBatchUpsertArgs} args - Arguments to update or create a ImportBatch.
     * @example
     * // Update or create a ImportBatch
     * const importBatch = await prisma.importBatch.upsert({
     *   create: {
     *     // ... data to create a ImportBatch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ImportBatch we want to update
     *   }
     * })
     */
    upsert<T extends ImportBatchUpsertArgs>(args: SelectSubset<T, ImportBatchUpsertArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ImportBatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchCountArgs} args - Arguments to filter ImportBatches to count.
     * @example
     * // Count the number of ImportBatches
     * const count = await prisma.importBatch.count({
     *   where: {
     *     // ... the filter for the ImportBatches we want to count
     *   }
     * })
    **/
    count<T extends ImportBatchCountArgs>(
      args?: Subset<T, ImportBatchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ImportBatchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ImportBatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ImportBatchAggregateArgs>(args: Subset<T, ImportBatchAggregateArgs>): Prisma.PrismaPromise<GetImportBatchAggregateType<T>>

    /**
     * Group by ImportBatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ImportBatchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ImportBatchGroupByArgs['orderBy'] }
        : { orderBy?: ImportBatchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ImportBatchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetImportBatchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ImportBatch model
   */
  readonly fields: ImportBatchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ImportBatch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ImportBatchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    items<T extends ImportBatch$itemsArgs<ExtArgs> = {}>(args?: Subset<T, ImportBatch$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ImportBatch model
   */ 
  interface ImportBatchFieldRefs {
    readonly id: FieldRef<"ImportBatch", 'String'>
    readonly filename: FieldRef<"ImportBatch", 'String'>
    readonly importedAt: FieldRef<"ImportBatch", 'DateTime'>
    readonly sourceMetadataJson: FieldRef<"ImportBatch", 'String'>
    readonly totalQuestionsDetected: FieldRef<"ImportBatch", 'Int'>
    readonly createdCount: FieldRef<"ImportBatch", 'Int'>
    readonly updatedCount: FieldRef<"ImportBatch", 'Int'>
    readonly skippedCount: FieldRef<"ImportBatch", 'Int'>
    readonly errorCount: FieldRef<"ImportBatch", 'Int'>
    readonly warningsJson: FieldRef<"ImportBatch", 'String'>
    readonly rawSummaryJson: FieldRef<"ImportBatch", 'String'>
    readonly revertedAt: FieldRef<"ImportBatch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ImportBatch findUnique
   */
  export type ImportBatchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatch to fetch.
     */
    where: ImportBatchWhereUniqueInput
  }

  /**
   * ImportBatch findUniqueOrThrow
   */
  export type ImportBatchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatch to fetch.
     */
    where: ImportBatchWhereUniqueInput
  }

  /**
   * ImportBatch findFirst
   */
  export type ImportBatchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatch to fetch.
     */
    where?: ImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatches to fetch.
     */
    orderBy?: ImportBatchOrderByWithRelationInput | ImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportBatches.
     */
    cursor?: ImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportBatches.
     */
    distinct?: ImportBatchScalarFieldEnum | ImportBatchScalarFieldEnum[]
  }

  /**
   * ImportBatch findFirstOrThrow
   */
  export type ImportBatchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatch to fetch.
     */
    where?: ImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatches to fetch.
     */
    orderBy?: ImportBatchOrderByWithRelationInput | ImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportBatches.
     */
    cursor?: ImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportBatches.
     */
    distinct?: ImportBatchScalarFieldEnum | ImportBatchScalarFieldEnum[]
  }

  /**
   * ImportBatch findMany
   */
  export type ImportBatchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatches to fetch.
     */
    where?: ImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatches to fetch.
     */
    orderBy?: ImportBatchOrderByWithRelationInput | ImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ImportBatches.
     */
    cursor?: ImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatches.
     */
    skip?: number
    distinct?: ImportBatchScalarFieldEnum | ImportBatchScalarFieldEnum[]
  }

  /**
   * ImportBatch create
   */
  export type ImportBatchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * The data needed to create a ImportBatch.
     */
    data: XOR<ImportBatchCreateInput, ImportBatchUncheckedCreateInput>
  }

  /**
   * ImportBatch createMany
   */
  export type ImportBatchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ImportBatches.
     */
    data: ImportBatchCreateManyInput | ImportBatchCreateManyInput[]
  }

  /**
   * ImportBatch createManyAndReturn
   */
  export type ImportBatchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ImportBatches.
     */
    data: ImportBatchCreateManyInput | ImportBatchCreateManyInput[]
  }

  /**
   * ImportBatch update
   */
  export type ImportBatchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * The data needed to update a ImportBatch.
     */
    data: XOR<ImportBatchUpdateInput, ImportBatchUncheckedUpdateInput>
    /**
     * Choose, which ImportBatch to update.
     */
    where: ImportBatchWhereUniqueInput
  }

  /**
   * ImportBatch updateMany
   */
  export type ImportBatchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ImportBatches.
     */
    data: XOR<ImportBatchUpdateManyMutationInput, ImportBatchUncheckedUpdateManyInput>
    /**
     * Filter which ImportBatches to update
     */
    where?: ImportBatchWhereInput
  }

  /**
   * ImportBatch upsert
   */
  export type ImportBatchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * The filter to search for the ImportBatch to update in case it exists.
     */
    where: ImportBatchWhereUniqueInput
    /**
     * In case the ImportBatch found by the `where` argument doesn't exist, create a new ImportBatch with this data.
     */
    create: XOR<ImportBatchCreateInput, ImportBatchUncheckedCreateInput>
    /**
     * In case the ImportBatch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ImportBatchUpdateInput, ImportBatchUncheckedUpdateInput>
  }

  /**
   * ImportBatch delete
   */
  export type ImportBatchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
    /**
     * Filter which ImportBatch to delete.
     */
    where: ImportBatchWhereUniqueInput
  }

  /**
   * ImportBatch deleteMany
   */
  export type ImportBatchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportBatches to delete
     */
    where?: ImportBatchWhereInput
  }

  /**
   * ImportBatch.items
   */
  export type ImportBatch$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    where?: ImportBatchQuestionWhereInput
    orderBy?: ImportBatchQuestionOrderByWithRelationInput | ImportBatchQuestionOrderByWithRelationInput[]
    cursor?: ImportBatchQuestionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ImportBatchQuestionScalarFieldEnum | ImportBatchQuestionScalarFieldEnum[]
  }

  /**
   * ImportBatch without action
   */
  export type ImportBatchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatch
     */
    select?: ImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchInclude<ExtArgs> | null
  }


  /**
   * Model ImportBatchQuestion
   */

  export type AggregateImportBatchQuestion = {
    _count: ImportBatchQuestionCountAggregateOutputType | null
    _min: ImportBatchQuestionMinAggregateOutputType | null
    _max: ImportBatchQuestionMaxAggregateOutputType | null
  }

  export type ImportBatchQuestionMinAggregateOutputType = {
    id: string | null
    importBatchId: string | null
    questionId: string | null
    externalId: string | null
    action: string | null
    warningsJson: string | null
    errorsJson: string | null
    previousDataJson: string | null
    importedDataJson: string | null
  }

  export type ImportBatchQuestionMaxAggregateOutputType = {
    id: string | null
    importBatchId: string | null
    questionId: string | null
    externalId: string | null
    action: string | null
    warningsJson: string | null
    errorsJson: string | null
    previousDataJson: string | null
    importedDataJson: string | null
  }

  export type ImportBatchQuestionCountAggregateOutputType = {
    id: number
    importBatchId: number
    questionId: number
    externalId: number
    action: number
    warningsJson: number
    errorsJson: number
    previousDataJson: number
    importedDataJson: number
    _all: number
  }


  export type ImportBatchQuestionMinAggregateInputType = {
    id?: true
    importBatchId?: true
    questionId?: true
    externalId?: true
    action?: true
    warningsJson?: true
    errorsJson?: true
    previousDataJson?: true
    importedDataJson?: true
  }

  export type ImportBatchQuestionMaxAggregateInputType = {
    id?: true
    importBatchId?: true
    questionId?: true
    externalId?: true
    action?: true
    warningsJson?: true
    errorsJson?: true
    previousDataJson?: true
    importedDataJson?: true
  }

  export type ImportBatchQuestionCountAggregateInputType = {
    id?: true
    importBatchId?: true
    questionId?: true
    externalId?: true
    action?: true
    warningsJson?: true
    errorsJson?: true
    previousDataJson?: true
    importedDataJson?: true
    _all?: true
  }

  export type ImportBatchQuestionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportBatchQuestion to aggregate.
     */
    where?: ImportBatchQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatchQuestions to fetch.
     */
    orderBy?: ImportBatchQuestionOrderByWithRelationInput | ImportBatchQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ImportBatchQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatchQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatchQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ImportBatchQuestions
    **/
    _count?: true | ImportBatchQuestionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ImportBatchQuestionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ImportBatchQuestionMaxAggregateInputType
  }

  export type GetImportBatchQuestionAggregateType<T extends ImportBatchQuestionAggregateArgs> = {
        [P in keyof T & keyof AggregateImportBatchQuestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateImportBatchQuestion[P]>
      : GetScalarType<T[P], AggregateImportBatchQuestion[P]>
  }




  export type ImportBatchQuestionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ImportBatchQuestionWhereInput
    orderBy?: ImportBatchQuestionOrderByWithAggregationInput | ImportBatchQuestionOrderByWithAggregationInput[]
    by: ImportBatchQuestionScalarFieldEnum[] | ImportBatchQuestionScalarFieldEnum
    having?: ImportBatchQuestionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ImportBatchQuestionCountAggregateInputType | true
    _min?: ImportBatchQuestionMinAggregateInputType
    _max?: ImportBatchQuestionMaxAggregateInputType
  }

  export type ImportBatchQuestionGroupByOutputType = {
    id: string
    importBatchId: string
    questionId: string | null
    externalId: string
    action: string
    warningsJson: string | null
    errorsJson: string | null
    previousDataJson: string | null
    importedDataJson: string | null
    _count: ImportBatchQuestionCountAggregateOutputType | null
    _min: ImportBatchQuestionMinAggregateOutputType | null
    _max: ImportBatchQuestionMaxAggregateOutputType | null
  }

  type GetImportBatchQuestionGroupByPayload<T extends ImportBatchQuestionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ImportBatchQuestionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ImportBatchQuestionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ImportBatchQuestionGroupByOutputType[P]>
            : GetScalarType<T[P], ImportBatchQuestionGroupByOutputType[P]>
        }
      >
    >


  export type ImportBatchQuestionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    importBatchId?: boolean
    questionId?: boolean
    externalId?: boolean
    action?: boolean
    warningsJson?: boolean
    errorsJson?: boolean
    previousDataJson?: boolean
    importedDataJson?: boolean
    importBatch?: boolean | ImportBatchDefaultArgs<ExtArgs>
    question?: boolean | ImportBatchQuestion$questionArgs<ExtArgs>
  }, ExtArgs["result"]["importBatchQuestion"]>

  export type ImportBatchQuestionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    importBatchId?: boolean
    questionId?: boolean
    externalId?: boolean
    action?: boolean
    warningsJson?: boolean
    errorsJson?: boolean
    previousDataJson?: boolean
    importedDataJson?: boolean
    importBatch?: boolean | ImportBatchDefaultArgs<ExtArgs>
    question?: boolean | ImportBatchQuestion$questionArgs<ExtArgs>
  }, ExtArgs["result"]["importBatchQuestion"]>

  export type ImportBatchQuestionSelectScalar = {
    id?: boolean
    importBatchId?: boolean
    questionId?: boolean
    externalId?: boolean
    action?: boolean
    warningsJson?: boolean
    errorsJson?: boolean
    previousDataJson?: boolean
    importedDataJson?: boolean
  }

  export type ImportBatchQuestionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    importBatch?: boolean | ImportBatchDefaultArgs<ExtArgs>
    question?: boolean | ImportBatchQuestion$questionArgs<ExtArgs>
  }
  export type ImportBatchQuestionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    importBatch?: boolean | ImportBatchDefaultArgs<ExtArgs>
    question?: boolean | ImportBatchQuestion$questionArgs<ExtArgs>
  }

  export type $ImportBatchQuestionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ImportBatchQuestion"
    objects: {
      importBatch: Prisma.$ImportBatchPayload<ExtArgs>
      question: Prisma.$QuestionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      importBatchId: string
      questionId: string | null
      externalId: string
      action: string
      warningsJson: string | null
      errorsJson: string | null
      previousDataJson: string | null
      importedDataJson: string | null
    }, ExtArgs["result"]["importBatchQuestion"]>
    composites: {}
  }

  type ImportBatchQuestionGetPayload<S extends boolean | null | undefined | ImportBatchQuestionDefaultArgs> = $Result.GetResult<Prisma.$ImportBatchQuestionPayload, S>

  type ImportBatchQuestionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ImportBatchQuestionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ImportBatchQuestionCountAggregateInputType | true
    }

  export interface ImportBatchQuestionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ImportBatchQuestion'], meta: { name: 'ImportBatchQuestion' } }
    /**
     * Find zero or one ImportBatchQuestion that matches the filter.
     * @param {ImportBatchQuestionFindUniqueArgs} args - Arguments to find a ImportBatchQuestion
     * @example
     * // Get one ImportBatchQuestion
     * const importBatchQuestion = await prisma.importBatchQuestion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ImportBatchQuestionFindUniqueArgs>(args: SelectSubset<T, ImportBatchQuestionFindUniqueArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ImportBatchQuestion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ImportBatchQuestionFindUniqueOrThrowArgs} args - Arguments to find a ImportBatchQuestion
     * @example
     * // Get one ImportBatchQuestion
     * const importBatchQuestion = await prisma.importBatchQuestion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ImportBatchQuestionFindUniqueOrThrowArgs>(args: SelectSubset<T, ImportBatchQuestionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ImportBatchQuestion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchQuestionFindFirstArgs} args - Arguments to find a ImportBatchQuestion
     * @example
     * // Get one ImportBatchQuestion
     * const importBatchQuestion = await prisma.importBatchQuestion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ImportBatchQuestionFindFirstArgs>(args?: SelectSubset<T, ImportBatchQuestionFindFirstArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ImportBatchQuestion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchQuestionFindFirstOrThrowArgs} args - Arguments to find a ImportBatchQuestion
     * @example
     * // Get one ImportBatchQuestion
     * const importBatchQuestion = await prisma.importBatchQuestion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ImportBatchQuestionFindFirstOrThrowArgs>(args?: SelectSubset<T, ImportBatchQuestionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ImportBatchQuestions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchQuestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ImportBatchQuestions
     * const importBatchQuestions = await prisma.importBatchQuestion.findMany()
     * 
     * // Get first 10 ImportBatchQuestions
     * const importBatchQuestions = await prisma.importBatchQuestion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const importBatchQuestionWithIdOnly = await prisma.importBatchQuestion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ImportBatchQuestionFindManyArgs>(args?: SelectSubset<T, ImportBatchQuestionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ImportBatchQuestion.
     * @param {ImportBatchQuestionCreateArgs} args - Arguments to create a ImportBatchQuestion.
     * @example
     * // Create one ImportBatchQuestion
     * const ImportBatchQuestion = await prisma.importBatchQuestion.create({
     *   data: {
     *     // ... data to create a ImportBatchQuestion
     *   }
     * })
     * 
     */
    create<T extends ImportBatchQuestionCreateArgs>(args: SelectSubset<T, ImportBatchQuestionCreateArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ImportBatchQuestions.
     * @param {ImportBatchQuestionCreateManyArgs} args - Arguments to create many ImportBatchQuestions.
     * @example
     * // Create many ImportBatchQuestions
     * const importBatchQuestion = await prisma.importBatchQuestion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ImportBatchQuestionCreateManyArgs>(args?: SelectSubset<T, ImportBatchQuestionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ImportBatchQuestions and returns the data saved in the database.
     * @param {ImportBatchQuestionCreateManyAndReturnArgs} args - Arguments to create many ImportBatchQuestions.
     * @example
     * // Create many ImportBatchQuestions
     * const importBatchQuestion = await prisma.importBatchQuestion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ImportBatchQuestions and only return the `id`
     * const importBatchQuestionWithIdOnly = await prisma.importBatchQuestion.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ImportBatchQuestionCreateManyAndReturnArgs>(args?: SelectSubset<T, ImportBatchQuestionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ImportBatchQuestion.
     * @param {ImportBatchQuestionDeleteArgs} args - Arguments to delete one ImportBatchQuestion.
     * @example
     * // Delete one ImportBatchQuestion
     * const ImportBatchQuestion = await prisma.importBatchQuestion.delete({
     *   where: {
     *     // ... filter to delete one ImportBatchQuestion
     *   }
     * })
     * 
     */
    delete<T extends ImportBatchQuestionDeleteArgs>(args: SelectSubset<T, ImportBatchQuestionDeleteArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ImportBatchQuestion.
     * @param {ImportBatchQuestionUpdateArgs} args - Arguments to update one ImportBatchQuestion.
     * @example
     * // Update one ImportBatchQuestion
     * const importBatchQuestion = await prisma.importBatchQuestion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ImportBatchQuestionUpdateArgs>(args: SelectSubset<T, ImportBatchQuestionUpdateArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ImportBatchQuestions.
     * @param {ImportBatchQuestionDeleteManyArgs} args - Arguments to filter ImportBatchQuestions to delete.
     * @example
     * // Delete a few ImportBatchQuestions
     * const { count } = await prisma.importBatchQuestion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ImportBatchQuestionDeleteManyArgs>(args?: SelectSubset<T, ImportBatchQuestionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ImportBatchQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchQuestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ImportBatchQuestions
     * const importBatchQuestion = await prisma.importBatchQuestion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ImportBatchQuestionUpdateManyArgs>(args: SelectSubset<T, ImportBatchQuestionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ImportBatchQuestion.
     * @param {ImportBatchQuestionUpsertArgs} args - Arguments to update or create a ImportBatchQuestion.
     * @example
     * // Update or create a ImportBatchQuestion
     * const importBatchQuestion = await prisma.importBatchQuestion.upsert({
     *   create: {
     *     // ... data to create a ImportBatchQuestion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ImportBatchQuestion we want to update
     *   }
     * })
     */
    upsert<T extends ImportBatchQuestionUpsertArgs>(args: SelectSubset<T, ImportBatchQuestionUpsertArgs<ExtArgs>>): Prisma__ImportBatchQuestionClient<$Result.GetResult<Prisma.$ImportBatchQuestionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ImportBatchQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchQuestionCountArgs} args - Arguments to filter ImportBatchQuestions to count.
     * @example
     * // Count the number of ImportBatchQuestions
     * const count = await prisma.importBatchQuestion.count({
     *   where: {
     *     // ... the filter for the ImportBatchQuestions we want to count
     *   }
     * })
    **/
    count<T extends ImportBatchQuestionCountArgs>(
      args?: Subset<T, ImportBatchQuestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ImportBatchQuestionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ImportBatchQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchQuestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ImportBatchQuestionAggregateArgs>(args: Subset<T, ImportBatchQuestionAggregateArgs>): Prisma.PrismaPromise<GetImportBatchQuestionAggregateType<T>>

    /**
     * Group by ImportBatchQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportBatchQuestionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ImportBatchQuestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ImportBatchQuestionGroupByArgs['orderBy'] }
        : { orderBy?: ImportBatchQuestionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ImportBatchQuestionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetImportBatchQuestionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ImportBatchQuestion model
   */
  readonly fields: ImportBatchQuestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ImportBatchQuestion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ImportBatchQuestionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    importBatch<T extends ImportBatchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ImportBatchDefaultArgs<ExtArgs>>): Prisma__ImportBatchClient<$Result.GetResult<Prisma.$ImportBatchPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    question<T extends ImportBatchQuestion$questionArgs<ExtArgs> = {}>(args?: Subset<T, ImportBatchQuestion$questionArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ImportBatchQuestion model
   */ 
  interface ImportBatchQuestionFieldRefs {
    readonly id: FieldRef<"ImportBatchQuestion", 'String'>
    readonly importBatchId: FieldRef<"ImportBatchQuestion", 'String'>
    readonly questionId: FieldRef<"ImportBatchQuestion", 'String'>
    readonly externalId: FieldRef<"ImportBatchQuestion", 'String'>
    readonly action: FieldRef<"ImportBatchQuestion", 'String'>
    readonly warningsJson: FieldRef<"ImportBatchQuestion", 'String'>
    readonly errorsJson: FieldRef<"ImportBatchQuestion", 'String'>
    readonly previousDataJson: FieldRef<"ImportBatchQuestion", 'String'>
    readonly importedDataJson: FieldRef<"ImportBatchQuestion", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ImportBatchQuestion findUnique
   */
  export type ImportBatchQuestionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatchQuestion to fetch.
     */
    where: ImportBatchQuestionWhereUniqueInput
  }

  /**
   * ImportBatchQuestion findUniqueOrThrow
   */
  export type ImportBatchQuestionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatchQuestion to fetch.
     */
    where: ImportBatchQuestionWhereUniqueInput
  }

  /**
   * ImportBatchQuestion findFirst
   */
  export type ImportBatchQuestionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatchQuestion to fetch.
     */
    where?: ImportBatchQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatchQuestions to fetch.
     */
    orderBy?: ImportBatchQuestionOrderByWithRelationInput | ImportBatchQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportBatchQuestions.
     */
    cursor?: ImportBatchQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatchQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatchQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportBatchQuestions.
     */
    distinct?: ImportBatchQuestionScalarFieldEnum | ImportBatchQuestionScalarFieldEnum[]
  }

  /**
   * ImportBatchQuestion findFirstOrThrow
   */
  export type ImportBatchQuestionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatchQuestion to fetch.
     */
    where?: ImportBatchQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatchQuestions to fetch.
     */
    orderBy?: ImportBatchQuestionOrderByWithRelationInput | ImportBatchQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportBatchQuestions.
     */
    cursor?: ImportBatchQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatchQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatchQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportBatchQuestions.
     */
    distinct?: ImportBatchQuestionScalarFieldEnum | ImportBatchQuestionScalarFieldEnum[]
  }

  /**
   * ImportBatchQuestion findMany
   */
  export type ImportBatchQuestionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * Filter, which ImportBatchQuestions to fetch.
     */
    where?: ImportBatchQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportBatchQuestions to fetch.
     */
    orderBy?: ImportBatchQuestionOrderByWithRelationInput | ImportBatchQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ImportBatchQuestions.
     */
    cursor?: ImportBatchQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportBatchQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportBatchQuestions.
     */
    skip?: number
    distinct?: ImportBatchQuestionScalarFieldEnum | ImportBatchQuestionScalarFieldEnum[]
  }

  /**
   * ImportBatchQuestion create
   */
  export type ImportBatchQuestionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * The data needed to create a ImportBatchQuestion.
     */
    data: XOR<ImportBatchQuestionCreateInput, ImportBatchQuestionUncheckedCreateInput>
  }

  /**
   * ImportBatchQuestion createMany
   */
  export type ImportBatchQuestionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ImportBatchQuestions.
     */
    data: ImportBatchQuestionCreateManyInput | ImportBatchQuestionCreateManyInput[]
  }

  /**
   * ImportBatchQuestion createManyAndReturn
   */
  export type ImportBatchQuestionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ImportBatchQuestions.
     */
    data: ImportBatchQuestionCreateManyInput | ImportBatchQuestionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ImportBatchQuestion update
   */
  export type ImportBatchQuestionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * The data needed to update a ImportBatchQuestion.
     */
    data: XOR<ImportBatchQuestionUpdateInput, ImportBatchQuestionUncheckedUpdateInput>
    /**
     * Choose, which ImportBatchQuestion to update.
     */
    where: ImportBatchQuestionWhereUniqueInput
  }

  /**
   * ImportBatchQuestion updateMany
   */
  export type ImportBatchQuestionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ImportBatchQuestions.
     */
    data: XOR<ImportBatchQuestionUpdateManyMutationInput, ImportBatchQuestionUncheckedUpdateManyInput>
    /**
     * Filter which ImportBatchQuestions to update
     */
    where?: ImportBatchQuestionWhereInput
  }

  /**
   * ImportBatchQuestion upsert
   */
  export type ImportBatchQuestionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * The filter to search for the ImportBatchQuestion to update in case it exists.
     */
    where: ImportBatchQuestionWhereUniqueInput
    /**
     * In case the ImportBatchQuestion found by the `where` argument doesn't exist, create a new ImportBatchQuestion with this data.
     */
    create: XOR<ImportBatchQuestionCreateInput, ImportBatchQuestionUncheckedCreateInput>
    /**
     * In case the ImportBatchQuestion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ImportBatchQuestionUpdateInput, ImportBatchQuestionUncheckedUpdateInput>
  }

  /**
   * ImportBatchQuestion delete
   */
  export type ImportBatchQuestionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
    /**
     * Filter which ImportBatchQuestion to delete.
     */
    where: ImportBatchQuestionWhereUniqueInput
  }

  /**
   * ImportBatchQuestion deleteMany
   */
  export type ImportBatchQuestionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportBatchQuestions to delete
     */
    where?: ImportBatchQuestionWhereInput
  }

  /**
   * ImportBatchQuestion.question
   */
  export type ImportBatchQuestion$questionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    where?: QuestionWhereInput
  }

  /**
   * ImportBatchQuestion without action
   */
  export type ImportBatchQuestionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportBatchQuestion
     */
    select?: ImportBatchQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ImportBatchQuestionInclude<ExtArgs> | null
  }


  /**
   * Model TestSession
   */

  export type AggregateTestSession = {
    _count: TestSessionCountAggregateOutputType | null
    _avg: TestSessionAvgAggregateOutputType | null
    _sum: TestSessionSumAggregateOutputType | null
    _min: TestSessionMinAggregateOutputType | null
    _max: TestSessionMaxAggregateOutputType | null
  }

  export type TestSessionAvgAggregateOutputType = {
    durationSeconds: number | null
    totalQuestions: number | null
    score: number | null
    maxScore: number | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    averageTimePerQuestion: number | null
  }

  export type TestSessionSumAggregateOutputType = {
    durationSeconds: number | null
    totalQuestions: number | null
    score: number | null
    maxScore: number | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    averageTimePerQuestion: number | null
  }

  export type TestSessionMinAggregateOutputType = {
    id: string | null
    mode: string | null
    startedAt: Date | null
    finishedAt: Date | null
    durationSeconds: number | null
    status: string | null
    examExercise: string | null
    questionIdsJson: string | null
    totalQuestions: number | null
    score: number | null
    maxScore: number | null
    passed: boolean | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    averageTimePerQuestion: number | null
    topicFilter: string | null
    sectionFilter: string | null
    includeStatusesJson: string | null
    summaryJson: string | null
  }

  export type TestSessionMaxAggregateOutputType = {
    id: string | null
    mode: string | null
    startedAt: Date | null
    finishedAt: Date | null
    durationSeconds: number | null
    status: string | null
    examExercise: string | null
    questionIdsJson: string | null
    totalQuestions: number | null
    score: number | null
    maxScore: number | null
    passed: boolean | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    averageTimePerQuestion: number | null
    topicFilter: string | null
    sectionFilter: string | null
    includeStatusesJson: string | null
    summaryJson: string | null
  }

  export type TestSessionCountAggregateOutputType = {
    id: number
    mode: number
    startedAt: number
    finishedAt: number
    durationSeconds: number
    status: number
    examExercise: number
    questionIdsJson: number
    totalQuestions: number
    score: number
    maxScore: number
    passed: number
    correctCount: number
    wrongCount: number
    blankCount: number
    averageTimePerQuestion: number
    topicFilter: number
    sectionFilter: number
    includeStatusesJson: number
    summaryJson: number
    _all: number
  }


  export type TestSessionAvgAggregateInputType = {
    durationSeconds?: true
    totalQuestions?: true
    score?: true
    maxScore?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    averageTimePerQuestion?: true
  }

  export type TestSessionSumAggregateInputType = {
    durationSeconds?: true
    totalQuestions?: true
    score?: true
    maxScore?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    averageTimePerQuestion?: true
  }

  export type TestSessionMinAggregateInputType = {
    id?: true
    mode?: true
    startedAt?: true
    finishedAt?: true
    durationSeconds?: true
    status?: true
    examExercise?: true
    questionIdsJson?: true
    totalQuestions?: true
    score?: true
    maxScore?: true
    passed?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    averageTimePerQuestion?: true
    topicFilter?: true
    sectionFilter?: true
    includeStatusesJson?: true
    summaryJson?: true
  }

  export type TestSessionMaxAggregateInputType = {
    id?: true
    mode?: true
    startedAt?: true
    finishedAt?: true
    durationSeconds?: true
    status?: true
    examExercise?: true
    questionIdsJson?: true
    totalQuestions?: true
    score?: true
    maxScore?: true
    passed?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    averageTimePerQuestion?: true
    topicFilter?: true
    sectionFilter?: true
    includeStatusesJson?: true
    summaryJson?: true
  }

  export type TestSessionCountAggregateInputType = {
    id?: true
    mode?: true
    startedAt?: true
    finishedAt?: true
    durationSeconds?: true
    status?: true
    examExercise?: true
    questionIdsJson?: true
    totalQuestions?: true
    score?: true
    maxScore?: true
    passed?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    averageTimePerQuestion?: true
    topicFilter?: true
    sectionFilter?: true
    includeStatusesJson?: true
    summaryJson?: true
    _all?: true
  }

  export type TestSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestSession to aggregate.
     */
    where?: TestSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSessions to fetch.
     */
    orderBy?: TestSessionOrderByWithRelationInput | TestSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TestSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TestSessions
    **/
    _count?: true | TestSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TestSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TestSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TestSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TestSessionMaxAggregateInputType
  }

  export type GetTestSessionAggregateType<T extends TestSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateTestSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTestSession[P]>
      : GetScalarType<T[P], AggregateTestSession[P]>
  }




  export type TestSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestSessionWhereInput
    orderBy?: TestSessionOrderByWithAggregationInput | TestSessionOrderByWithAggregationInput[]
    by: TestSessionScalarFieldEnum[] | TestSessionScalarFieldEnum
    having?: TestSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TestSessionCountAggregateInputType | true
    _avg?: TestSessionAvgAggregateInputType
    _sum?: TestSessionSumAggregateInputType
    _min?: TestSessionMinAggregateInputType
    _max?: TestSessionMaxAggregateInputType
  }

  export type TestSessionGroupByOutputType = {
    id: string
    mode: string
    startedAt: Date
    finishedAt: Date | null
    durationSeconds: number | null
    status: string
    examExercise: string
    questionIdsJson: string
    totalQuestions: number
    score: number | null
    maxScore: number
    passed: boolean | null
    correctCount: number
    wrongCount: number
    blankCount: number
    averageTimePerQuestion: number | null
    topicFilter: string | null
    sectionFilter: string | null
    includeStatusesJson: string | null
    summaryJson: string | null
    _count: TestSessionCountAggregateOutputType | null
    _avg: TestSessionAvgAggregateOutputType | null
    _sum: TestSessionSumAggregateOutputType | null
    _min: TestSessionMinAggregateOutputType | null
    _max: TestSessionMaxAggregateOutputType | null
  }

  type GetTestSessionGroupByPayload<T extends TestSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TestSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TestSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TestSessionGroupByOutputType[P]>
            : GetScalarType<T[P], TestSessionGroupByOutputType[P]>
        }
      >
    >


  export type TestSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mode?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    durationSeconds?: boolean
    status?: boolean
    examExercise?: boolean
    questionIdsJson?: boolean
    totalQuestions?: boolean
    score?: boolean
    maxScore?: boolean
    passed?: boolean
    correctCount?: boolean
    wrongCount?: boolean
    blankCount?: boolean
    averageTimePerQuestion?: boolean
    topicFilter?: boolean
    sectionFilter?: boolean
    includeStatusesJson?: boolean
    summaryJson?: boolean
    answers?: boolean | TestSession$answersArgs<ExtArgs>
    _count?: boolean | TestSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["testSession"]>

  export type TestSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mode?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    durationSeconds?: boolean
    status?: boolean
    examExercise?: boolean
    questionIdsJson?: boolean
    totalQuestions?: boolean
    score?: boolean
    maxScore?: boolean
    passed?: boolean
    correctCount?: boolean
    wrongCount?: boolean
    blankCount?: boolean
    averageTimePerQuestion?: boolean
    topicFilter?: boolean
    sectionFilter?: boolean
    includeStatusesJson?: boolean
    summaryJson?: boolean
  }, ExtArgs["result"]["testSession"]>

  export type TestSessionSelectScalar = {
    id?: boolean
    mode?: boolean
    startedAt?: boolean
    finishedAt?: boolean
    durationSeconds?: boolean
    status?: boolean
    examExercise?: boolean
    questionIdsJson?: boolean
    totalQuestions?: boolean
    score?: boolean
    maxScore?: boolean
    passed?: boolean
    correctCount?: boolean
    wrongCount?: boolean
    blankCount?: boolean
    averageTimePerQuestion?: boolean
    topicFilter?: boolean
    sectionFilter?: boolean
    includeStatusesJson?: boolean
    summaryJson?: boolean
  }

  export type TestSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    answers?: boolean | TestSession$answersArgs<ExtArgs>
    _count?: boolean | TestSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TestSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TestSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TestSession"
    objects: {
      answers: Prisma.$TestAnswerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      mode: string
      startedAt: Date
      finishedAt: Date | null
      durationSeconds: number | null
      status: string
      examExercise: string
      questionIdsJson: string
      totalQuestions: number
      score: number | null
      maxScore: number
      passed: boolean | null
      correctCount: number
      wrongCount: number
      blankCount: number
      averageTimePerQuestion: number | null
      topicFilter: string | null
      sectionFilter: string | null
      includeStatusesJson: string | null
      summaryJson: string | null
    }, ExtArgs["result"]["testSession"]>
    composites: {}
  }

  type TestSessionGetPayload<S extends boolean | null | undefined | TestSessionDefaultArgs> = $Result.GetResult<Prisma.$TestSessionPayload, S>

  type TestSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TestSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TestSessionCountAggregateInputType | true
    }

  export interface TestSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TestSession'], meta: { name: 'TestSession' } }
    /**
     * Find zero or one TestSession that matches the filter.
     * @param {TestSessionFindUniqueArgs} args - Arguments to find a TestSession
     * @example
     * // Get one TestSession
     * const testSession = await prisma.testSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TestSessionFindUniqueArgs>(args: SelectSubset<T, TestSessionFindUniqueArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TestSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TestSessionFindUniqueOrThrowArgs} args - Arguments to find a TestSession
     * @example
     * // Get one TestSession
     * const testSession = await prisma.testSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TestSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, TestSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TestSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestSessionFindFirstArgs} args - Arguments to find a TestSession
     * @example
     * // Get one TestSession
     * const testSession = await prisma.testSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TestSessionFindFirstArgs>(args?: SelectSubset<T, TestSessionFindFirstArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TestSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestSessionFindFirstOrThrowArgs} args - Arguments to find a TestSession
     * @example
     * // Get one TestSession
     * const testSession = await prisma.testSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TestSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, TestSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TestSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TestSessions
     * const testSessions = await prisma.testSession.findMany()
     * 
     * // Get first 10 TestSessions
     * const testSessions = await prisma.testSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const testSessionWithIdOnly = await prisma.testSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TestSessionFindManyArgs>(args?: SelectSubset<T, TestSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TestSession.
     * @param {TestSessionCreateArgs} args - Arguments to create a TestSession.
     * @example
     * // Create one TestSession
     * const TestSession = await prisma.testSession.create({
     *   data: {
     *     // ... data to create a TestSession
     *   }
     * })
     * 
     */
    create<T extends TestSessionCreateArgs>(args: SelectSubset<T, TestSessionCreateArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TestSessions.
     * @param {TestSessionCreateManyArgs} args - Arguments to create many TestSessions.
     * @example
     * // Create many TestSessions
     * const testSession = await prisma.testSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TestSessionCreateManyArgs>(args?: SelectSubset<T, TestSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TestSessions and returns the data saved in the database.
     * @param {TestSessionCreateManyAndReturnArgs} args - Arguments to create many TestSessions.
     * @example
     * // Create many TestSessions
     * const testSession = await prisma.testSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TestSessions and only return the `id`
     * const testSessionWithIdOnly = await prisma.testSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TestSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, TestSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TestSession.
     * @param {TestSessionDeleteArgs} args - Arguments to delete one TestSession.
     * @example
     * // Delete one TestSession
     * const TestSession = await prisma.testSession.delete({
     *   where: {
     *     // ... filter to delete one TestSession
     *   }
     * })
     * 
     */
    delete<T extends TestSessionDeleteArgs>(args: SelectSubset<T, TestSessionDeleteArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TestSession.
     * @param {TestSessionUpdateArgs} args - Arguments to update one TestSession.
     * @example
     * // Update one TestSession
     * const testSession = await prisma.testSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TestSessionUpdateArgs>(args: SelectSubset<T, TestSessionUpdateArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TestSessions.
     * @param {TestSessionDeleteManyArgs} args - Arguments to filter TestSessions to delete.
     * @example
     * // Delete a few TestSessions
     * const { count } = await prisma.testSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TestSessionDeleteManyArgs>(args?: SelectSubset<T, TestSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TestSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TestSessions
     * const testSession = await prisma.testSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TestSessionUpdateManyArgs>(args: SelectSubset<T, TestSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TestSession.
     * @param {TestSessionUpsertArgs} args - Arguments to update or create a TestSession.
     * @example
     * // Update or create a TestSession
     * const testSession = await prisma.testSession.upsert({
     *   create: {
     *     // ... data to create a TestSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TestSession we want to update
     *   }
     * })
     */
    upsert<T extends TestSessionUpsertArgs>(args: SelectSubset<T, TestSessionUpsertArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TestSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestSessionCountArgs} args - Arguments to filter TestSessions to count.
     * @example
     * // Count the number of TestSessions
     * const count = await prisma.testSession.count({
     *   where: {
     *     // ... the filter for the TestSessions we want to count
     *   }
     * })
    **/
    count<T extends TestSessionCountArgs>(
      args?: Subset<T, TestSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TestSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TestSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TestSessionAggregateArgs>(args: Subset<T, TestSessionAggregateArgs>): Prisma.PrismaPromise<GetTestSessionAggregateType<T>>

    /**
     * Group by TestSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TestSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TestSessionGroupByArgs['orderBy'] }
        : { orderBy?: TestSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TestSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TestSession model
   */
  readonly fields: TestSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TestSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TestSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    answers<T extends TestSession$answersArgs<ExtArgs> = {}>(args?: Subset<T, TestSession$answersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TestSession model
   */ 
  interface TestSessionFieldRefs {
    readonly id: FieldRef<"TestSession", 'String'>
    readonly mode: FieldRef<"TestSession", 'String'>
    readonly startedAt: FieldRef<"TestSession", 'DateTime'>
    readonly finishedAt: FieldRef<"TestSession", 'DateTime'>
    readonly durationSeconds: FieldRef<"TestSession", 'Int'>
    readonly status: FieldRef<"TestSession", 'String'>
    readonly examExercise: FieldRef<"TestSession", 'String'>
    readonly questionIdsJson: FieldRef<"TestSession", 'String'>
    readonly totalQuestions: FieldRef<"TestSession", 'Int'>
    readonly score: FieldRef<"TestSession", 'Float'>
    readonly maxScore: FieldRef<"TestSession", 'Float'>
    readonly passed: FieldRef<"TestSession", 'Boolean'>
    readonly correctCount: FieldRef<"TestSession", 'Int'>
    readonly wrongCount: FieldRef<"TestSession", 'Int'>
    readonly blankCount: FieldRef<"TestSession", 'Int'>
    readonly averageTimePerQuestion: FieldRef<"TestSession", 'Float'>
    readonly topicFilter: FieldRef<"TestSession", 'String'>
    readonly sectionFilter: FieldRef<"TestSession", 'String'>
    readonly includeStatusesJson: FieldRef<"TestSession", 'String'>
    readonly summaryJson: FieldRef<"TestSession", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TestSession findUnique
   */
  export type TestSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * Filter, which TestSession to fetch.
     */
    where: TestSessionWhereUniqueInput
  }

  /**
   * TestSession findUniqueOrThrow
   */
  export type TestSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * Filter, which TestSession to fetch.
     */
    where: TestSessionWhereUniqueInput
  }

  /**
   * TestSession findFirst
   */
  export type TestSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * Filter, which TestSession to fetch.
     */
    where?: TestSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSessions to fetch.
     */
    orderBy?: TestSessionOrderByWithRelationInput | TestSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestSessions.
     */
    cursor?: TestSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestSessions.
     */
    distinct?: TestSessionScalarFieldEnum | TestSessionScalarFieldEnum[]
  }

  /**
   * TestSession findFirstOrThrow
   */
  export type TestSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * Filter, which TestSession to fetch.
     */
    where?: TestSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSessions to fetch.
     */
    orderBy?: TestSessionOrderByWithRelationInput | TestSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestSessions.
     */
    cursor?: TestSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestSessions.
     */
    distinct?: TestSessionScalarFieldEnum | TestSessionScalarFieldEnum[]
  }

  /**
   * TestSession findMany
   */
  export type TestSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * Filter, which TestSessions to fetch.
     */
    where?: TestSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSessions to fetch.
     */
    orderBy?: TestSessionOrderByWithRelationInput | TestSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TestSessions.
     */
    cursor?: TestSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSessions.
     */
    skip?: number
    distinct?: TestSessionScalarFieldEnum | TestSessionScalarFieldEnum[]
  }

  /**
   * TestSession create
   */
  export type TestSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a TestSession.
     */
    data: XOR<TestSessionCreateInput, TestSessionUncheckedCreateInput>
  }

  /**
   * TestSession createMany
   */
  export type TestSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TestSessions.
     */
    data: TestSessionCreateManyInput | TestSessionCreateManyInput[]
  }

  /**
   * TestSession createManyAndReturn
   */
  export type TestSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TestSessions.
     */
    data: TestSessionCreateManyInput | TestSessionCreateManyInput[]
  }

  /**
   * TestSession update
   */
  export type TestSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a TestSession.
     */
    data: XOR<TestSessionUpdateInput, TestSessionUncheckedUpdateInput>
    /**
     * Choose, which TestSession to update.
     */
    where: TestSessionWhereUniqueInput
  }

  /**
   * TestSession updateMany
   */
  export type TestSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TestSessions.
     */
    data: XOR<TestSessionUpdateManyMutationInput, TestSessionUncheckedUpdateManyInput>
    /**
     * Filter which TestSessions to update
     */
    where?: TestSessionWhereInput
  }

  /**
   * TestSession upsert
   */
  export type TestSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the TestSession to update in case it exists.
     */
    where: TestSessionWhereUniqueInput
    /**
     * In case the TestSession found by the `where` argument doesn't exist, create a new TestSession with this data.
     */
    create: XOR<TestSessionCreateInput, TestSessionUncheckedCreateInput>
    /**
     * In case the TestSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TestSessionUpdateInput, TestSessionUncheckedUpdateInput>
  }

  /**
   * TestSession delete
   */
  export type TestSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
    /**
     * Filter which TestSession to delete.
     */
    where: TestSessionWhereUniqueInput
  }

  /**
   * TestSession deleteMany
   */
  export type TestSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestSessions to delete
     */
    where?: TestSessionWhereInput
  }

  /**
   * TestSession.answers
   */
  export type TestSession$answersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    where?: TestAnswerWhereInput
    orderBy?: TestAnswerOrderByWithRelationInput | TestAnswerOrderByWithRelationInput[]
    cursor?: TestAnswerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TestAnswerScalarFieldEnum | TestAnswerScalarFieldEnum[]
  }

  /**
   * TestSession without action
   */
  export type TestSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSession
     */
    select?: TestSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestSessionInclude<ExtArgs> | null
  }


  /**
   * Model TestAnswer
   */

  export type AggregateTestAnswer = {
    _count: TestAnswerCountAggregateOutputType | null
    _avg: TestAnswerAvgAggregateOutputType | null
    _sum: TestAnswerSumAggregateOutputType | null
    _min: TestAnswerMinAggregateOutputType | null
    _max: TestAnswerMaxAggregateOutputType | null
  }

  export type TestAnswerAvgAggregateOutputType = {
    timeSpentSeconds: number | null
  }

  export type TestAnswerSumAggregateOutputType = {
    timeSpentSeconds: number | null
  }

  export type TestAnswerMinAggregateOutputType = {
    id: string | null
    testSessionId: string | null
    questionId: string | null
    selectedOptionId: string | null
    isCorrect: boolean | null
    isBlank: boolean | null
    confidence: string | null
    timeSpentSeconds: number | null
    answeredAt: Date | null
  }

  export type TestAnswerMaxAggregateOutputType = {
    id: string | null
    testSessionId: string | null
    questionId: string | null
    selectedOptionId: string | null
    isCorrect: boolean | null
    isBlank: boolean | null
    confidence: string | null
    timeSpentSeconds: number | null
    answeredAt: Date | null
  }

  export type TestAnswerCountAggregateOutputType = {
    id: number
    testSessionId: number
    questionId: number
    selectedOptionId: number
    isCorrect: number
    isBlank: number
    confidence: number
    timeSpentSeconds: number
    answeredAt: number
    _all: number
  }


  export type TestAnswerAvgAggregateInputType = {
    timeSpentSeconds?: true
  }

  export type TestAnswerSumAggregateInputType = {
    timeSpentSeconds?: true
  }

  export type TestAnswerMinAggregateInputType = {
    id?: true
    testSessionId?: true
    questionId?: true
    selectedOptionId?: true
    isCorrect?: true
    isBlank?: true
    confidence?: true
    timeSpentSeconds?: true
    answeredAt?: true
  }

  export type TestAnswerMaxAggregateInputType = {
    id?: true
    testSessionId?: true
    questionId?: true
    selectedOptionId?: true
    isCorrect?: true
    isBlank?: true
    confidence?: true
    timeSpentSeconds?: true
    answeredAt?: true
  }

  export type TestAnswerCountAggregateInputType = {
    id?: true
    testSessionId?: true
    questionId?: true
    selectedOptionId?: true
    isCorrect?: true
    isBlank?: true
    confidence?: true
    timeSpentSeconds?: true
    answeredAt?: true
    _all?: true
  }

  export type TestAnswerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestAnswer to aggregate.
     */
    where?: TestAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestAnswers to fetch.
     */
    orderBy?: TestAnswerOrderByWithRelationInput | TestAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TestAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestAnswers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TestAnswers
    **/
    _count?: true | TestAnswerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TestAnswerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TestAnswerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TestAnswerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TestAnswerMaxAggregateInputType
  }

  export type GetTestAnswerAggregateType<T extends TestAnswerAggregateArgs> = {
        [P in keyof T & keyof AggregateTestAnswer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTestAnswer[P]>
      : GetScalarType<T[P], AggregateTestAnswer[P]>
  }




  export type TestAnswerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestAnswerWhereInput
    orderBy?: TestAnswerOrderByWithAggregationInput | TestAnswerOrderByWithAggregationInput[]
    by: TestAnswerScalarFieldEnum[] | TestAnswerScalarFieldEnum
    having?: TestAnswerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TestAnswerCountAggregateInputType | true
    _avg?: TestAnswerAvgAggregateInputType
    _sum?: TestAnswerSumAggregateInputType
    _min?: TestAnswerMinAggregateInputType
    _max?: TestAnswerMaxAggregateInputType
  }

  export type TestAnswerGroupByOutputType = {
    id: string
    testSessionId: string
    questionId: string
    selectedOptionId: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence: string | null
    timeSpentSeconds: number | null
    answeredAt: Date
    _count: TestAnswerCountAggregateOutputType | null
    _avg: TestAnswerAvgAggregateOutputType | null
    _sum: TestAnswerSumAggregateOutputType | null
    _min: TestAnswerMinAggregateOutputType | null
    _max: TestAnswerMaxAggregateOutputType | null
  }

  type GetTestAnswerGroupByPayload<T extends TestAnswerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TestAnswerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TestAnswerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TestAnswerGroupByOutputType[P]>
            : GetScalarType<T[P], TestAnswerGroupByOutputType[P]>
        }
      >
    >


  export type TestAnswerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    testSessionId?: boolean
    questionId?: boolean
    selectedOptionId?: boolean
    isCorrect?: boolean
    isBlank?: boolean
    confidence?: boolean
    timeSpentSeconds?: boolean
    answeredAt?: boolean
    testSession?: boolean | TestSessionDefaultArgs<ExtArgs>
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["testAnswer"]>

  export type TestAnswerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    testSessionId?: boolean
    questionId?: boolean
    selectedOptionId?: boolean
    isCorrect?: boolean
    isBlank?: boolean
    confidence?: boolean
    timeSpentSeconds?: boolean
    answeredAt?: boolean
    testSession?: boolean | TestSessionDefaultArgs<ExtArgs>
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["testAnswer"]>

  export type TestAnswerSelectScalar = {
    id?: boolean
    testSessionId?: boolean
    questionId?: boolean
    selectedOptionId?: boolean
    isCorrect?: boolean
    isBlank?: boolean
    confidence?: boolean
    timeSpentSeconds?: boolean
    answeredAt?: boolean
  }

  export type TestAnswerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    testSession?: boolean | TestSessionDefaultArgs<ExtArgs>
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }
  export type TestAnswerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    testSession?: boolean | TestSessionDefaultArgs<ExtArgs>
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }

  export type $TestAnswerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TestAnswer"
    objects: {
      testSession: Prisma.$TestSessionPayload<ExtArgs>
      question: Prisma.$QuestionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      testSessionId: string
      questionId: string
      selectedOptionId: string | null
      isCorrect: boolean
      isBlank: boolean
      confidence: string | null
      timeSpentSeconds: number | null
      answeredAt: Date
    }, ExtArgs["result"]["testAnswer"]>
    composites: {}
  }

  type TestAnswerGetPayload<S extends boolean | null | undefined | TestAnswerDefaultArgs> = $Result.GetResult<Prisma.$TestAnswerPayload, S>

  type TestAnswerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TestAnswerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TestAnswerCountAggregateInputType | true
    }

  export interface TestAnswerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TestAnswer'], meta: { name: 'TestAnswer' } }
    /**
     * Find zero or one TestAnswer that matches the filter.
     * @param {TestAnswerFindUniqueArgs} args - Arguments to find a TestAnswer
     * @example
     * // Get one TestAnswer
     * const testAnswer = await prisma.testAnswer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TestAnswerFindUniqueArgs>(args: SelectSubset<T, TestAnswerFindUniqueArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TestAnswer that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TestAnswerFindUniqueOrThrowArgs} args - Arguments to find a TestAnswer
     * @example
     * // Get one TestAnswer
     * const testAnswer = await prisma.testAnswer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TestAnswerFindUniqueOrThrowArgs>(args: SelectSubset<T, TestAnswerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TestAnswer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAnswerFindFirstArgs} args - Arguments to find a TestAnswer
     * @example
     * // Get one TestAnswer
     * const testAnswer = await prisma.testAnswer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TestAnswerFindFirstArgs>(args?: SelectSubset<T, TestAnswerFindFirstArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TestAnswer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAnswerFindFirstOrThrowArgs} args - Arguments to find a TestAnswer
     * @example
     * // Get one TestAnswer
     * const testAnswer = await prisma.testAnswer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TestAnswerFindFirstOrThrowArgs>(args?: SelectSubset<T, TestAnswerFindFirstOrThrowArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TestAnswers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAnswerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TestAnswers
     * const testAnswers = await prisma.testAnswer.findMany()
     * 
     * // Get first 10 TestAnswers
     * const testAnswers = await prisma.testAnswer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const testAnswerWithIdOnly = await prisma.testAnswer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TestAnswerFindManyArgs>(args?: SelectSubset<T, TestAnswerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TestAnswer.
     * @param {TestAnswerCreateArgs} args - Arguments to create a TestAnswer.
     * @example
     * // Create one TestAnswer
     * const TestAnswer = await prisma.testAnswer.create({
     *   data: {
     *     // ... data to create a TestAnswer
     *   }
     * })
     * 
     */
    create<T extends TestAnswerCreateArgs>(args: SelectSubset<T, TestAnswerCreateArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TestAnswers.
     * @param {TestAnswerCreateManyArgs} args - Arguments to create many TestAnswers.
     * @example
     * // Create many TestAnswers
     * const testAnswer = await prisma.testAnswer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TestAnswerCreateManyArgs>(args?: SelectSubset<T, TestAnswerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TestAnswers and returns the data saved in the database.
     * @param {TestAnswerCreateManyAndReturnArgs} args - Arguments to create many TestAnswers.
     * @example
     * // Create many TestAnswers
     * const testAnswer = await prisma.testAnswer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TestAnswers and only return the `id`
     * const testAnswerWithIdOnly = await prisma.testAnswer.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TestAnswerCreateManyAndReturnArgs>(args?: SelectSubset<T, TestAnswerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TestAnswer.
     * @param {TestAnswerDeleteArgs} args - Arguments to delete one TestAnswer.
     * @example
     * // Delete one TestAnswer
     * const TestAnswer = await prisma.testAnswer.delete({
     *   where: {
     *     // ... filter to delete one TestAnswer
     *   }
     * })
     * 
     */
    delete<T extends TestAnswerDeleteArgs>(args: SelectSubset<T, TestAnswerDeleteArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TestAnswer.
     * @param {TestAnswerUpdateArgs} args - Arguments to update one TestAnswer.
     * @example
     * // Update one TestAnswer
     * const testAnswer = await prisma.testAnswer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TestAnswerUpdateArgs>(args: SelectSubset<T, TestAnswerUpdateArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TestAnswers.
     * @param {TestAnswerDeleteManyArgs} args - Arguments to filter TestAnswers to delete.
     * @example
     * // Delete a few TestAnswers
     * const { count } = await prisma.testAnswer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TestAnswerDeleteManyArgs>(args?: SelectSubset<T, TestAnswerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TestAnswers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAnswerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TestAnswers
     * const testAnswer = await prisma.testAnswer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TestAnswerUpdateManyArgs>(args: SelectSubset<T, TestAnswerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TestAnswer.
     * @param {TestAnswerUpsertArgs} args - Arguments to update or create a TestAnswer.
     * @example
     * // Update or create a TestAnswer
     * const testAnswer = await prisma.testAnswer.upsert({
     *   create: {
     *     // ... data to create a TestAnswer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TestAnswer we want to update
     *   }
     * })
     */
    upsert<T extends TestAnswerUpsertArgs>(args: SelectSubset<T, TestAnswerUpsertArgs<ExtArgs>>): Prisma__TestAnswerClient<$Result.GetResult<Prisma.$TestAnswerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TestAnswers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAnswerCountArgs} args - Arguments to filter TestAnswers to count.
     * @example
     * // Count the number of TestAnswers
     * const count = await prisma.testAnswer.count({
     *   where: {
     *     // ... the filter for the TestAnswers we want to count
     *   }
     * })
    **/
    count<T extends TestAnswerCountArgs>(
      args?: Subset<T, TestAnswerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TestAnswerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TestAnswer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAnswerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TestAnswerAggregateArgs>(args: Subset<T, TestAnswerAggregateArgs>): Prisma.PrismaPromise<GetTestAnswerAggregateType<T>>

    /**
     * Group by TestAnswer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAnswerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TestAnswerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TestAnswerGroupByArgs['orderBy'] }
        : { orderBy?: TestAnswerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TestAnswerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestAnswerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TestAnswer model
   */
  readonly fields: TestAnswerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TestAnswer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TestAnswerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    testSession<T extends TestSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TestSessionDefaultArgs<ExtArgs>>): Prisma__TestSessionClient<$Result.GetResult<Prisma.$TestSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    question<T extends QuestionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, QuestionDefaultArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TestAnswer model
   */ 
  interface TestAnswerFieldRefs {
    readonly id: FieldRef<"TestAnswer", 'String'>
    readonly testSessionId: FieldRef<"TestAnswer", 'String'>
    readonly questionId: FieldRef<"TestAnswer", 'String'>
    readonly selectedOptionId: FieldRef<"TestAnswer", 'String'>
    readonly isCorrect: FieldRef<"TestAnswer", 'Boolean'>
    readonly isBlank: FieldRef<"TestAnswer", 'Boolean'>
    readonly confidence: FieldRef<"TestAnswer", 'String'>
    readonly timeSpentSeconds: FieldRef<"TestAnswer", 'Int'>
    readonly answeredAt: FieldRef<"TestAnswer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TestAnswer findUnique
   */
  export type TestAnswerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * Filter, which TestAnswer to fetch.
     */
    where: TestAnswerWhereUniqueInput
  }

  /**
   * TestAnswer findUniqueOrThrow
   */
  export type TestAnswerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * Filter, which TestAnswer to fetch.
     */
    where: TestAnswerWhereUniqueInput
  }

  /**
   * TestAnswer findFirst
   */
  export type TestAnswerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * Filter, which TestAnswer to fetch.
     */
    where?: TestAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestAnswers to fetch.
     */
    orderBy?: TestAnswerOrderByWithRelationInput | TestAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestAnswers.
     */
    cursor?: TestAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestAnswers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestAnswers.
     */
    distinct?: TestAnswerScalarFieldEnum | TestAnswerScalarFieldEnum[]
  }

  /**
   * TestAnswer findFirstOrThrow
   */
  export type TestAnswerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * Filter, which TestAnswer to fetch.
     */
    where?: TestAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestAnswers to fetch.
     */
    orderBy?: TestAnswerOrderByWithRelationInput | TestAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestAnswers.
     */
    cursor?: TestAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestAnswers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestAnswers.
     */
    distinct?: TestAnswerScalarFieldEnum | TestAnswerScalarFieldEnum[]
  }

  /**
   * TestAnswer findMany
   */
  export type TestAnswerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * Filter, which TestAnswers to fetch.
     */
    where?: TestAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestAnswers to fetch.
     */
    orderBy?: TestAnswerOrderByWithRelationInput | TestAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TestAnswers.
     */
    cursor?: TestAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestAnswers.
     */
    skip?: number
    distinct?: TestAnswerScalarFieldEnum | TestAnswerScalarFieldEnum[]
  }

  /**
   * TestAnswer create
   */
  export type TestAnswerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * The data needed to create a TestAnswer.
     */
    data: XOR<TestAnswerCreateInput, TestAnswerUncheckedCreateInput>
  }

  /**
   * TestAnswer createMany
   */
  export type TestAnswerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TestAnswers.
     */
    data: TestAnswerCreateManyInput | TestAnswerCreateManyInput[]
  }

  /**
   * TestAnswer createManyAndReturn
   */
  export type TestAnswerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TestAnswers.
     */
    data: TestAnswerCreateManyInput | TestAnswerCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TestAnswer update
   */
  export type TestAnswerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * The data needed to update a TestAnswer.
     */
    data: XOR<TestAnswerUpdateInput, TestAnswerUncheckedUpdateInput>
    /**
     * Choose, which TestAnswer to update.
     */
    where: TestAnswerWhereUniqueInput
  }

  /**
   * TestAnswer updateMany
   */
  export type TestAnswerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TestAnswers.
     */
    data: XOR<TestAnswerUpdateManyMutationInput, TestAnswerUncheckedUpdateManyInput>
    /**
     * Filter which TestAnswers to update
     */
    where?: TestAnswerWhereInput
  }

  /**
   * TestAnswer upsert
   */
  export type TestAnswerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * The filter to search for the TestAnswer to update in case it exists.
     */
    where: TestAnswerWhereUniqueInput
    /**
     * In case the TestAnswer found by the `where` argument doesn't exist, create a new TestAnswer with this data.
     */
    create: XOR<TestAnswerCreateInput, TestAnswerUncheckedCreateInput>
    /**
     * In case the TestAnswer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TestAnswerUpdateInput, TestAnswerUncheckedUpdateInput>
  }

  /**
   * TestAnswer delete
   */
  export type TestAnswerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
    /**
     * Filter which TestAnswer to delete.
     */
    where: TestAnswerWhereUniqueInput
  }

  /**
   * TestAnswer deleteMany
   */
  export type TestAnswerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestAnswers to delete
     */
    where?: TestAnswerWhereInput
  }

  /**
   * TestAnswer without action
   */
  export type TestAnswerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestAnswer
     */
    select?: TestAnswerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestAnswerInclude<ExtArgs> | null
  }


  /**
   * Model ReviewQueue
   */

  export type AggregateReviewQueue = {
    _count: ReviewQueueCountAggregateOutputType | null
    _avg: ReviewQueueAvgAggregateOutputType | null
    _sum: ReviewQueueSumAggregateOutputType | null
    _min: ReviewQueueMinAggregateOutputType | null
    _max: ReviewQueueMaxAggregateOutputType | null
  }

  export type ReviewQueueAvgAggregateOutputType = {
    intervalDays: number | null
    easeFactor: number | null
    masteryLevel: number | null
    totalAttempts: number | null
    correctAttempts: number | null
    wrongAttempts: number | null
  }

  export type ReviewQueueSumAggregateOutputType = {
    intervalDays: number | null
    easeFactor: number | null
    masteryLevel: number | null
    totalAttempts: number | null
    correctAttempts: number | null
    wrongAttempts: number | null
  }

  export type ReviewQueueMinAggregateOutputType = {
    questionId: string | null
    nextReviewAt: Date | null
    intervalDays: number | null
    easeFactor: number | null
    masteryLevel: number | null
    lastResult: string | null
    totalAttempts: number | null
    correctAttempts: number | null
    wrongAttempts: number | null
    lastReviewedAt: Date | null
  }

  export type ReviewQueueMaxAggregateOutputType = {
    questionId: string | null
    nextReviewAt: Date | null
    intervalDays: number | null
    easeFactor: number | null
    masteryLevel: number | null
    lastResult: string | null
    totalAttempts: number | null
    correctAttempts: number | null
    wrongAttempts: number | null
    lastReviewedAt: Date | null
  }

  export type ReviewQueueCountAggregateOutputType = {
    questionId: number
    nextReviewAt: number
    intervalDays: number
    easeFactor: number
    masteryLevel: number
    lastResult: number
    totalAttempts: number
    correctAttempts: number
    wrongAttempts: number
    lastReviewedAt: number
    _all: number
  }


  export type ReviewQueueAvgAggregateInputType = {
    intervalDays?: true
    easeFactor?: true
    masteryLevel?: true
    totalAttempts?: true
    correctAttempts?: true
    wrongAttempts?: true
  }

  export type ReviewQueueSumAggregateInputType = {
    intervalDays?: true
    easeFactor?: true
    masteryLevel?: true
    totalAttempts?: true
    correctAttempts?: true
    wrongAttempts?: true
  }

  export type ReviewQueueMinAggregateInputType = {
    questionId?: true
    nextReviewAt?: true
    intervalDays?: true
    easeFactor?: true
    masteryLevel?: true
    lastResult?: true
    totalAttempts?: true
    correctAttempts?: true
    wrongAttempts?: true
    lastReviewedAt?: true
  }

  export type ReviewQueueMaxAggregateInputType = {
    questionId?: true
    nextReviewAt?: true
    intervalDays?: true
    easeFactor?: true
    masteryLevel?: true
    lastResult?: true
    totalAttempts?: true
    correctAttempts?: true
    wrongAttempts?: true
    lastReviewedAt?: true
  }

  export type ReviewQueueCountAggregateInputType = {
    questionId?: true
    nextReviewAt?: true
    intervalDays?: true
    easeFactor?: true
    masteryLevel?: true
    lastResult?: true
    totalAttempts?: true
    correctAttempts?: true
    wrongAttempts?: true
    lastReviewedAt?: true
    _all?: true
  }

  export type ReviewQueueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewQueue to aggregate.
     */
    where?: ReviewQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewQueues to fetch.
     */
    orderBy?: ReviewQueueOrderByWithRelationInput | ReviewQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReviewQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReviewQueues
    **/
    _count?: true | ReviewQueueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReviewQueueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReviewQueueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReviewQueueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReviewQueueMaxAggregateInputType
  }

  export type GetReviewQueueAggregateType<T extends ReviewQueueAggregateArgs> = {
        [P in keyof T & keyof AggregateReviewQueue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReviewQueue[P]>
      : GetScalarType<T[P], AggregateReviewQueue[P]>
  }




  export type ReviewQueueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewQueueWhereInput
    orderBy?: ReviewQueueOrderByWithAggregationInput | ReviewQueueOrderByWithAggregationInput[]
    by: ReviewQueueScalarFieldEnum[] | ReviewQueueScalarFieldEnum
    having?: ReviewQueueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReviewQueueCountAggregateInputType | true
    _avg?: ReviewQueueAvgAggregateInputType
    _sum?: ReviewQueueSumAggregateInputType
    _min?: ReviewQueueMinAggregateInputType
    _max?: ReviewQueueMaxAggregateInputType
  }

  export type ReviewQueueGroupByOutputType = {
    questionId: string
    nextReviewAt: Date
    intervalDays: number
    easeFactor: number
    masteryLevel: number
    lastResult: string | null
    totalAttempts: number
    correctAttempts: number
    wrongAttempts: number
    lastReviewedAt: Date | null
    _count: ReviewQueueCountAggregateOutputType | null
    _avg: ReviewQueueAvgAggregateOutputType | null
    _sum: ReviewQueueSumAggregateOutputType | null
    _min: ReviewQueueMinAggregateOutputType | null
    _max: ReviewQueueMaxAggregateOutputType | null
  }

  type GetReviewQueueGroupByPayload<T extends ReviewQueueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReviewQueueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReviewQueueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReviewQueueGroupByOutputType[P]>
            : GetScalarType<T[P], ReviewQueueGroupByOutputType[P]>
        }
      >
    >


  export type ReviewQueueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    questionId?: boolean
    nextReviewAt?: boolean
    intervalDays?: boolean
    easeFactor?: boolean
    masteryLevel?: boolean
    lastResult?: boolean
    totalAttempts?: boolean
    correctAttempts?: boolean
    wrongAttempts?: boolean
    lastReviewedAt?: boolean
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewQueue"]>

  export type ReviewQueueSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    questionId?: boolean
    nextReviewAt?: boolean
    intervalDays?: boolean
    easeFactor?: boolean
    masteryLevel?: boolean
    lastResult?: boolean
    totalAttempts?: boolean
    correctAttempts?: boolean
    wrongAttempts?: boolean
    lastReviewedAt?: boolean
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewQueue"]>

  export type ReviewQueueSelectScalar = {
    questionId?: boolean
    nextReviewAt?: boolean
    intervalDays?: boolean
    easeFactor?: boolean
    masteryLevel?: boolean
    lastResult?: boolean
    totalAttempts?: boolean
    correctAttempts?: boolean
    wrongAttempts?: boolean
    lastReviewedAt?: boolean
  }

  export type ReviewQueueInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }
  export type ReviewQueueIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | QuestionDefaultArgs<ExtArgs>
  }

  export type $ReviewQueuePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReviewQueue"
    objects: {
      question: Prisma.$QuestionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      questionId: string
      nextReviewAt: Date
      intervalDays: number
      easeFactor: number
      masteryLevel: number
      lastResult: string | null
      totalAttempts: number
      correctAttempts: number
      wrongAttempts: number
      lastReviewedAt: Date | null
    }, ExtArgs["result"]["reviewQueue"]>
    composites: {}
  }

  type ReviewQueueGetPayload<S extends boolean | null | undefined | ReviewQueueDefaultArgs> = $Result.GetResult<Prisma.$ReviewQueuePayload, S>

  type ReviewQueueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ReviewQueueFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ReviewQueueCountAggregateInputType | true
    }

  export interface ReviewQueueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReviewQueue'], meta: { name: 'ReviewQueue' } }
    /**
     * Find zero or one ReviewQueue that matches the filter.
     * @param {ReviewQueueFindUniqueArgs} args - Arguments to find a ReviewQueue
     * @example
     * // Get one ReviewQueue
     * const reviewQueue = await prisma.reviewQueue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReviewQueueFindUniqueArgs>(args: SelectSubset<T, ReviewQueueFindUniqueArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ReviewQueue that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ReviewQueueFindUniqueOrThrowArgs} args - Arguments to find a ReviewQueue
     * @example
     * // Get one ReviewQueue
     * const reviewQueue = await prisma.reviewQueue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReviewQueueFindUniqueOrThrowArgs>(args: SelectSubset<T, ReviewQueueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ReviewQueue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewQueueFindFirstArgs} args - Arguments to find a ReviewQueue
     * @example
     * // Get one ReviewQueue
     * const reviewQueue = await prisma.reviewQueue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReviewQueueFindFirstArgs>(args?: SelectSubset<T, ReviewQueueFindFirstArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ReviewQueue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewQueueFindFirstOrThrowArgs} args - Arguments to find a ReviewQueue
     * @example
     * // Get one ReviewQueue
     * const reviewQueue = await prisma.reviewQueue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReviewQueueFindFirstOrThrowArgs>(args?: SelectSubset<T, ReviewQueueFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ReviewQueues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewQueueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReviewQueues
     * const reviewQueues = await prisma.reviewQueue.findMany()
     * 
     * // Get first 10 ReviewQueues
     * const reviewQueues = await prisma.reviewQueue.findMany({ take: 10 })
     * 
     * // Only select the `questionId`
     * const reviewQueueWithQuestionIdOnly = await prisma.reviewQueue.findMany({ select: { questionId: true } })
     * 
     */
    findMany<T extends ReviewQueueFindManyArgs>(args?: SelectSubset<T, ReviewQueueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ReviewQueue.
     * @param {ReviewQueueCreateArgs} args - Arguments to create a ReviewQueue.
     * @example
     * // Create one ReviewQueue
     * const ReviewQueue = await prisma.reviewQueue.create({
     *   data: {
     *     // ... data to create a ReviewQueue
     *   }
     * })
     * 
     */
    create<T extends ReviewQueueCreateArgs>(args: SelectSubset<T, ReviewQueueCreateArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ReviewQueues.
     * @param {ReviewQueueCreateManyArgs} args - Arguments to create many ReviewQueues.
     * @example
     * // Create many ReviewQueues
     * const reviewQueue = await prisma.reviewQueue.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReviewQueueCreateManyArgs>(args?: SelectSubset<T, ReviewQueueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReviewQueues and returns the data saved in the database.
     * @param {ReviewQueueCreateManyAndReturnArgs} args - Arguments to create many ReviewQueues.
     * @example
     * // Create many ReviewQueues
     * const reviewQueue = await prisma.reviewQueue.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReviewQueues and only return the `questionId`
     * const reviewQueueWithQuestionIdOnly = await prisma.reviewQueue.createManyAndReturn({ 
     *   select: { questionId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReviewQueueCreateManyAndReturnArgs>(args?: SelectSubset<T, ReviewQueueCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ReviewQueue.
     * @param {ReviewQueueDeleteArgs} args - Arguments to delete one ReviewQueue.
     * @example
     * // Delete one ReviewQueue
     * const ReviewQueue = await prisma.reviewQueue.delete({
     *   where: {
     *     // ... filter to delete one ReviewQueue
     *   }
     * })
     * 
     */
    delete<T extends ReviewQueueDeleteArgs>(args: SelectSubset<T, ReviewQueueDeleteArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ReviewQueue.
     * @param {ReviewQueueUpdateArgs} args - Arguments to update one ReviewQueue.
     * @example
     * // Update one ReviewQueue
     * const reviewQueue = await prisma.reviewQueue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReviewQueueUpdateArgs>(args: SelectSubset<T, ReviewQueueUpdateArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ReviewQueues.
     * @param {ReviewQueueDeleteManyArgs} args - Arguments to filter ReviewQueues to delete.
     * @example
     * // Delete a few ReviewQueues
     * const { count } = await prisma.reviewQueue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReviewQueueDeleteManyArgs>(args?: SelectSubset<T, ReviewQueueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReviewQueues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewQueueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReviewQueues
     * const reviewQueue = await prisma.reviewQueue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReviewQueueUpdateManyArgs>(args: SelectSubset<T, ReviewQueueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ReviewQueue.
     * @param {ReviewQueueUpsertArgs} args - Arguments to update or create a ReviewQueue.
     * @example
     * // Update or create a ReviewQueue
     * const reviewQueue = await prisma.reviewQueue.upsert({
     *   create: {
     *     // ... data to create a ReviewQueue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReviewQueue we want to update
     *   }
     * })
     */
    upsert<T extends ReviewQueueUpsertArgs>(args: SelectSubset<T, ReviewQueueUpsertArgs<ExtArgs>>): Prisma__ReviewQueueClient<$Result.GetResult<Prisma.$ReviewQueuePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ReviewQueues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewQueueCountArgs} args - Arguments to filter ReviewQueues to count.
     * @example
     * // Count the number of ReviewQueues
     * const count = await prisma.reviewQueue.count({
     *   where: {
     *     // ... the filter for the ReviewQueues we want to count
     *   }
     * })
    **/
    count<T extends ReviewQueueCountArgs>(
      args?: Subset<T, ReviewQueueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReviewQueueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReviewQueue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewQueueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReviewQueueAggregateArgs>(args: Subset<T, ReviewQueueAggregateArgs>): Prisma.PrismaPromise<GetReviewQueueAggregateType<T>>

    /**
     * Group by ReviewQueue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewQueueGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReviewQueueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReviewQueueGroupByArgs['orderBy'] }
        : { orderBy?: ReviewQueueGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReviewQueueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewQueueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReviewQueue model
   */
  readonly fields: ReviewQueueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReviewQueue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReviewQueueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    question<T extends QuestionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, QuestionDefaultArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReviewQueue model
   */ 
  interface ReviewQueueFieldRefs {
    readonly questionId: FieldRef<"ReviewQueue", 'String'>
    readonly nextReviewAt: FieldRef<"ReviewQueue", 'DateTime'>
    readonly intervalDays: FieldRef<"ReviewQueue", 'Int'>
    readonly easeFactor: FieldRef<"ReviewQueue", 'Float'>
    readonly masteryLevel: FieldRef<"ReviewQueue", 'Float'>
    readonly lastResult: FieldRef<"ReviewQueue", 'String'>
    readonly totalAttempts: FieldRef<"ReviewQueue", 'Int'>
    readonly correctAttempts: FieldRef<"ReviewQueue", 'Int'>
    readonly wrongAttempts: FieldRef<"ReviewQueue", 'Int'>
    readonly lastReviewedAt: FieldRef<"ReviewQueue", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReviewQueue findUnique
   */
  export type ReviewQueueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * Filter, which ReviewQueue to fetch.
     */
    where: ReviewQueueWhereUniqueInput
  }

  /**
   * ReviewQueue findUniqueOrThrow
   */
  export type ReviewQueueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * Filter, which ReviewQueue to fetch.
     */
    where: ReviewQueueWhereUniqueInput
  }

  /**
   * ReviewQueue findFirst
   */
  export type ReviewQueueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * Filter, which ReviewQueue to fetch.
     */
    where?: ReviewQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewQueues to fetch.
     */
    orderBy?: ReviewQueueOrderByWithRelationInput | ReviewQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewQueues.
     */
    cursor?: ReviewQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewQueues.
     */
    distinct?: ReviewQueueScalarFieldEnum | ReviewQueueScalarFieldEnum[]
  }

  /**
   * ReviewQueue findFirstOrThrow
   */
  export type ReviewQueueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * Filter, which ReviewQueue to fetch.
     */
    where?: ReviewQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewQueues to fetch.
     */
    orderBy?: ReviewQueueOrderByWithRelationInput | ReviewQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewQueues.
     */
    cursor?: ReviewQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewQueues.
     */
    distinct?: ReviewQueueScalarFieldEnum | ReviewQueueScalarFieldEnum[]
  }

  /**
   * ReviewQueue findMany
   */
  export type ReviewQueueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * Filter, which ReviewQueues to fetch.
     */
    where?: ReviewQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewQueues to fetch.
     */
    orderBy?: ReviewQueueOrderByWithRelationInput | ReviewQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReviewQueues.
     */
    cursor?: ReviewQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewQueues.
     */
    skip?: number
    distinct?: ReviewQueueScalarFieldEnum | ReviewQueueScalarFieldEnum[]
  }

  /**
   * ReviewQueue create
   */
  export type ReviewQueueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * The data needed to create a ReviewQueue.
     */
    data: XOR<ReviewQueueCreateInput, ReviewQueueUncheckedCreateInput>
  }

  /**
   * ReviewQueue createMany
   */
  export type ReviewQueueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReviewQueues.
     */
    data: ReviewQueueCreateManyInput | ReviewQueueCreateManyInput[]
  }

  /**
   * ReviewQueue createManyAndReturn
   */
  export type ReviewQueueCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ReviewQueues.
     */
    data: ReviewQueueCreateManyInput | ReviewQueueCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReviewQueue update
   */
  export type ReviewQueueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * The data needed to update a ReviewQueue.
     */
    data: XOR<ReviewQueueUpdateInput, ReviewQueueUncheckedUpdateInput>
    /**
     * Choose, which ReviewQueue to update.
     */
    where: ReviewQueueWhereUniqueInput
  }

  /**
   * ReviewQueue updateMany
   */
  export type ReviewQueueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReviewQueues.
     */
    data: XOR<ReviewQueueUpdateManyMutationInput, ReviewQueueUncheckedUpdateManyInput>
    /**
     * Filter which ReviewQueues to update
     */
    where?: ReviewQueueWhereInput
  }

  /**
   * ReviewQueue upsert
   */
  export type ReviewQueueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * The filter to search for the ReviewQueue to update in case it exists.
     */
    where: ReviewQueueWhereUniqueInput
    /**
     * In case the ReviewQueue found by the `where` argument doesn't exist, create a new ReviewQueue with this data.
     */
    create: XOR<ReviewQueueCreateInput, ReviewQueueUncheckedCreateInput>
    /**
     * In case the ReviewQueue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReviewQueueUpdateInput, ReviewQueueUncheckedUpdateInput>
  }

  /**
   * ReviewQueue delete
   */
  export type ReviewQueueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
    /**
     * Filter which ReviewQueue to delete.
     */
    where: ReviewQueueWhereUniqueInput
  }

  /**
   * ReviewQueue deleteMany
   */
  export type ReviewQueueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewQueues to delete
     */
    where?: ReviewQueueWhereInput
  }

  /**
   * ReviewQueue without action
   */
  export type ReviewQueueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewQueue
     */
    select?: ReviewQueueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewQueueInclude<ExtArgs> | null
  }


  /**
   * Model Achievement
   */

  export type AggregateAchievement = {
    _count: AchievementCountAggregateOutputType | null
    _min: AchievementMinAggregateOutputType | null
    _max: AchievementMaxAggregateOutputType | null
  }

  export type AchievementMinAggregateOutputType = {
    id: string | null
    code: string | null
    title: string | null
    description: string | null
    unlockedAt: Date | null
  }

  export type AchievementMaxAggregateOutputType = {
    id: string | null
    code: string | null
    title: string | null
    description: string | null
    unlockedAt: Date | null
  }

  export type AchievementCountAggregateOutputType = {
    id: number
    code: number
    title: number
    description: number
    unlockedAt: number
    _all: number
  }


  export type AchievementMinAggregateInputType = {
    id?: true
    code?: true
    title?: true
    description?: true
    unlockedAt?: true
  }

  export type AchievementMaxAggregateInputType = {
    id?: true
    code?: true
    title?: true
    description?: true
    unlockedAt?: true
  }

  export type AchievementCountAggregateInputType = {
    id?: true
    code?: true
    title?: true
    description?: true
    unlockedAt?: true
    _all?: true
  }

  export type AchievementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Achievement to aggregate.
     */
    where?: AchievementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Achievements to fetch.
     */
    orderBy?: AchievementOrderByWithRelationInput | AchievementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AchievementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Achievements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Achievements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Achievements
    **/
    _count?: true | AchievementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AchievementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AchievementMaxAggregateInputType
  }

  export type GetAchievementAggregateType<T extends AchievementAggregateArgs> = {
        [P in keyof T & keyof AggregateAchievement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAchievement[P]>
      : GetScalarType<T[P], AggregateAchievement[P]>
  }




  export type AchievementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AchievementWhereInput
    orderBy?: AchievementOrderByWithAggregationInput | AchievementOrderByWithAggregationInput[]
    by: AchievementScalarFieldEnum[] | AchievementScalarFieldEnum
    having?: AchievementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AchievementCountAggregateInputType | true
    _min?: AchievementMinAggregateInputType
    _max?: AchievementMaxAggregateInputType
  }

  export type AchievementGroupByOutputType = {
    id: string
    code: string
    title: string
    description: string
    unlockedAt: Date
    _count: AchievementCountAggregateOutputType | null
    _min: AchievementMinAggregateOutputType | null
    _max: AchievementMaxAggregateOutputType | null
  }

  type GetAchievementGroupByPayload<T extends AchievementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AchievementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AchievementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AchievementGroupByOutputType[P]>
            : GetScalarType<T[P], AchievementGroupByOutputType[P]>
        }
      >
    >


  export type AchievementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    title?: boolean
    description?: boolean
    unlockedAt?: boolean
  }, ExtArgs["result"]["achievement"]>

  export type AchievementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    title?: boolean
    description?: boolean
    unlockedAt?: boolean
  }, ExtArgs["result"]["achievement"]>

  export type AchievementSelectScalar = {
    id?: boolean
    code?: boolean
    title?: boolean
    description?: boolean
    unlockedAt?: boolean
  }


  export type $AchievementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Achievement"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      title: string
      description: string
      unlockedAt: Date
    }, ExtArgs["result"]["achievement"]>
    composites: {}
  }

  type AchievementGetPayload<S extends boolean | null | undefined | AchievementDefaultArgs> = $Result.GetResult<Prisma.$AchievementPayload, S>

  type AchievementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AchievementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AchievementCountAggregateInputType | true
    }

  export interface AchievementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Achievement'], meta: { name: 'Achievement' } }
    /**
     * Find zero or one Achievement that matches the filter.
     * @param {AchievementFindUniqueArgs} args - Arguments to find a Achievement
     * @example
     * // Get one Achievement
     * const achievement = await prisma.achievement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AchievementFindUniqueArgs>(args: SelectSubset<T, AchievementFindUniqueArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Achievement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AchievementFindUniqueOrThrowArgs} args - Arguments to find a Achievement
     * @example
     * // Get one Achievement
     * const achievement = await prisma.achievement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AchievementFindUniqueOrThrowArgs>(args: SelectSubset<T, AchievementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Achievement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AchievementFindFirstArgs} args - Arguments to find a Achievement
     * @example
     * // Get one Achievement
     * const achievement = await prisma.achievement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AchievementFindFirstArgs>(args?: SelectSubset<T, AchievementFindFirstArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Achievement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AchievementFindFirstOrThrowArgs} args - Arguments to find a Achievement
     * @example
     * // Get one Achievement
     * const achievement = await prisma.achievement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AchievementFindFirstOrThrowArgs>(args?: SelectSubset<T, AchievementFindFirstOrThrowArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Achievements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AchievementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Achievements
     * const achievements = await prisma.achievement.findMany()
     * 
     * // Get first 10 Achievements
     * const achievements = await prisma.achievement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const achievementWithIdOnly = await prisma.achievement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AchievementFindManyArgs>(args?: SelectSubset<T, AchievementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Achievement.
     * @param {AchievementCreateArgs} args - Arguments to create a Achievement.
     * @example
     * // Create one Achievement
     * const Achievement = await prisma.achievement.create({
     *   data: {
     *     // ... data to create a Achievement
     *   }
     * })
     * 
     */
    create<T extends AchievementCreateArgs>(args: SelectSubset<T, AchievementCreateArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Achievements.
     * @param {AchievementCreateManyArgs} args - Arguments to create many Achievements.
     * @example
     * // Create many Achievements
     * const achievement = await prisma.achievement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AchievementCreateManyArgs>(args?: SelectSubset<T, AchievementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Achievements and returns the data saved in the database.
     * @param {AchievementCreateManyAndReturnArgs} args - Arguments to create many Achievements.
     * @example
     * // Create many Achievements
     * const achievement = await prisma.achievement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Achievements and only return the `id`
     * const achievementWithIdOnly = await prisma.achievement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AchievementCreateManyAndReturnArgs>(args?: SelectSubset<T, AchievementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Achievement.
     * @param {AchievementDeleteArgs} args - Arguments to delete one Achievement.
     * @example
     * // Delete one Achievement
     * const Achievement = await prisma.achievement.delete({
     *   where: {
     *     // ... filter to delete one Achievement
     *   }
     * })
     * 
     */
    delete<T extends AchievementDeleteArgs>(args: SelectSubset<T, AchievementDeleteArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Achievement.
     * @param {AchievementUpdateArgs} args - Arguments to update one Achievement.
     * @example
     * // Update one Achievement
     * const achievement = await prisma.achievement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AchievementUpdateArgs>(args: SelectSubset<T, AchievementUpdateArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Achievements.
     * @param {AchievementDeleteManyArgs} args - Arguments to filter Achievements to delete.
     * @example
     * // Delete a few Achievements
     * const { count } = await prisma.achievement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AchievementDeleteManyArgs>(args?: SelectSubset<T, AchievementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Achievements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AchievementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Achievements
     * const achievement = await prisma.achievement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AchievementUpdateManyArgs>(args: SelectSubset<T, AchievementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Achievement.
     * @param {AchievementUpsertArgs} args - Arguments to update or create a Achievement.
     * @example
     * // Update or create a Achievement
     * const achievement = await prisma.achievement.upsert({
     *   create: {
     *     // ... data to create a Achievement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Achievement we want to update
     *   }
     * })
     */
    upsert<T extends AchievementUpsertArgs>(args: SelectSubset<T, AchievementUpsertArgs<ExtArgs>>): Prisma__AchievementClient<$Result.GetResult<Prisma.$AchievementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Achievements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AchievementCountArgs} args - Arguments to filter Achievements to count.
     * @example
     * // Count the number of Achievements
     * const count = await prisma.achievement.count({
     *   where: {
     *     // ... the filter for the Achievements we want to count
     *   }
     * })
    **/
    count<T extends AchievementCountArgs>(
      args?: Subset<T, AchievementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AchievementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Achievement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AchievementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AchievementAggregateArgs>(args: Subset<T, AchievementAggregateArgs>): Prisma.PrismaPromise<GetAchievementAggregateType<T>>

    /**
     * Group by Achievement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AchievementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AchievementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AchievementGroupByArgs['orderBy'] }
        : { orderBy?: AchievementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AchievementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAchievementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Achievement model
   */
  readonly fields: AchievementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Achievement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AchievementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Achievement model
   */ 
  interface AchievementFieldRefs {
    readonly id: FieldRef<"Achievement", 'String'>
    readonly code: FieldRef<"Achievement", 'String'>
    readonly title: FieldRef<"Achievement", 'String'>
    readonly description: FieldRef<"Achievement", 'String'>
    readonly unlockedAt: FieldRef<"Achievement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Achievement findUnique
   */
  export type AchievementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * Filter, which Achievement to fetch.
     */
    where: AchievementWhereUniqueInput
  }

  /**
   * Achievement findUniqueOrThrow
   */
  export type AchievementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * Filter, which Achievement to fetch.
     */
    where: AchievementWhereUniqueInput
  }

  /**
   * Achievement findFirst
   */
  export type AchievementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * Filter, which Achievement to fetch.
     */
    where?: AchievementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Achievements to fetch.
     */
    orderBy?: AchievementOrderByWithRelationInput | AchievementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Achievements.
     */
    cursor?: AchievementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Achievements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Achievements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Achievements.
     */
    distinct?: AchievementScalarFieldEnum | AchievementScalarFieldEnum[]
  }

  /**
   * Achievement findFirstOrThrow
   */
  export type AchievementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * Filter, which Achievement to fetch.
     */
    where?: AchievementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Achievements to fetch.
     */
    orderBy?: AchievementOrderByWithRelationInput | AchievementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Achievements.
     */
    cursor?: AchievementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Achievements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Achievements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Achievements.
     */
    distinct?: AchievementScalarFieldEnum | AchievementScalarFieldEnum[]
  }

  /**
   * Achievement findMany
   */
  export type AchievementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * Filter, which Achievements to fetch.
     */
    where?: AchievementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Achievements to fetch.
     */
    orderBy?: AchievementOrderByWithRelationInput | AchievementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Achievements.
     */
    cursor?: AchievementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Achievements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Achievements.
     */
    skip?: number
    distinct?: AchievementScalarFieldEnum | AchievementScalarFieldEnum[]
  }

  /**
   * Achievement create
   */
  export type AchievementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * The data needed to create a Achievement.
     */
    data: XOR<AchievementCreateInput, AchievementUncheckedCreateInput>
  }

  /**
   * Achievement createMany
   */
  export type AchievementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Achievements.
     */
    data: AchievementCreateManyInput | AchievementCreateManyInput[]
  }

  /**
   * Achievement createManyAndReturn
   */
  export type AchievementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Achievements.
     */
    data: AchievementCreateManyInput | AchievementCreateManyInput[]
  }

  /**
   * Achievement update
   */
  export type AchievementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * The data needed to update a Achievement.
     */
    data: XOR<AchievementUpdateInput, AchievementUncheckedUpdateInput>
    /**
     * Choose, which Achievement to update.
     */
    where: AchievementWhereUniqueInput
  }

  /**
   * Achievement updateMany
   */
  export type AchievementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Achievements.
     */
    data: XOR<AchievementUpdateManyMutationInput, AchievementUncheckedUpdateManyInput>
    /**
     * Filter which Achievements to update
     */
    where?: AchievementWhereInput
  }

  /**
   * Achievement upsert
   */
  export type AchievementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * The filter to search for the Achievement to update in case it exists.
     */
    where: AchievementWhereUniqueInput
    /**
     * In case the Achievement found by the `where` argument doesn't exist, create a new Achievement with this data.
     */
    create: XOR<AchievementCreateInput, AchievementUncheckedCreateInput>
    /**
     * In case the Achievement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AchievementUpdateInput, AchievementUncheckedUpdateInput>
  }

  /**
   * Achievement delete
   */
  export type AchievementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
    /**
     * Filter which Achievement to delete.
     */
    where: AchievementWhereUniqueInput
  }

  /**
   * Achievement deleteMany
   */
  export type AchievementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Achievements to delete
     */
    where?: AchievementWhereInput
  }

  /**
   * Achievement without action
   */
  export type AchievementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Achievement
     */
    select?: AchievementSelect<ExtArgs> | null
  }


  /**
   * Model UserProgress
   */

  export type AggregateUserProgress = {
    _count: UserProgressCountAggregateOutputType | null
    _avg: UserProgressAvgAggregateOutputType | null
    _sum: UserProgressSumAggregateOutputType | null
    _min: UserProgressMinAggregateOutputType | null
    _max: UserProgressMaxAggregateOutputType | null
  }

  export type UserProgressAvgAggregateOutputType = {
    topicNumber: number | null
    attempts: number | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    masteryLevel: number | null
    xp: number | null
  }

  export type UserProgressSumAggregateOutputType = {
    topicNumber: number | null
    attempts: number | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    masteryLevel: number | null
    xp: number | null
  }

  export type UserProgressMinAggregateOutputType = {
    id: string | null
    scopeType: string | null
    scopeKey: string | null
    topicNumber: number | null
    section: string | null
    attempts: number | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    lastAttemptAt: Date | null
    masteryLevel: number | null
    xp: number | null
    questionId: string | null
  }

  export type UserProgressMaxAggregateOutputType = {
    id: string | null
    scopeType: string | null
    scopeKey: string | null
    topicNumber: number | null
    section: string | null
    attempts: number | null
    correctCount: number | null
    wrongCount: number | null
    blankCount: number | null
    lastAttemptAt: Date | null
    masteryLevel: number | null
    xp: number | null
    questionId: string | null
  }

  export type UserProgressCountAggregateOutputType = {
    id: number
    scopeType: number
    scopeKey: number
    topicNumber: number
    section: number
    attempts: number
    correctCount: number
    wrongCount: number
    blankCount: number
    lastAttemptAt: number
    masteryLevel: number
    xp: number
    questionId: number
    _all: number
  }


  export type UserProgressAvgAggregateInputType = {
    topicNumber?: true
    attempts?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    masteryLevel?: true
    xp?: true
  }

  export type UserProgressSumAggregateInputType = {
    topicNumber?: true
    attempts?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    masteryLevel?: true
    xp?: true
  }

  export type UserProgressMinAggregateInputType = {
    id?: true
    scopeType?: true
    scopeKey?: true
    topicNumber?: true
    section?: true
    attempts?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    lastAttemptAt?: true
    masteryLevel?: true
    xp?: true
    questionId?: true
  }

  export type UserProgressMaxAggregateInputType = {
    id?: true
    scopeType?: true
    scopeKey?: true
    topicNumber?: true
    section?: true
    attempts?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    lastAttemptAt?: true
    masteryLevel?: true
    xp?: true
    questionId?: true
  }

  export type UserProgressCountAggregateInputType = {
    id?: true
    scopeType?: true
    scopeKey?: true
    topicNumber?: true
    section?: true
    attempts?: true
    correctCount?: true
    wrongCount?: true
    blankCount?: true
    lastAttemptAt?: true
    masteryLevel?: true
    xp?: true
    questionId?: true
    _all?: true
  }

  export type UserProgressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProgress to aggregate.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProgresses
    **/
    _count?: true | UserProgressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserProgressAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserProgressSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProgressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProgressMaxAggregateInputType
  }

  export type GetUserProgressAggregateType<T extends UserProgressAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProgress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProgress[P]>
      : GetScalarType<T[P], AggregateUserProgress[P]>
  }




  export type UserProgressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProgressWhereInput
    orderBy?: UserProgressOrderByWithAggregationInput | UserProgressOrderByWithAggregationInput[]
    by: UserProgressScalarFieldEnum[] | UserProgressScalarFieldEnum
    having?: UserProgressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProgressCountAggregateInputType | true
    _avg?: UserProgressAvgAggregateInputType
    _sum?: UserProgressSumAggregateInputType
    _min?: UserProgressMinAggregateInputType
    _max?: UserProgressMaxAggregateInputType
  }

  export type UserProgressGroupByOutputType = {
    id: string
    scopeType: string
    scopeKey: string
    topicNumber: number | null
    section: string | null
    attempts: number
    correctCount: number
    wrongCount: number
    blankCount: number
    lastAttemptAt: Date | null
    masteryLevel: number
    xp: number
    questionId: string | null
    _count: UserProgressCountAggregateOutputType | null
    _avg: UserProgressAvgAggregateOutputType | null
    _sum: UserProgressSumAggregateOutputType | null
    _min: UserProgressMinAggregateOutputType | null
    _max: UserProgressMaxAggregateOutputType | null
  }

  type GetUserProgressGroupByPayload<T extends UserProgressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProgressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProgressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProgressGroupByOutputType[P]>
            : GetScalarType<T[P], UserProgressGroupByOutputType[P]>
        }
      >
    >


  export type UserProgressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scopeType?: boolean
    scopeKey?: boolean
    topicNumber?: boolean
    section?: boolean
    attempts?: boolean
    correctCount?: boolean
    wrongCount?: boolean
    blankCount?: boolean
    lastAttemptAt?: boolean
    masteryLevel?: boolean
    xp?: boolean
    questionId?: boolean
    question?: boolean | UserProgress$questionArgs<ExtArgs>
  }, ExtArgs["result"]["userProgress"]>

  export type UserProgressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    scopeType?: boolean
    scopeKey?: boolean
    topicNumber?: boolean
    section?: boolean
    attempts?: boolean
    correctCount?: boolean
    wrongCount?: boolean
    blankCount?: boolean
    lastAttemptAt?: boolean
    masteryLevel?: boolean
    xp?: boolean
    questionId?: boolean
    question?: boolean | UserProgress$questionArgs<ExtArgs>
  }, ExtArgs["result"]["userProgress"]>

  export type UserProgressSelectScalar = {
    id?: boolean
    scopeType?: boolean
    scopeKey?: boolean
    topicNumber?: boolean
    section?: boolean
    attempts?: boolean
    correctCount?: boolean
    wrongCount?: boolean
    blankCount?: boolean
    lastAttemptAt?: boolean
    masteryLevel?: boolean
    xp?: boolean
    questionId?: boolean
  }

  export type UserProgressInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | UserProgress$questionArgs<ExtArgs>
  }
  export type UserProgressIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | UserProgress$questionArgs<ExtArgs>
  }

  export type $UserProgressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProgress"
    objects: {
      question: Prisma.$QuestionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      scopeType: string
      scopeKey: string
      topicNumber: number | null
      section: string | null
      attempts: number
      correctCount: number
      wrongCount: number
      blankCount: number
      lastAttemptAt: Date | null
      masteryLevel: number
      xp: number
      questionId: string | null
    }, ExtArgs["result"]["userProgress"]>
    composites: {}
  }

  type UserProgressGetPayload<S extends boolean | null | undefined | UserProgressDefaultArgs> = $Result.GetResult<Prisma.$UserProgressPayload, S>

  type UserProgressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserProgressFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserProgressCountAggregateInputType | true
    }

  export interface UserProgressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProgress'], meta: { name: 'UserProgress' } }
    /**
     * Find zero or one UserProgress that matches the filter.
     * @param {UserProgressFindUniqueArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProgressFindUniqueArgs>(args: SelectSubset<T, UserProgressFindUniqueArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserProgress that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserProgressFindUniqueOrThrowArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProgressFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProgressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserProgress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressFindFirstArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProgressFindFirstArgs>(args?: SelectSubset<T, UserProgressFindFirstArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserProgress that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressFindFirstOrThrowArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProgressFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProgressFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserProgresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProgresses
     * const userProgresses = await prisma.userProgress.findMany()
     * 
     * // Get first 10 UserProgresses
     * const userProgresses = await prisma.userProgress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProgressWithIdOnly = await prisma.userProgress.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProgressFindManyArgs>(args?: SelectSubset<T, UserProgressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserProgress.
     * @param {UserProgressCreateArgs} args - Arguments to create a UserProgress.
     * @example
     * // Create one UserProgress
     * const UserProgress = await prisma.userProgress.create({
     *   data: {
     *     // ... data to create a UserProgress
     *   }
     * })
     * 
     */
    create<T extends UserProgressCreateArgs>(args: SelectSubset<T, UserProgressCreateArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserProgresses.
     * @param {UserProgressCreateManyArgs} args - Arguments to create many UserProgresses.
     * @example
     * // Create many UserProgresses
     * const userProgress = await prisma.userProgress.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProgressCreateManyArgs>(args?: SelectSubset<T, UserProgressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProgresses and returns the data saved in the database.
     * @param {UserProgressCreateManyAndReturnArgs} args - Arguments to create many UserProgresses.
     * @example
     * // Create many UserProgresses
     * const userProgress = await prisma.userProgress.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProgresses and only return the `id`
     * const userProgressWithIdOnly = await prisma.userProgress.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProgressCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProgressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserProgress.
     * @param {UserProgressDeleteArgs} args - Arguments to delete one UserProgress.
     * @example
     * // Delete one UserProgress
     * const UserProgress = await prisma.userProgress.delete({
     *   where: {
     *     // ... filter to delete one UserProgress
     *   }
     * })
     * 
     */
    delete<T extends UserProgressDeleteArgs>(args: SelectSubset<T, UserProgressDeleteArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserProgress.
     * @param {UserProgressUpdateArgs} args - Arguments to update one UserProgress.
     * @example
     * // Update one UserProgress
     * const userProgress = await prisma.userProgress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProgressUpdateArgs>(args: SelectSubset<T, UserProgressUpdateArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserProgresses.
     * @param {UserProgressDeleteManyArgs} args - Arguments to filter UserProgresses to delete.
     * @example
     * // Delete a few UserProgresses
     * const { count } = await prisma.userProgress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProgressDeleteManyArgs>(args?: SelectSubset<T, UserProgressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProgresses
     * const userProgress = await prisma.userProgress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProgressUpdateManyArgs>(args: SelectSubset<T, UserProgressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserProgress.
     * @param {UserProgressUpsertArgs} args - Arguments to update or create a UserProgress.
     * @example
     * // Update or create a UserProgress
     * const userProgress = await prisma.userProgress.upsert({
     *   create: {
     *     // ... data to create a UserProgress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProgress we want to update
     *   }
     * })
     */
    upsert<T extends UserProgressUpsertArgs>(args: SelectSubset<T, UserProgressUpsertArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressCountArgs} args - Arguments to filter UserProgresses to count.
     * @example
     * // Count the number of UserProgresses
     * const count = await prisma.userProgress.count({
     *   where: {
     *     // ... the filter for the UserProgresses we want to count
     *   }
     * })
    **/
    count<T extends UserProgressCountArgs>(
      args?: Subset<T, UserProgressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProgressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserProgressAggregateArgs>(args: Subset<T, UserProgressAggregateArgs>): Prisma.PrismaPromise<GetUserProgressAggregateType<T>>

    /**
     * Group by UserProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserProgressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProgressGroupByArgs['orderBy'] }
        : { orderBy?: UserProgressGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProgressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProgressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProgress model
   */
  readonly fields: UserProgressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProgress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProgressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    question<T extends UserProgress$questionArgs<ExtArgs> = {}>(args?: Subset<T, UserProgress$questionArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProgress model
   */ 
  interface UserProgressFieldRefs {
    readonly id: FieldRef<"UserProgress", 'String'>
    readonly scopeType: FieldRef<"UserProgress", 'String'>
    readonly scopeKey: FieldRef<"UserProgress", 'String'>
    readonly topicNumber: FieldRef<"UserProgress", 'Int'>
    readonly section: FieldRef<"UserProgress", 'String'>
    readonly attempts: FieldRef<"UserProgress", 'Int'>
    readonly correctCount: FieldRef<"UserProgress", 'Int'>
    readonly wrongCount: FieldRef<"UserProgress", 'Int'>
    readonly blankCount: FieldRef<"UserProgress", 'Int'>
    readonly lastAttemptAt: FieldRef<"UserProgress", 'DateTime'>
    readonly masteryLevel: FieldRef<"UserProgress", 'Float'>
    readonly xp: FieldRef<"UserProgress", 'Int'>
    readonly questionId: FieldRef<"UserProgress", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserProgress findUnique
   */
  export type UserProgressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress findUniqueOrThrow
   */
  export type UserProgressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress findFirst
   */
  export type UserProgressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProgresses.
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProgresses.
     */
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * UserProgress findFirstOrThrow
   */
  export type UserProgressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProgresses.
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProgresses.
     */
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * UserProgress findMany
   */
  export type UserProgressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgresses to fetch.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProgresses.
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * UserProgress create
   */
  export type UserProgressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * The data needed to create a UserProgress.
     */
    data: XOR<UserProgressCreateInput, UserProgressUncheckedCreateInput>
  }

  /**
   * UserProgress createMany
   */
  export type UserProgressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProgresses.
     */
    data: UserProgressCreateManyInput | UserProgressCreateManyInput[]
  }

  /**
   * UserProgress createManyAndReturn
   */
  export type UserProgressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserProgresses.
     */
    data: UserProgressCreateManyInput | UserProgressCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProgress update
   */
  export type UserProgressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * The data needed to update a UserProgress.
     */
    data: XOR<UserProgressUpdateInput, UserProgressUncheckedUpdateInput>
    /**
     * Choose, which UserProgress to update.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress updateMany
   */
  export type UserProgressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProgresses.
     */
    data: XOR<UserProgressUpdateManyMutationInput, UserProgressUncheckedUpdateManyInput>
    /**
     * Filter which UserProgresses to update
     */
    where?: UserProgressWhereInput
  }

  /**
   * UserProgress upsert
   */
  export type UserProgressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * The filter to search for the UserProgress to update in case it exists.
     */
    where: UserProgressWhereUniqueInput
    /**
     * In case the UserProgress found by the `where` argument doesn't exist, create a new UserProgress with this data.
     */
    create: XOR<UserProgressCreateInput, UserProgressUncheckedCreateInput>
    /**
     * In case the UserProgress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProgressUpdateInput, UserProgressUncheckedUpdateInput>
  }

  /**
   * UserProgress delete
   */
  export type UserProgressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter which UserProgress to delete.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress deleteMany
   */
  export type UserProgressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProgresses to delete
     */
    where?: UserProgressWhereInput
  }

  /**
   * UserProgress.question
   */
  export type UserProgress$questionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    where?: QuestionWhereInput
  }

  /**
   * UserProgress without action
   */
  export type UserProgressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
  }


  /**
   * Model AppSettings
   */

  export type AggregateAppSettings = {
    _count: AppSettingsCountAggregateOutputType | null
    _avg: AppSettingsAvgAggregateOutputType | null
    _sum: AppSettingsSumAggregateOutputType | null
    _min: AppSettingsMinAggregateOutputType | null
    _max: AppSettingsMaxAggregateOutputType | null
  }

  export type AppSettingsAvgAggregateOutputType = {
    weeklyGoal: number | null
    dailyGoal: number | null
    weakPointMinimumSample: number | null
    wrongAnswerPenaltyFraction: number | null
  }

  export type AppSettingsSumAggregateOutputType = {
    weeklyGoal: number | null
    dailyGoal: number | null
    weakPointMinimumSample: number | null
    wrongAnswerPenaltyFraction: number | null
  }

  export type AppSettingsMinAggregateOutputType = {
    id: string | null
    targetExamDate: Date | null
    weeklyGoal: number | null
    dailyGoal: number | null
    weakPointMinimumSample: number | null
    wrongAnswerPenaltyFraction: number | null
    minimumQuestionStatus: string | null
    qualityRequiresExplanation: boolean | null
    visualPreferencesJson: string | null
    updatedAt: Date | null
  }

  export type AppSettingsMaxAggregateOutputType = {
    id: string | null
    targetExamDate: Date | null
    weeklyGoal: number | null
    dailyGoal: number | null
    weakPointMinimumSample: number | null
    wrongAnswerPenaltyFraction: number | null
    minimumQuestionStatus: string | null
    qualityRequiresExplanation: boolean | null
    visualPreferencesJson: string | null
    updatedAt: Date | null
  }

  export type AppSettingsCountAggregateOutputType = {
    id: number
    targetExamDate: number
    weeklyGoal: number
    dailyGoal: number
    weakPointMinimumSample: number
    wrongAnswerPenaltyFraction: number
    minimumQuestionStatus: number
    qualityRequiresExplanation: number
    visualPreferencesJson: number
    updatedAt: number
    _all: number
  }


  export type AppSettingsAvgAggregateInputType = {
    weeklyGoal?: true
    dailyGoal?: true
    weakPointMinimumSample?: true
    wrongAnswerPenaltyFraction?: true
  }

  export type AppSettingsSumAggregateInputType = {
    weeklyGoal?: true
    dailyGoal?: true
    weakPointMinimumSample?: true
    wrongAnswerPenaltyFraction?: true
  }

  export type AppSettingsMinAggregateInputType = {
    id?: true
    targetExamDate?: true
    weeklyGoal?: true
    dailyGoal?: true
    weakPointMinimumSample?: true
    wrongAnswerPenaltyFraction?: true
    minimumQuestionStatus?: true
    qualityRequiresExplanation?: true
    visualPreferencesJson?: true
    updatedAt?: true
  }

  export type AppSettingsMaxAggregateInputType = {
    id?: true
    targetExamDate?: true
    weeklyGoal?: true
    dailyGoal?: true
    weakPointMinimumSample?: true
    wrongAnswerPenaltyFraction?: true
    minimumQuestionStatus?: true
    qualityRequiresExplanation?: true
    visualPreferencesJson?: true
    updatedAt?: true
  }

  export type AppSettingsCountAggregateInputType = {
    id?: true
    targetExamDate?: true
    weeklyGoal?: true
    dailyGoal?: true
    weakPointMinimumSample?: true
    wrongAnswerPenaltyFraction?: true
    minimumQuestionStatus?: true
    qualityRequiresExplanation?: true
    visualPreferencesJson?: true
    updatedAt?: true
    _all?: true
  }

  export type AppSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppSettings to aggregate.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppSettings
    **/
    _count?: true | AppSettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppSettingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppSettingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppSettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppSettingsMaxAggregateInputType
  }

  export type GetAppSettingsAggregateType<T extends AppSettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateAppSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppSettings[P]>
      : GetScalarType<T[P], AggregateAppSettings[P]>
  }




  export type AppSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppSettingsWhereInput
    orderBy?: AppSettingsOrderByWithAggregationInput | AppSettingsOrderByWithAggregationInput[]
    by: AppSettingsScalarFieldEnum[] | AppSettingsScalarFieldEnum
    having?: AppSettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppSettingsCountAggregateInputType | true
    _avg?: AppSettingsAvgAggregateInputType
    _sum?: AppSettingsSumAggregateInputType
    _min?: AppSettingsMinAggregateInputType
    _max?: AppSettingsMaxAggregateInputType
  }

  export type AppSettingsGroupByOutputType = {
    id: string
    targetExamDate: Date | null
    weeklyGoal: number
    dailyGoal: number
    weakPointMinimumSample: number
    wrongAnswerPenaltyFraction: number
    minimumQuestionStatus: string
    qualityRequiresExplanation: boolean
    visualPreferencesJson: string | null
    updatedAt: Date
    _count: AppSettingsCountAggregateOutputType | null
    _avg: AppSettingsAvgAggregateOutputType | null
    _sum: AppSettingsSumAggregateOutputType | null
    _min: AppSettingsMinAggregateOutputType | null
    _max: AppSettingsMaxAggregateOutputType | null
  }

  type GetAppSettingsGroupByPayload<T extends AppSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppSettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppSettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppSettingsGroupByOutputType[P]>
            : GetScalarType<T[P], AppSettingsGroupByOutputType[P]>
        }
      >
    >


  export type AppSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    targetExamDate?: boolean
    weeklyGoal?: boolean
    dailyGoal?: boolean
    weakPointMinimumSample?: boolean
    wrongAnswerPenaltyFraction?: boolean
    minimumQuestionStatus?: boolean
    qualityRequiresExplanation?: boolean
    visualPreferencesJson?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSettings"]>

  export type AppSettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    targetExamDate?: boolean
    weeklyGoal?: boolean
    dailyGoal?: boolean
    weakPointMinimumSample?: boolean
    wrongAnswerPenaltyFraction?: boolean
    minimumQuestionStatus?: boolean
    qualityRequiresExplanation?: boolean
    visualPreferencesJson?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSettings"]>

  export type AppSettingsSelectScalar = {
    id?: boolean
    targetExamDate?: boolean
    weeklyGoal?: boolean
    dailyGoal?: boolean
    weakPointMinimumSample?: boolean
    wrongAnswerPenaltyFraction?: boolean
    minimumQuestionStatus?: boolean
    qualityRequiresExplanation?: boolean
    visualPreferencesJson?: boolean
    updatedAt?: boolean
  }


  export type $AppSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppSettings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      targetExamDate: Date | null
      weeklyGoal: number
      dailyGoal: number
      weakPointMinimumSample: number
      wrongAnswerPenaltyFraction: number
      minimumQuestionStatus: string
      qualityRequiresExplanation: boolean
      visualPreferencesJson: string | null
      updatedAt: Date
    }, ExtArgs["result"]["appSettings"]>
    composites: {}
  }

  type AppSettingsGetPayload<S extends boolean | null | undefined | AppSettingsDefaultArgs> = $Result.GetResult<Prisma.$AppSettingsPayload, S>

  type AppSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AppSettingsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AppSettingsCountAggregateInputType | true
    }

  export interface AppSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppSettings'], meta: { name: 'AppSettings' } }
    /**
     * Find zero or one AppSettings that matches the filter.
     * @param {AppSettingsFindUniqueArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppSettingsFindUniqueArgs>(args: SelectSubset<T, AppSettingsFindUniqueArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AppSettings that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AppSettingsFindUniqueOrThrowArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppSettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, AppSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AppSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsFindFirstArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppSettingsFindFirstArgs>(args?: SelectSubset<T, AppSettingsFindFirstArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AppSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsFindFirstOrThrowArgs} args - Arguments to find a AppSettings
     * @example
     * // Get one AppSettings
     * const appSettings = await prisma.appSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppSettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, AppSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AppSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppSettings
     * const appSettings = await prisma.appSettings.findMany()
     * 
     * // Get first 10 AppSettings
     * const appSettings = await prisma.appSettings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appSettingsWithIdOnly = await prisma.appSettings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AppSettingsFindManyArgs>(args?: SelectSubset<T, AppSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AppSettings.
     * @param {AppSettingsCreateArgs} args - Arguments to create a AppSettings.
     * @example
     * // Create one AppSettings
     * const AppSettings = await prisma.appSettings.create({
     *   data: {
     *     // ... data to create a AppSettings
     *   }
     * })
     * 
     */
    create<T extends AppSettingsCreateArgs>(args: SelectSubset<T, AppSettingsCreateArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AppSettings.
     * @param {AppSettingsCreateManyArgs} args - Arguments to create many AppSettings.
     * @example
     * // Create many AppSettings
     * const appSettings = await prisma.appSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppSettingsCreateManyArgs>(args?: SelectSubset<T, AppSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppSettings and returns the data saved in the database.
     * @param {AppSettingsCreateManyAndReturnArgs} args - Arguments to create many AppSettings.
     * @example
     * // Create many AppSettings
     * const appSettings = await prisma.appSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppSettings and only return the `id`
     * const appSettingsWithIdOnly = await prisma.appSettings.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppSettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, AppSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AppSettings.
     * @param {AppSettingsDeleteArgs} args - Arguments to delete one AppSettings.
     * @example
     * // Delete one AppSettings
     * const AppSettings = await prisma.appSettings.delete({
     *   where: {
     *     // ... filter to delete one AppSettings
     *   }
     * })
     * 
     */
    delete<T extends AppSettingsDeleteArgs>(args: SelectSubset<T, AppSettingsDeleteArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AppSettings.
     * @param {AppSettingsUpdateArgs} args - Arguments to update one AppSettings.
     * @example
     * // Update one AppSettings
     * const appSettings = await prisma.appSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppSettingsUpdateArgs>(args: SelectSubset<T, AppSettingsUpdateArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AppSettings.
     * @param {AppSettingsDeleteManyArgs} args - Arguments to filter AppSettings to delete.
     * @example
     * // Delete a few AppSettings
     * const { count } = await prisma.appSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppSettingsDeleteManyArgs>(args?: SelectSubset<T, AppSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppSettings
     * const appSettings = await prisma.appSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppSettingsUpdateManyArgs>(args: SelectSubset<T, AppSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AppSettings.
     * @param {AppSettingsUpsertArgs} args - Arguments to update or create a AppSettings.
     * @example
     * // Update or create a AppSettings
     * const appSettings = await prisma.appSettings.upsert({
     *   create: {
     *     // ... data to create a AppSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppSettings we want to update
     *   }
     * })
     */
    upsert<T extends AppSettingsUpsertArgs>(args: SelectSubset<T, AppSettingsUpsertArgs<ExtArgs>>): Prisma__AppSettingsClient<$Result.GetResult<Prisma.$AppSettingsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsCountArgs} args - Arguments to filter AppSettings to count.
     * @example
     * // Count the number of AppSettings
     * const count = await prisma.appSettings.count({
     *   where: {
     *     // ... the filter for the AppSettings we want to count
     *   }
     * })
    **/
    count<T extends AppSettingsCountArgs>(
      args?: Subset<T, AppSettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppSettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppSettingsAggregateArgs>(args: Subset<T, AppSettingsAggregateArgs>): Prisma.PrismaPromise<GetAppSettingsAggregateType<T>>

    /**
     * Group by AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppSettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppSettingsGroupByArgs['orderBy'] }
        : { orderBy?: AppSettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppSettings model
   */
  readonly fields: AppSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppSettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AppSettings model
   */ 
  interface AppSettingsFieldRefs {
    readonly id: FieldRef<"AppSettings", 'String'>
    readonly targetExamDate: FieldRef<"AppSettings", 'DateTime'>
    readonly weeklyGoal: FieldRef<"AppSettings", 'Int'>
    readonly dailyGoal: FieldRef<"AppSettings", 'Int'>
    readonly weakPointMinimumSample: FieldRef<"AppSettings", 'Int'>
    readonly wrongAnswerPenaltyFraction: FieldRef<"AppSettings", 'Float'>
    readonly minimumQuestionStatus: FieldRef<"AppSettings", 'String'>
    readonly qualityRequiresExplanation: FieldRef<"AppSettings", 'Boolean'>
    readonly visualPreferencesJson: FieldRef<"AppSettings", 'String'>
    readonly updatedAt: FieldRef<"AppSettings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppSettings findUnique
   */
  export type AppSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings findUniqueOrThrow
   */
  export type AppSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings findFirst
   */
  export type AppSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppSettings.
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppSettings.
     */
    distinct?: AppSettingsScalarFieldEnum | AppSettingsScalarFieldEnum[]
  }

  /**
   * AppSettings findFirstOrThrow
   */
  export type AppSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppSettings.
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppSettings.
     */
    distinct?: AppSettingsScalarFieldEnum | AppSettingsScalarFieldEnum[]
  }

  /**
   * AppSettings findMany
   */
  export type AppSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where?: AppSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingsOrderByWithRelationInput | AppSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppSettings.
     */
    cursor?: AppSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    distinct?: AppSettingsScalarFieldEnum | AppSettingsScalarFieldEnum[]
  }

  /**
   * AppSettings create
   */
  export type AppSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * The data needed to create a AppSettings.
     */
    data: XOR<AppSettingsCreateInput, AppSettingsUncheckedCreateInput>
  }

  /**
   * AppSettings createMany
   */
  export type AppSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppSettings.
     */
    data: AppSettingsCreateManyInput | AppSettingsCreateManyInput[]
  }

  /**
   * AppSettings createManyAndReturn
   */
  export type AppSettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AppSettings.
     */
    data: AppSettingsCreateManyInput | AppSettingsCreateManyInput[]
  }

  /**
   * AppSettings update
   */
  export type AppSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * The data needed to update a AppSettings.
     */
    data: XOR<AppSettingsUpdateInput, AppSettingsUncheckedUpdateInput>
    /**
     * Choose, which AppSettings to update.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings updateMany
   */
  export type AppSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppSettings.
     */
    data: XOR<AppSettingsUpdateManyMutationInput, AppSettingsUncheckedUpdateManyInput>
    /**
     * Filter which AppSettings to update
     */
    where?: AppSettingsWhereInput
  }

  /**
   * AppSettings upsert
   */
  export type AppSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * The filter to search for the AppSettings to update in case it exists.
     */
    where: AppSettingsWhereUniqueInput
    /**
     * In case the AppSettings found by the `where` argument doesn't exist, create a new AppSettings with this data.
     */
    create: XOR<AppSettingsCreateInput, AppSettingsUncheckedCreateInput>
    /**
     * In case the AppSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppSettingsUpdateInput, AppSettingsUncheckedUpdateInput>
  }

  /**
   * AppSettings delete
   */
  export type AppSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
    /**
     * Filter which AppSettings to delete.
     */
    where: AppSettingsWhereUniqueInput
  }

  /**
   * AppSettings deleteMany
   */
  export type AppSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppSettings to delete
     */
    where?: AppSettingsWhereInput
  }

  /**
   * AppSettings without action
   */
  export type AppSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSettings
     */
    select?: AppSettingsSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const QuestionScalarFieldEnum: {
    id: 'id',
    externalId: 'externalId',
    examPart: 'examPart',
    examExercise: 'examExercise',
    topicNumber: 'topicNumber',
    topicTitle: 'topicTitle',
    section: 'section',
    subsection: 'subsection',
    questionType: 'questionType',
    difficulty: 'difficulty',
    text: 'text',
    explanation: 'explanation',
    sourceDocument: 'sourceDocument',
    sourceReference: 'sourceReference',
    tagsJson: 'tagsJson',
    status: 'status',
    isDemo: 'isDemo',
    isFavorite: 'isFavorite',
    isDoubtful: 'isDoubtful',
    isArchived: 'isArchived',
    reserveOrder: 'reserveOrder',
    caseStudyId: 'caseStudyId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type QuestionScalarFieldEnum = (typeof QuestionScalarFieldEnum)[keyof typeof QuestionScalarFieldEnum]


  export const OptionScalarFieldEnum: {
    id: 'id',
    questionId: 'questionId',
    label: 'label',
    text: 'text',
    isCorrect: 'isCorrect',
    explanation: 'explanation'
  };

  export type OptionScalarFieldEnum = (typeof OptionScalarFieldEnum)[keyof typeof OptionScalarFieldEnum]


  export const CaseStudyScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    topicNumber: 'topicNumber',
    section: 'section',
    source: 'source'
  };

  export type CaseStudyScalarFieldEnum = (typeof CaseStudyScalarFieldEnum)[keyof typeof CaseStudyScalarFieldEnum]


  export const ImportBatchScalarFieldEnum: {
    id: 'id',
    filename: 'filename',
    importedAt: 'importedAt',
    sourceMetadataJson: 'sourceMetadataJson',
    totalQuestionsDetected: 'totalQuestionsDetected',
    createdCount: 'createdCount',
    updatedCount: 'updatedCount',
    skippedCount: 'skippedCount',
    errorCount: 'errorCount',
    warningsJson: 'warningsJson',
    rawSummaryJson: 'rawSummaryJson',
    revertedAt: 'revertedAt'
  };

  export type ImportBatchScalarFieldEnum = (typeof ImportBatchScalarFieldEnum)[keyof typeof ImportBatchScalarFieldEnum]


  export const ImportBatchQuestionScalarFieldEnum: {
    id: 'id',
    importBatchId: 'importBatchId',
    questionId: 'questionId',
    externalId: 'externalId',
    action: 'action',
    warningsJson: 'warningsJson',
    errorsJson: 'errorsJson',
    previousDataJson: 'previousDataJson',
    importedDataJson: 'importedDataJson'
  };

  export type ImportBatchQuestionScalarFieldEnum = (typeof ImportBatchQuestionScalarFieldEnum)[keyof typeof ImportBatchQuestionScalarFieldEnum]


  export const TestSessionScalarFieldEnum: {
    id: 'id',
    mode: 'mode',
    startedAt: 'startedAt',
    finishedAt: 'finishedAt',
    durationSeconds: 'durationSeconds',
    status: 'status',
    examExercise: 'examExercise',
    questionIdsJson: 'questionIdsJson',
    totalQuestions: 'totalQuestions',
    score: 'score',
    maxScore: 'maxScore',
    passed: 'passed',
    correctCount: 'correctCount',
    wrongCount: 'wrongCount',
    blankCount: 'blankCount',
    averageTimePerQuestion: 'averageTimePerQuestion',
    topicFilter: 'topicFilter',
    sectionFilter: 'sectionFilter',
    includeStatusesJson: 'includeStatusesJson',
    summaryJson: 'summaryJson'
  };

  export type TestSessionScalarFieldEnum = (typeof TestSessionScalarFieldEnum)[keyof typeof TestSessionScalarFieldEnum]


  export const TestAnswerScalarFieldEnum: {
    id: 'id',
    testSessionId: 'testSessionId',
    questionId: 'questionId',
    selectedOptionId: 'selectedOptionId',
    isCorrect: 'isCorrect',
    isBlank: 'isBlank',
    confidence: 'confidence',
    timeSpentSeconds: 'timeSpentSeconds',
    answeredAt: 'answeredAt'
  };

  export type TestAnswerScalarFieldEnum = (typeof TestAnswerScalarFieldEnum)[keyof typeof TestAnswerScalarFieldEnum]


  export const ReviewQueueScalarFieldEnum: {
    questionId: 'questionId',
    nextReviewAt: 'nextReviewAt',
    intervalDays: 'intervalDays',
    easeFactor: 'easeFactor',
    masteryLevel: 'masteryLevel',
    lastResult: 'lastResult',
    totalAttempts: 'totalAttempts',
    correctAttempts: 'correctAttempts',
    wrongAttempts: 'wrongAttempts',
    lastReviewedAt: 'lastReviewedAt'
  };

  export type ReviewQueueScalarFieldEnum = (typeof ReviewQueueScalarFieldEnum)[keyof typeof ReviewQueueScalarFieldEnum]


  export const AchievementScalarFieldEnum: {
    id: 'id',
    code: 'code',
    title: 'title',
    description: 'description',
    unlockedAt: 'unlockedAt'
  };

  export type AchievementScalarFieldEnum = (typeof AchievementScalarFieldEnum)[keyof typeof AchievementScalarFieldEnum]


  export const UserProgressScalarFieldEnum: {
    id: 'id',
    scopeType: 'scopeType',
    scopeKey: 'scopeKey',
    topicNumber: 'topicNumber',
    section: 'section',
    attempts: 'attempts',
    correctCount: 'correctCount',
    wrongCount: 'wrongCount',
    blankCount: 'blankCount',
    lastAttemptAt: 'lastAttemptAt',
    masteryLevel: 'masteryLevel',
    xp: 'xp',
    questionId: 'questionId'
  };

  export type UserProgressScalarFieldEnum = (typeof UserProgressScalarFieldEnum)[keyof typeof UserProgressScalarFieldEnum]


  export const AppSettingsScalarFieldEnum: {
    id: 'id',
    targetExamDate: 'targetExamDate',
    weeklyGoal: 'weeklyGoal',
    dailyGoal: 'dailyGoal',
    weakPointMinimumSample: 'weakPointMinimumSample',
    wrongAnswerPenaltyFraction: 'wrongAnswerPenaltyFraction',
    minimumQuestionStatus: 'minimumQuestionStatus',
    qualityRequiresExplanation: 'qualityRequiresExplanation',
    visualPreferencesJson: 'visualPreferencesJson',
    updatedAt: 'updatedAt'
  };

  export type AppSettingsScalarFieldEnum = (typeof AppSettingsScalarFieldEnum)[keyof typeof AppSettingsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type QuestionWhereInput = {
    AND?: QuestionWhereInput | QuestionWhereInput[]
    OR?: QuestionWhereInput[]
    NOT?: QuestionWhereInput | QuestionWhereInput[]
    id?: StringFilter<"Question"> | string
    externalId?: StringFilter<"Question"> | string
    examPart?: StringFilter<"Question"> | string
    examExercise?: StringFilter<"Question"> | string
    topicNumber?: IntFilter<"Question"> | number
    topicTitle?: StringFilter<"Question"> | string
    section?: StringFilter<"Question"> | string
    subsection?: StringNullableFilter<"Question"> | string | null
    questionType?: StringFilter<"Question"> | string
    difficulty?: StringFilter<"Question"> | string
    text?: StringFilter<"Question"> | string
    explanation?: StringNullableFilter<"Question"> | string | null
    sourceDocument?: StringNullableFilter<"Question"> | string | null
    sourceReference?: StringNullableFilter<"Question"> | string | null
    tagsJson?: StringFilter<"Question"> | string
    status?: StringFilter<"Question"> | string
    isDemo?: BoolFilter<"Question"> | boolean
    isFavorite?: BoolFilter<"Question"> | boolean
    isDoubtful?: BoolFilter<"Question"> | boolean
    isArchived?: BoolFilter<"Question"> | boolean
    reserveOrder?: IntNullableFilter<"Question"> | number | null
    caseStudyId?: StringNullableFilter<"Question"> | string | null
    createdAt?: DateTimeFilter<"Question"> | Date | string
    updatedAt?: DateTimeFilter<"Question"> | Date | string
    caseStudy?: XOR<CaseStudyNullableRelationFilter, CaseStudyWhereInput> | null
    options?: OptionListRelationFilter
    testAnswers?: TestAnswerListRelationFilter
    reviewQueue?: XOR<ReviewQueueNullableRelationFilter, ReviewQueueWhereInput> | null
    importEvents?: ImportBatchQuestionListRelationFilter
    progressSnapshots?: UserProgressListRelationFilter
  }

  export type QuestionOrderByWithRelationInput = {
    id?: SortOrder
    externalId?: SortOrder
    examPart?: SortOrder
    examExercise?: SortOrder
    topicNumber?: SortOrder
    topicTitle?: SortOrder
    section?: SortOrder
    subsection?: SortOrderInput | SortOrder
    questionType?: SortOrder
    difficulty?: SortOrder
    text?: SortOrder
    explanation?: SortOrderInput | SortOrder
    sourceDocument?: SortOrderInput | SortOrder
    sourceReference?: SortOrderInput | SortOrder
    tagsJson?: SortOrder
    status?: SortOrder
    isDemo?: SortOrder
    isFavorite?: SortOrder
    isDoubtful?: SortOrder
    isArchived?: SortOrder
    reserveOrder?: SortOrderInput | SortOrder
    caseStudyId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    caseStudy?: CaseStudyOrderByWithRelationInput
    options?: OptionOrderByRelationAggregateInput
    testAnswers?: TestAnswerOrderByRelationAggregateInput
    reviewQueue?: ReviewQueueOrderByWithRelationInput
    importEvents?: ImportBatchQuestionOrderByRelationAggregateInput
    progressSnapshots?: UserProgressOrderByRelationAggregateInput
  }

  export type QuestionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    externalId?: string
    AND?: QuestionWhereInput | QuestionWhereInput[]
    OR?: QuestionWhereInput[]
    NOT?: QuestionWhereInput | QuestionWhereInput[]
    examPart?: StringFilter<"Question"> | string
    examExercise?: StringFilter<"Question"> | string
    topicNumber?: IntFilter<"Question"> | number
    topicTitle?: StringFilter<"Question"> | string
    section?: StringFilter<"Question"> | string
    subsection?: StringNullableFilter<"Question"> | string | null
    questionType?: StringFilter<"Question"> | string
    difficulty?: StringFilter<"Question"> | string
    text?: StringFilter<"Question"> | string
    explanation?: StringNullableFilter<"Question"> | string | null
    sourceDocument?: StringNullableFilter<"Question"> | string | null
    sourceReference?: StringNullableFilter<"Question"> | string | null
    tagsJson?: StringFilter<"Question"> | string
    status?: StringFilter<"Question"> | string
    isDemo?: BoolFilter<"Question"> | boolean
    isFavorite?: BoolFilter<"Question"> | boolean
    isDoubtful?: BoolFilter<"Question"> | boolean
    isArchived?: BoolFilter<"Question"> | boolean
    reserveOrder?: IntNullableFilter<"Question"> | number | null
    caseStudyId?: StringNullableFilter<"Question"> | string | null
    createdAt?: DateTimeFilter<"Question"> | Date | string
    updatedAt?: DateTimeFilter<"Question"> | Date | string
    caseStudy?: XOR<CaseStudyNullableRelationFilter, CaseStudyWhereInput> | null
    options?: OptionListRelationFilter
    testAnswers?: TestAnswerListRelationFilter
    reviewQueue?: XOR<ReviewQueueNullableRelationFilter, ReviewQueueWhereInput> | null
    importEvents?: ImportBatchQuestionListRelationFilter
    progressSnapshots?: UserProgressListRelationFilter
  }, "id" | "externalId">

  export type QuestionOrderByWithAggregationInput = {
    id?: SortOrder
    externalId?: SortOrder
    examPart?: SortOrder
    examExercise?: SortOrder
    topicNumber?: SortOrder
    topicTitle?: SortOrder
    section?: SortOrder
    subsection?: SortOrderInput | SortOrder
    questionType?: SortOrder
    difficulty?: SortOrder
    text?: SortOrder
    explanation?: SortOrderInput | SortOrder
    sourceDocument?: SortOrderInput | SortOrder
    sourceReference?: SortOrderInput | SortOrder
    tagsJson?: SortOrder
    status?: SortOrder
    isDemo?: SortOrder
    isFavorite?: SortOrder
    isDoubtful?: SortOrder
    isArchived?: SortOrder
    reserveOrder?: SortOrderInput | SortOrder
    caseStudyId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: QuestionCountOrderByAggregateInput
    _avg?: QuestionAvgOrderByAggregateInput
    _max?: QuestionMaxOrderByAggregateInput
    _min?: QuestionMinOrderByAggregateInput
    _sum?: QuestionSumOrderByAggregateInput
  }

  export type QuestionScalarWhereWithAggregatesInput = {
    AND?: QuestionScalarWhereWithAggregatesInput | QuestionScalarWhereWithAggregatesInput[]
    OR?: QuestionScalarWhereWithAggregatesInput[]
    NOT?: QuestionScalarWhereWithAggregatesInput | QuestionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Question"> | string
    externalId?: StringWithAggregatesFilter<"Question"> | string
    examPart?: StringWithAggregatesFilter<"Question"> | string
    examExercise?: StringWithAggregatesFilter<"Question"> | string
    topicNumber?: IntWithAggregatesFilter<"Question"> | number
    topicTitle?: StringWithAggregatesFilter<"Question"> | string
    section?: StringWithAggregatesFilter<"Question"> | string
    subsection?: StringNullableWithAggregatesFilter<"Question"> | string | null
    questionType?: StringWithAggregatesFilter<"Question"> | string
    difficulty?: StringWithAggregatesFilter<"Question"> | string
    text?: StringWithAggregatesFilter<"Question"> | string
    explanation?: StringNullableWithAggregatesFilter<"Question"> | string | null
    sourceDocument?: StringNullableWithAggregatesFilter<"Question"> | string | null
    sourceReference?: StringNullableWithAggregatesFilter<"Question"> | string | null
    tagsJson?: StringWithAggregatesFilter<"Question"> | string
    status?: StringWithAggregatesFilter<"Question"> | string
    isDemo?: BoolWithAggregatesFilter<"Question"> | boolean
    isFavorite?: BoolWithAggregatesFilter<"Question"> | boolean
    isDoubtful?: BoolWithAggregatesFilter<"Question"> | boolean
    isArchived?: BoolWithAggregatesFilter<"Question"> | boolean
    reserveOrder?: IntNullableWithAggregatesFilter<"Question"> | number | null
    caseStudyId?: StringNullableWithAggregatesFilter<"Question"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Question"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Question"> | Date | string
  }

  export type OptionWhereInput = {
    AND?: OptionWhereInput | OptionWhereInput[]
    OR?: OptionWhereInput[]
    NOT?: OptionWhereInput | OptionWhereInput[]
    id?: StringFilter<"Option"> | string
    questionId?: StringFilter<"Option"> | string
    label?: StringFilter<"Option"> | string
    text?: StringFilter<"Option"> | string
    isCorrect?: BoolFilter<"Option"> | boolean
    explanation?: StringNullableFilter<"Option"> | string | null
    question?: XOR<QuestionRelationFilter, QuestionWhereInput>
  }

  export type OptionOrderByWithRelationInput = {
    id?: SortOrder
    questionId?: SortOrder
    label?: SortOrder
    text?: SortOrder
    isCorrect?: SortOrder
    explanation?: SortOrderInput | SortOrder
    question?: QuestionOrderByWithRelationInput
  }

  export type OptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    questionId_label?: OptionQuestionIdLabelCompoundUniqueInput
    AND?: OptionWhereInput | OptionWhereInput[]
    OR?: OptionWhereInput[]
    NOT?: OptionWhereInput | OptionWhereInput[]
    questionId?: StringFilter<"Option"> | string
    label?: StringFilter<"Option"> | string
    text?: StringFilter<"Option"> | string
    isCorrect?: BoolFilter<"Option"> | boolean
    explanation?: StringNullableFilter<"Option"> | string | null
    question?: XOR<QuestionRelationFilter, QuestionWhereInput>
  }, "id" | "questionId_label">

  export type OptionOrderByWithAggregationInput = {
    id?: SortOrder
    questionId?: SortOrder
    label?: SortOrder
    text?: SortOrder
    isCorrect?: SortOrder
    explanation?: SortOrderInput | SortOrder
    _count?: OptionCountOrderByAggregateInput
    _max?: OptionMaxOrderByAggregateInput
    _min?: OptionMinOrderByAggregateInput
  }

  export type OptionScalarWhereWithAggregatesInput = {
    AND?: OptionScalarWhereWithAggregatesInput | OptionScalarWhereWithAggregatesInput[]
    OR?: OptionScalarWhereWithAggregatesInput[]
    NOT?: OptionScalarWhereWithAggregatesInput | OptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Option"> | string
    questionId?: StringWithAggregatesFilter<"Option"> | string
    label?: StringWithAggregatesFilter<"Option"> | string
    text?: StringWithAggregatesFilter<"Option"> | string
    isCorrect?: BoolWithAggregatesFilter<"Option"> | boolean
    explanation?: StringNullableWithAggregatesFilter<"Option"> | string | null
  }

  export type CaseStudyWhereInput = {
    AND?: CaseStudyWhereInput | CaseStudyWhereInput[]
    OR?: CaseStudyWhereInput[]
    NOT?: CaseStudyWhereInput | CaseStudyWhereInput[]
    id?: StringFilter<"CaseStudy"> | string
    title?: StringFilter<"CaseStudy"> | string
    description?: StringNullableFilter<"CaseStudy"> | string | null
    topicNumber?: IntNullableFilter<"CaseStudy"> | number | null
    section?: StringNullableFilter<"CaseStudy"> | string | null
    source?: StringNullableFilter<"CaseStudy"> | string | null
    questions?: QuestionListRelationFilter
  }

  export type CaseStudyOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    topicNumber?: SortOrderInput | SortOrder
    section?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    questions?: QuestionOrderByRelationAggregateInput
  }

  export type CaseStudyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CaseStudyWhereInput | CaseStudyWhereInput[]
    OR?: CaseStudyWhereInput[]
    NOT?: CaseStudyWhereInput | CaseStudyWhereInput[]
    title?: StringFilter<"CaseStudy"> | string
    description?: StringNullableFilter<"CaseStudy"> | string | null
    topicNumber?: IntNullableFilter<"CaseStudy"> | number | null
    section?: StringNullableFilter<"CaseStudy"> | string | null
    source?: StringNullableFilter<"CaseStudy"> | string | null
    questions?: QuestionListRelationFilter
  }, "id">

  export type CaseStudyOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    topicNumber?: SortOrderInput | SortOrder
    section?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    _count?: CaseStudyCountOrderByAggregateInput
    _avg?: CaseStudyAvgOrderByAggregateInput
    _max?: CaseStudyMaxOrderByAggregateInput
    _min?: CaseStudyMinOrderByAggregateInput
    _sum?: CaseStudySumOrderByAggregateInput
  }

  export type CaseStudyScalarWhereWithAggregatesInput = {
    AND?: CaseStudyScalarWhereWithAggregatesInput | CaseStudyScalarWhereWithAggregatesInput[]
    OR?: CaseStudyScalarWhereWithAggregatesInput[]
    NOT?: CaseStudyScalarWhereWithAggregatesInput | CaseStudyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CaseStudy"> | string
    title?: StringWithAggregatesFilter<"CaseStudy"> | string
    description?: StringNullableWithAggregatesFilter<"CaseStudy"> | string | null
    topicNumber?: IntNullableWithAggregatesFilter<"CaseStudy"> | number | null
    section?: StringNullableWithAggregatesFilter<"CaseStudy"> | string | null
    source?: StringNullableWithAggregatesFilter<"CaseStudy"> | string | null
  }

  export type ImportBatchWhereInput = {
    AND?: ImportBatchWhereInput | ImportBatchWhereInput[]
    OR?: ImportBatchWhereInput[]
    NOT?: ImportBatchWhereInput | ImportBatchWhereInput[]
    id?: StringFilter<"ImportBatch"> | string
    filename?: StringFilter<"ImportBatch"> | string
    importedAt?: DateTimeFilter<"ImportBatch"> | Date | string
    sourceMetadataJson?: StringNullableFilter<"ImportBatch"> | string | null
    totalQuestionsDetected?: IntFilter<"ImportBatch"> | number
    createdCount?: IntFilter<"ImportBatch"> | number
    updatedCount?: IntFilter<"ImportBatch"> | number
    skippedCount?: IntFilter<"ImportBatch"> | number
    errorCount?: IntFilter<"ImportBatch"> | number
    warningsJson?: StringNullableFilter<"ImportBatch"> | string | null
    rawSummaryJson?: StringNullableFilter<"ImportBatch"> | string | null
    revertedAt?: DateTimeNullableFilter<"ImportBatch"> | Date | string | null
    items?: ImportBatchQuestionListRelationFilter
  }

  export type ImportBatchOrderByWithRelationInput = {
    id?: SortOrder
    filename?: SortOrder
    importedAt?: SortOrder
    sourceMetadataJson?: SortOrderInput | SortOrder
    totalQuestionsDetected?: SortOrder
    createdCount?: SortOrder
    updatedCount?: SortOrder
    skippedCount?: SortOrder
    errorCount?: SortOrder
    warningsJson?: SortOrderInput | SortOrder
    rawSummaryJson?: SortOrderInput | SortOrder
    revertedAt?: SortOrderInput | SortOrder
    items?: ImportBatchQuestionOrderByRelationAggregateInput
  }

  export type ImportBatchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ImportBatchWhereInput | ImportBatchWhereInput[]
    OR?: ImportBatchWhereInput[]
    NOT?: ImportBatchWhereInput | ImportBatchWhereInput[]
    filename?: StringFilter<"ImportBatch"> | string
    importedAt?: DateTimeFilter<"ImportBatch"> | Date | string
    sourceMetadataJson?: StringNullableFilter<"ImportBatch"> | string | null
    totalQuestionsDetected?: IntFilter<"ImportBatch"> | number
    createdCount?: IntFilter<"ImportBatch"> | number
    updatedCount?: IntFilter<"ImportBatch"> | number
    skippedCount?: IntFilter<"ImportBatch"> | number
    errorCount?: IntFilter<"ImportBatch"> | number
    warningsJson?: StringNullableFilter<"ImportBatch"> | string | null
    rawSummaryJson?: StringNullableFilter<"ImportBatch"> | string | null
    revertedAt?: DateTimeNullableFilter<"ImportBatch"> | Date | string | null
    items?: ImportBatchQuestionListRelationFilter
  }, "id">

  export type ImportBatchOrderByWithAggregationInput = {
    id?: SortOrder
    filename?: SortOrder
    importedAt?: SortOrder
    sourceMetadataJson?: SortOrderInput | SortOrder
    totalQuestionsDetected?: SortOrder
    createdCount?: SortOrder
    updatedCount?: SortOrder
    skippedCount?: SortOrder
    errorCount?: SortOrder
    warningsJson?: SortOrderInput | SortOrder
    rawSummaryJson?: SortOrderInput | SortOrder
    revertedAt?: SortOrderInput | SortOrder
    _count?: ImportBatchCountOrderByAggregateInput
    _avg?: ImportBatchAvgOrderByAggregateInput
    _max?: ImportBatchMaxOrderByAggregateInput
    _min?: ImportBatchMinOrderByAggregateInput
    _sum?: ImportBatchSumOrderByAggregateInput
  }

  export type ImportBatchScalarWhereWithAggregatesInput = {
    AND?: ImportBatchScalarWhereWithAggregatesInput | ImportBatchScalarWhereWithAggregatesInput[]
    OR?: ImportBatchScalarWhereWithAggregatesInput[]
    NOT?: ImportBatchScalarWhereWithAggregatesInput | ImportBatchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ImportBatch"> | string
    filename?: StringWithAggregatesFilter<"ImportBatch"> | string
    importedAt?: DateTimeWithAggregatesFilter<"ImportBatch"> | Date | string
    sourceMetadataJson?: StringNullableWithAggregatesFilter<"ImportBatch"> | string | null
    totalQuestionsDetected?: IntWithAggregatesFilter<"ImportBatch"> | number
    createdCount?: IntWithAggregatesFilter<"ImportBatch"> | number
    updatedCount?: IntWithAggregatesFilter<"ImportBatch"> | number
    skippedCount?: IntWithAggregatesFilter<"ImportBatch"> | number
    errorCount?: IntWithAggregatesFilter<"ImportBatch"> | number
    warningsJson?: StringNullableWithAggregatesFilter<"ImportBatch"> | string | null
    rawSummaryJson?: StringNullableWithAggregatesFilter<"ImportBatch"> | string | null
    revertedAt?: DateTimeNullableWithAggregatesFilter<"ImportBatch"> | Date | string | null
  }

  export type ImportBatchQuestionWhereInput = {
    AND?: ImportBatchQuestionWhereInput | ImportBatchQuestionWhereInput[]
    OR?: ImportBatchQuestionWhereInput[]
    NOT?: ImportBatchQuestionWhereInput | ImportBatchQuestionWhereInput[]
    id?: StringFilter<"ImportBatchQuestion"> | string
    importBatchId?: StringFilter<"ImportBatchQuestion"> | string
    questionId?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    externalId?: StringFilter<"ImportBatchQuestion"> | string
    action?: StringFilter<"ImportBatchQuestion"> | string
    warningsJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    errorsJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    previousDataJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    importedDataJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    importBatch?: XOR<ImportBatchRelationFilter, ImportBatchWhereInput>
    question?: XOR<QuestionNullableRelationFilter, QuestionWhereInput> | null
  }

  export type ImportBatchQuestionOrderByWithRelationInput = {
    id?: SortOrder
    importBatchId?: SortOrder
    questionId?: SortOrderInput | SortOrder
    externalId?: SortOrder
    action?: SortOrder
    warningsJson?: SortOrderInput | SortOrder
    errorsJson?: SortOrderInput | SortOrder
    previousDataJson?: SortOrderInput | SortOrder
    importedDataJson?: SortOrderInput | SortOrder
    importBatch?: ImportBatchOrderByWithRelationInput
    question?: QuestionOrderByWithRelationInput
  }

  export type ImportBatchQuestionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ImportBatchQuestionWhereInput | ImportBatchQuestionWhereInput[]
    OR?: ImportBatchQuestionWhereInput[]
    NOT?: ImportBatchQuestionWhereInput | ImportBatchQuestionWhereInput[]
    importBatchId?: StringFilter<"ImportBatchQuestion"> | string
    questionId?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    externalId?: StringFilter<"ImportBatchQuestion"> | string
    action?: StringFilter<"ImportBatchQuestion"> | string
    warningsJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    errorsJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    previousDataJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    importedDataJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    importBatch?: XOR<ImportBatchRelationFilter, ImportBatchWhereInput>
    question?: XOR<QuestionNullableRelationFilter, QuestionWhereInput> | null
  }, "id">

  export type ImportBatchQuestionOrderByWithAggregationInput = {
    id?: SortOrder
    importBatchId?: SortOrder
    questionId?: SortOrderInput | SortOrder
    externalId?: SortOrder
    action?: SortOrder
    warningsJson?: SortOrderInput | SortOrder
    errorsJson?: SortOrderInput | SortOrder
    previousDataJson?: SortOrderInput | SortOrder
    importedDataJson?: SortOrderInput | SortOrder
    _count?: ImportBatchQuestionCountOrderByAggregateInput
    _max?: ImportBatchQuestionMaxOrderByAggregateInput
    _min?: ImportBatchQuestionMinOrderByAggregateInput
  }

  export type ImportBatchQuestionScalarWhereWithAggregatesInput = {
    AND?: ImportBatchQuestionScalarWhereWithAggregatesInput | ImportBatchQuestionScalarWhereWithAggregatesInput[]
    OR?: ImportBatchQuestionScalarWhereWithAggregatesInput[]
    NOT?: ImportBatchQuestionScalarWhereWithAggregatesInput | ImportBatchQuestionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ImportBatchQuestion"> | string
    importBatchId?: StringWithAggregatesFilter<"ImportBatchQuestion"> | string
    questionId?: StringNullableWithAggregatesFilter<"ImportBatchQuestion"> | string | null
    externalId?: StringWithAggregatesFilter<"ImportBatchQuestion"> | string
    action?: StringWithAggregatesFilter<"ImportBatchQuestion"> | string
    warningsJson?: StringNullableWithAggregatesFilter<"ImportBatchQuestion"> | string | null
    errorsJson?: StringNullableWithAggregatesFilter<"ImportBatchQuestion"> | string | null
    previousDataJson?: StringNullableWithAggregatesFilter<"ImportBatchQuestion"> | string | null
    importedDataJson?: StringNullableWithAggregatesFilter<"ImportBatchQuestion"> | string | null
  }

  export type TestSessionWhereInput = {
    AND?: TestSessionWhereInput | TestSessionWhereInput[]
    OR?: TestSessionWhereInput[]
    NOT?: TestSessionWhereInput | TestSessionWhereInput[]
    id?: StringFilter<"TestSession"> | string
    mode?: StringFilter<"TestSession"> | string
    startedAt?: DateTimeFilter<"TestSession"> | Date | string
    finishedAt?: DateTimeNullableFilter<"TestSession"> | Date | string | null
    durationSeconds?: IntNullableFilter<"TestSession"> | number | null
    status?: StringFilter<"TestSession"> | string
    examExercise?: StringFilter<"TestSession"> | string
    questionIdsJson?: StringFilter<"TestSession"> | string
    totalQuestions?: IntFilter<"TestSession"> | number
    score?: FloatNullableFilter<"TestSession"> | number | null
    maxScore?: FloatFilter<"TestSession"> | number
    passed?: BoolNullableFilter<"TestSession"> | boolean | null
    correctCount?: IntFilter<"TestSession"> | number
    wrongCount?: IntFilter<"TestSession"> | number
    blankCount?: IntFilter<"TestSession"> | number
    averageTimePerQuestion?: FloatNullableFilter<"TestSession"> | number | null
    topicFilter?: StringNullableFilter<"TestSession"> | string | null
    sectionFilter?: StringNullableFilter<"TestSession"> | string | null
    includeStatusesJson?: StringNullableFilter<"TestSession"> | string | null
    summaryJson?: StringNullableFilter<"TestSession"> | string | null
    answers?: TestAnswerListRelationFilter
  }

  export type TestSessionOrderByWithRelationInput = {
    id?: SortOrder
    mode?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    status?: SortOrder
    examExercise?: SortOrder
    questionIdsJson?: SortOrder
    totalQuestions?: SortOrder
    score?: SortOrderInput | SortOrder
    maxScore?: SortOrder
    passed?: SortOrderInput | SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    averageTimePerQuestion?: SortOrderInput | SortOrder
    topicFilter?: SortOrderInput | SortOrder
    sectionFilter?: SortOrderInput | SortOrder
    includeStatusesJson?: SortOrderInput | SortOrder
    summaryJson?: SortOrderInput | SortOrder
    answers?: TestAnswerOrderByRelationAggregateInput
  }

  export type TestSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TestSessionWhereInput | TestSessionWhereInput[]
    OR?: TestSessionWhereInput[]
    NOT?: TestSessionWhereInput | TestSessionWhereInput[]
    mode?: StringFilter<"TestSession"> | string
    startedAt?: DateTimeFilter<"TestSession"> | Date | string
    finishedAt?: DateTimeNullableFilter<"TestSession"> | Date | string | null
    durationSeconds?: IntNullableFilter<"TestSession"> | number | null
    status?: StringFilter<"TestSession"> | string
    examExercise?: StringFilter<"TestSession"> | string
    questionIdsJson?: StringFilter<"TestSession"> | string
    totalQuestions?: IntFilter<"TestSession"> | number
    score?: FloatNullableFilter<"TestSession"> | number | null
    maxScore?: FloatFilter<"TestSession"> | number
    passed?: BoolNullableFilter<"TestSession"> | boolean | null
    correctCount?: IntFilter<"TestSession"> | number
    wrongCount?: IntFilter<"TestSession"> | number
    blankCount?: IntFilter<"TestSession"> | number
    averageTimePerQuestion?: FloatNullableFilter<"TestSession"> | number | null
    topicFilter?: StringNullableFilter<"TestSession"> | string | null
    sectionFilter?: StringNullableFilter<"TestSession"> | string | null
    includeStatusesJson?: StringNullableFilter<"TestSession"> | string | null
    summaryJson?: StringNullableFilter<"TestSession"> | string | null
    answers?: TestAnswerListRelationFilter
  }, "id">

  export type TestSessionOrderByWithAggregationInput = {
    id?: SortOrder
    mode?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    status?: SortOrder
    examExercise?: SortOrder
    questionIdsJson?: SortOrder
    totalQuestions?: SortOrder
    score?: SortOrderInput | SortOrder
    maxScore?: SortOrder
    passed?: SortOrderInput | SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    averageTimePerQuestion?: SortOrderInput | SortOrder
    topicFilter?: SortOrderInput | SortOrder
    sectionFilter?: SortOrderInput | SortOrder
    includeStatusesJson?: SortOrderInput | SortOrder
    summaryJson?: SortOrderInput | SortOrder
    _count?: TestSessionCountOrderByAggregateInput
    _avg?: TestSessionAvgOrderByAggregateInput
    _max?: TestSessionMaxOrderByAggregateInput
    _min?: TestSessionMinOrderByAggregateInput
    _sum?: TestSessionSumOrderByAggregateInput
  }

  export type TestSessionScalarWhereWithAggregatesInput = {
    AND?: TestSessionScalarWhereWithAggregatesInput | TestSessionScalarWhereWithAggregatesInput[]
    OR?: TestSessionScalarWhereWithAggregatesInput[]
    NOT?: TestSessionScalarWhereWithAggregatesInput | TestSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TestSession"> | string
    mode?: StringWithAggregatesFilter<"TestSession"> | string
    startedAt?: DateTimeWithAggregatesFilter<"TestSession"> | Date | string
    finishedAt?: DateTimeNullableWithAggregatesFilter<"TestSession"> | Date | string | null
    durationSeconds?: IntNullableWithAggregatesFilter<"TestSession"> | number | null
    status?: StringWithAggregatesFilter<"TestSession"> | string
    examExercise?: StringWithAggregatesFilter<"TestSession"> | string
    questionIdsJson?: StringWithAggregatesFilter<"TestSession"> | string
    totalQuestions?: IntWithAggregatesFilter<"TestSession"> | number
    score?: FloatNullableWithAggregatesFilter<"TestSession"> | number | null
    maxScore?: FloatWithAggregatesFilter<"TestSession"> | number
    passed?: BoolNullableWithAggregatesFilter<"TestSession"> | boolean | null
    correctCount?: IntWithAggregatesFilter<"TestSession"> | number
    wrongCount?: IntWithAggregatesFilter<"TestSession"> | number
    blankCount?: IntWithAggregatesFilter<"TestSession"> | number
    averageTimePerQuestion?: FloatNullableWithAggregatesFilter<"TestSession"> | number | null
    topicFilter?: StringNullableWithAggregatesFilter<"TestSession"> | string | null
    sectionFilter?: StringNullableWithAggregatesFilter<"TestSession"> | string | null
    includeStatusesJson?: StringNullableWithAggregatesFilter<"TestSession"> | string | null
    summaryJson?: StringNullableWithAggregatesFilter<"TestSession"> | string | null
  }

  export type TestAnswerWhereInput = {
    AND?: TestAnswerWhereInput | TestAnswerWhereInput[]
    OR?: TestAnswerWhereInput[]
    NOT?: TestAnswerWhereInput | TestAnswerWhereInput[]
    id?: StringFilter<"TestAnswer"> | string
    testSessionId?: StringFilter<"TestAnswer"> | string
    questionId?: StringFilter<"TestAnswer"> | string
    selectedOptionId?: StringNullableFilter<"TestAnswer"> | string | null
    isCorrect?: BoolFilter<"TestAnswer"> | boolean
    isBlank?: BoolFilter<"TestAnswer"> | boolean
    confidence?: StringNullableFilter<"TestAnswer"> | string | null
    timeSpentSeconds?: IntNullableFilter<"TestAnswer"> | number | null
    answeredAt?: DateTimeFilter<"TestAnswer"> | Date | string
    testSession?: XOR<TestSessionRelationFilter, TestSessionWhereInput>
    question?: XOR<QuestionRelationFilter, QuestionWhereInput>
  }

  export type TestAnswerOrderByWithRelationInput = {
    id?: SortOrder
    testSessionId?: SortOrder
    questionId?: SortOrder
    selectedOptionId?: SortOrderInput | SortOrder
    isCorrect?: SortOrder
    isBlank?: SortOrder
    confidence?: SortOrderInput | SortOrder
    timeSpentSeconds?: SortOrderInput | SortOrder
    answeredAt?: SortOrder
    testSession?: TestSessionOrderByWithRelationInput
    question?: QuestionOrderByWithRelationInput
  }

  export type TestAnswerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TestAnswerWhereInput | TestAnswerWhereInput[]
    OR?: TestAnswerWhereInput[]
    NOT?: TestAnswerWhereInput | TestAnswerWhereInput[]
    testSessionId?: StringFilter<"TestAnswer"> | string
    questionId?: StringFilter<"TestAnswer"> | string
    selectedOptionId?: StringNullableFilter<"TestAnswer"> | string | null
    isCorrect?: BoolFilter<"TestAnswer"> | boolean
    isBlank?: BoolFilter<"TestAnswer"> | boolean
    confidence?: StringNullableFilter<"TestAnswer"> | string | null
    timeSpentSeconds?: IntNullableFilter<"TestAnswer"> | number | null
    answeredAt?: DateTimeFilter<"TestAnswer"> | Date | string
    testSession?: XOR<TestSessionRelationFilter, TestSessionWhereInput>
    question?: XOR<QuestionRelationFilter, QuestionWhereInput>
  }, "id">

  export type TestAnswerOrderByWithAggregationInput = {
    id?: SortOrder
    testSessionId?: SortOrder
    questionId?: SortOrder
    selectedOptionId?: SortOrderInput | SortOrder
    isCorrect?: SortOrder
    isBlank?: SortOrder
    confidence?: SortOrderInput | SortOrder
    timeSpentSeconds?: SortOrderInput | SortOrder
    answeredAt?: SortOrder
    _count?: TestAnswerCountOrderByAggregateInput
    _avg?: TestAnswerAvgOrderByAggregateInput
    _max?: TestAnswerMaxOrderByAggregateInput
    _min?: TestAnswerMinOrderByAggregateInput
    _sum?: TestAnswerSumOrderByAggregateInput
  }

  export type TestAnswerScalarWhereWithAggregatesInput = {
    AND?: TestAnswerScalarWhereWithAggregatesInput | TestAnswerScalarWhereWithAggregatesInput[]
    OR?: TestAnswerScalarWhereWithAggregatesInput[]
    NOT?: TestAnswerScalarWhereWithAggregatesInput | TestAnswerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TestAnswer"> | string
    testSessionId?: StringWithAggregatesFilter<"TestAnswer"> | string
    questionId?: StringWithAggregatesFilter<"TestAnswer"> | string
    selectedOptionId?: StringNullableWithAggregatesFilter<"TestAnswer"> | string | null
    isCorrect?: BoolWithAggregatesFilter<"TestAnswer"> | boolean
    isBlank?: BoolWithAggregatesFilter<"TestAnswer"> | boolean
    confidence?: StringNullableWithAggregatesFilter<"TestAnswer"> | string | null
    timeSpentSeconds?: IntNullableWithAggregatesFilter<"TestAnswer"> | number | null
    answeredAt?: DateTimeWithAggregatesFilter<"TestAnswer"> | Date | string
  }

  export type ReviewQueueWhereInput = {
    AND?: ReviewQueueWhereInput | ReviewQueueWhereInput[]
    OR?: ReviewQueueWhereInput[]
    NOT?: ReviewQueueWhereInput | ReviewQueueWhereInput[]
    questionId?: StringFilter<"ReviewQueue"> | string
    nextReviewAt?: DateTimeFilter<"ReviewQueue"> | Date | string
    intervalDays?: IntFilter<"ReviewQueue"> | number
    easeFactor?: FloatFilter<"ReviewQueue"> | number
    masteryLevel?: FloatFilter<"ReviewQueue"> | number
    lastResult?: StringNullableFilter<"ReviewQueue"> | string | null
    totalAttempts?: IntFilter<"ReviewQueue"> | number
    correctAttempts?: IntFilter<"ReviewQueue"> | number
    wrongAttempts?: IntFilter<"ReviewQueue"> | number
    lastReviewedAt?: DateTimeNullableFilter<"ReviewQueue"> | Date | string | null
    question?: XOR<QuestionRelationFilter, QuestionWhereInput>
  }

  export type ReviewQueueOrderByWithRelationInput = {
    questionId?: SortOrder
    nextReviewAt?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    masteryLevel?: SortOrder
    lastResult?: SortOrderInput | SortOrder
    totalAttempts?: SortOrder
    correctAttempts?: SortOrder
    wrongAttempts?: SortOrder
    lastReviewedAt?: SortOrderInput | SortOrder
    question?: QuestionOrderByWithRelationInput
  }

  export type ReviewQueueWhereUniqueInput = Prisma.AtLeast<{
    questionId?: string
    AND?: ReviewQueueWhereInput | ReviewQueueWhereInput[]
    OR?: ReviewQueueWhereInput[]
    NOT?: ReviewQueueWhereInput | ReviewQueueWhereInput[]
    nextReviewAt?: DateTimeFilter<"ReviewQueue"> | Date | string
    intervalDays?: IntFilter<"ReviewQueue"> | number
    easeFactor?: FloatFilter<"ReviewQueue"> | number
    masteryLevel?: FloatFilter<"ReviewQueue"> | number
    lastResult?: StringNullableFilter<"ReviewQueue"> | string | null
    totalAttempts?: IntFilter<"ReviewQueue"> | number
    correctAttempts?: IntFilter<"ReviewQueue"> | number
    wrongAttempts?: IntFilter<"ReviewQueue"> | number
    lastReviewedAt?: DateTimeNullableFilter<"ReviewQueue"> | Date | string | null
    question?: XOR<QuestionRelationFilter, QuestionWhereInput>
  }, "questionId">

  export type ReviewQueueOrderByWithAggregationInput = {
    questionId?: SortOrder
    nextReviewAt?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    masteryLevel?: SortOrder
    lastResult?: SortOrderInput | SortOrder
    totalAttempts?: SortOrder
    correctAttempts?: SortOrder
    wrongAttempts?: SortOrder
    lastReviewedAt?: SortOrderInput | SortOrder
    _count?: ReviewQueueCountOrderByAggregateInput
    _avg?: ReviewQueueAvgOrderByAggregateInput
    _max?: ReviewQueueMaxOrderByAggregateInput
    _min?: ReviewQueueMinOrderByAggregateInput
    _sum?: ReviewQueueSumOrderByAggregateInput
  }

  export type ReviewQueueScalarWhereWithAggregatesInput = {
    AND?: ReviewQueueScalarWhereWithAggregatesInput | ReviewQueueScalarWhereWithAggregatesInput[]
    OR?: ReviewQueueScalarWhereWithAggregatesInput[]
    NOT?: ReviewQueueScalarWhereWithAggregatesInput | ReviewQueueScalarWhereWithAggregatesInput[]
    questionId?: StringWithAggregatesFilter<"ReviewQueue"> | string
    nextReviewAt?: DateTimeWithAggregatesFilter<"ReviewQueue"> | Date | string
    intervalDays?: IntWithAggregatesFilter<"ReviewQueue"> | number
    easeFactor?: FloatWithAggregatesFilter<"ReviewQueue"> | number
    masteryLevel?: FloatWithAggregatesFilter<"ReviewQueue"> | number
    lastResult?: StringNullableWithAggregatesFilter<"ReviewQueue"> | string | null
    totalAttempts?: IntWithAggregatesFilter<"ReviewQueue"> | number
    correctAttempts?: IntWithAggregatesFilter<"ReviewQueue"> | number
    wrongAttempts?: IntWithAggregatesFilter<"ReviewQueue"> | number
    lastReviewedAt?: DateTimeNullableWithAggregatesFilter<"ReviewQueue"> | Date | string | null
  }

  export type AchievementWhereInput = {
    AND?: AchievementWhereInput | AchievementWhereInput[]
    OR?: AchievementWhereInput[]
    NOT?: AchievementWhereInput | AchievementWhereInput[]
    id?: StringFilter<"Achievement"> | string
    code?: StringFilter<"Achievement"> | string
    title?: StringFilter<"Achievement"> | string
    description?: StringFilter<"Achievement"> | string
    unlockedAt?: DateTimeFilter<"Achievement"> | Date | string
  }

  export type AchievementOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    title?: SortOrder
    description?: SortOrder
    unlockedAt?: SortOrder
  }

  export type AchievementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: AchievementWhereInput | AchievementWhereInput[]
    OR?: AchievementWhereInput[]
    NOT?: AchievementWhereInput | AchievementWhereInput[]
    title?: StringFilter<"Achievement"> | string
    description?: StringFilter<"Achievement"> | string
    unlockedAt?: DateTimeFilter<"Achievement"> | Date | string
  }, "id" | "code">

  export type AchievementOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    title?: SortOrder
    description?: SortOrder
    unlockedAt?: SortOrder
    _count?: AchievementCountOrderByAggregateInput
    _max?: AchievementMaxOrderByAggregateInput
    _min?: AchievementMinOrderByAggregateInput
  }

  export type AchievementScalarWhereWithAggregatesInput = {
    AND?: AchievementScalarWhereWithAggregatesInput | AchievementScalarWhereWithAggregatesInput[]
    OR?: AchievementScalarWhereWithAggregatesInput[]
    NOT?: AchievementScalarWhereWithAggregatesInput | AchievementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Achievement"> | string
    code?: StringWithAggregatesFilter<"Achievement"> | string
    title?: StringWithAggregatesFilter<"Achievement"> | string
    description?: StringWithAggregatesFilter<"Achievement"> | string
    unlockedAt?: DateTimeWithAggregatesFilter<"Achievement"> | Date | string
  }

  export type UserProgressWhereInput = {
    AND?: UserProgressWhereInput | UserProgressWhereInput[]
    OR?: UserProgressWhereInput[]
    NOT?: UserProgressWhereInput | UserProgressWhereInput[]
    id?: StringFilter<"UserProgress"> | string
    scopeType?: StringFilter<"UserProgress"> | string
    scopeKey?: StringFilter<"UserProgress"> | string
    topicNumber?: IntNullableFilter<"UserProgress"> | number | null
    section?: StringNullableFilter<"UserProgress"> | string | null
    attempts?: IntFilter<"UserProgress"> | number
    correctCount?: IntFilter<"UserProgress"> | number
    wrongCount?: IntFilter<"UserProgress"> | number
    blankCount?: IntFilter<"UserProgress"> | number
    lastAttemptAt?: DateTimeNullableFilter<"UserProgress"> | Date | string | null
    masteryLevel?: FloatFilter<"UserProgress"> | number
    xp?: IntFilter<"UserProgress"> | number
    questionId?: StringNullableFilter<"UserProgress"> | string | null
    question?: XOR<QuestionNullableRelationFilter, QuestionWhereInput> | null
  }

  export type UserProgressOrderByWithRelationInput = {
    id?: SortOrder
    scopeType?: SortOrder
    scopeKey?: SortOrder
    topicNumber?: SortOrderInput | SortOrder
    section?: SortOrderInput | SortOrder
    attempts?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    lastAttemptAt?: SortOrderInput | SortOrder
    masteryLevel?: SortOrder
    xp?: SortOrder
    questionId?: SortOrderInput | SortOrder
    question?: QuestionOrderByWithRelationInput
  }

  export type UserProgressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    scopeType_scopeKey?: UserProgressScopeTypeScopeKeyCompoundUniqueInput
    AND?: UserProgressWhereInput | UserProgressWhereInput[]
    OR?: UserProgressWhereInput[]
    NOT?: UserProgressWhereInput | UserProgressWhereInput[]
    scopeType?: StringFilter<"UserProgress"> | string
    scopeKey?: StringFilter<"UserProgress"> | string
    topicNumber?: IntNullableFilter<"UserProgress"> | number | null
    section?: StringNullableFilter<"UserProgress"> | string | null
    attempts?: IntFilter<"UserProgress"> | number
    correctCount?: IntFilter<"UserProgress"> | number
    wrongCount?: IntFilter<"UserProgress"> | number
    blankCount?: IntFilter<"UserProgress"> | number
    lastAttemptAt?: DateTimeNullableFilter<"UserProgress"> | Date | string | null
    masteryLevel?: FloatFilter<"UserProgress"> | number
    xp?: IntFilter<"UserProgress"> | number
    questionId?: StringNullableFilter<"UserProgress"> | string | null
    question?: XOR<QuestionNullableRelationFilter, QuestionWhereInput> | null
  }, "id" | "scopeType_scopeKey">

  export type UserProgressOrderByWithAggregationInput = {
    id?: SortOrder
    scopeType?: SortOrder
    scopeKey?: SortOrder
    topicNumber?: SortOrderInput | SortOrder
    section?: SortOrderInput | SortOrder
    attempts?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    lastAttemptAt?: SortOrderInput | SortOrder
    masteryLevel?: SortOrder
    xp?: SortOrder
    questionId?: SortOrderInput | SortOrder
    _count?: UserProgressCountOrderByAggregateInput
    _avg?: UserProgressAvgOrderByAggregateInput
    _max?: UserProgressMaxOrderByAggregateInput
    _min?: UserProgressMinOrderByAggregateInput
    _sum?: UserProgressSumOrderByAggregateInput
  }

  export type UserProgressScalarWhereWithAggregatesInput = {
    AND?: UserProgressScalarWhereWithAggregatesInput | UserProgressScalarWhereWithAggregatesInput[]
    OR?: UserProgressScalarWhereWithAggregatesInput[]
    NOT?: UserProgressScalarWhereWithAggregatesInput | UserProgressScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserProgress"> | string
    scopeType?: StringWithAggregatesFilter<"UserProgress"> | string
    scopeKey?: StringWithAggregatesFilter<"UserProgress"> | string
    topicNumber?: IntNullableWithAggregatesFilter<"UserProgress"> | number | null
    section?: StringNullableWithAggregatesFilter<"UserProgress"> | string | null
    attempts?: IntWithAggregatesFilter<"UserProgress"> | number
    correctCount?: IntWithAggregatesFilter<"UserProgress"> | number
    wrongCount?: IntWithAggregatesFilter<"UserProgress"> | number
    blankCount?: IntWithAggregatesFilter<"UserProgress"> | number
    lastAttemptAt?: DateTimeNullableWithAggregatesFilter<"UserProgress"> | Date | string | null
    masteryLevel?: FloatWithAggregatesFilter<"UserProgress"> | number
    xp?: IntWithAggregatesFilter<"UserProgress"> | number
    questionId?: StringNullableWithAggregatesFilter<"UserProgress"> | string | null
  }

  export type AppSettingsWhereInput = {
    AND?: AppSettingsWhereInput | AppSettingsWhereInput[]
    OR?: AppSettingsWhereInput[]
    NOT?: AppSettingsWhereInput | AppSettingsWhereInput[]
    id?: StringFilter<"AppSettings"> | string
    targetExamDate?: DateTimeNullableFilter<"AppSettings"> | Date | string | null
    weeklyGoal?: IntFilter<"AppSettings"> | number
    dailyGoal?: IntFilter<"AppSettings"> | number
    weakPointMinimumSample?: IntFilter<"AppSettings"> | number
    wrongAnswerPenaltyFraction?: FloatFilter<"AppSettings"> | number
    minimumQuestionStatus?: StringFilter<"AppSettings"> | string
    qualityRequiresExplanation?: BoolFilter<"AppSettings"> | boolean
    visualPreferencesJson?: StringNullableFilter<"AppSettings"> | string | null
    updatedAt?: DateTimeFilter<"AppSettings"> | Date | string
  }

  export type AppSettingsOrderByWithRelationInput = {
    id?: SortOrder
    targetExamDate?: SortOrderInput | SortOrder
    weeklyGoal?: SortOrder
    dailyGoal?: SortOrder
    weakPointMinimumSample?: SortOrder
    wrongAnswerPenaltyFraction?: SortOrder
    minimumQuestionStatus?: SortOrder
    qualityRequiresExplanation?: SortOrder
    visualPreferencesJson?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AppSettingsWhereInput | AppSettingsWhereInput[]
    OR?: AppSettingsWhereInput[]
    NOT?: AppSettingsWhereInput | AppSettingsWhereInput[]
    targetExamDate?: DateTimeNullableFilter<"AppSettings"> | Date | string | null
    weeklyGoal?: IntFilter<"AppSettings"> | number
    dailyGoal?: IntFilter<"AppSettings"> | number
    weakPointMinimumSample?: IntFilter<"AppSettings"> | number
    wrongAnswerPenaltyFraction?: FloatFilter<"AppSettings"> | number
    minimumQuestionStatus?: StringFilter<"AppSettings"> | string
    qualityRequiresExplanation?: BoolFilter<"AppSettings"> | boolean
    visualPreferencesJson?: StringNullableFilter<"AppSettings"> | string | null
    updatedAt?: DateTimeFilter<"AppSettings"> | Date | string
  }, "id">

  export type AppSettingsOrderByWithAggregationInput = {
    id?: SortOrder
    targetExamDate?: SortOrderInput | SortOrder
    weeklyGoal?: SortOrder
    dailyGoal?: SortOrder
    weakPointMinimumSample?: SortOrder
    wrongAnswerPenaltyFraction?: SortOrder
    minimumQuestionStatus?: SortOrder
    qualityRequiresExplanation?: SortOrder
    visualPreferencesJson?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: AppSettingsCountOrderByAggregateInput
    _avg?: AppSettingsAvgOrderByAggregateInput
    _max?: AppSettingsMaxOrderByAggregateInput
    _min?: AppSettingsMinOrderByAggregateInput
    _sum?: AppSettingsSumOrderByAggregateInput
  }

  export type AppSettingsScalarWhereWithAggregatesInput = {
    AND?: AppSettingsScalarWhereWithAggregatesInput | AppSettingsScalarWhereWithAggregatesInput[]
    OR?: AppSettingsScalarWhereWithAggregatesInput[]
    NOT?: AppSettingsScalarWhereWithAggregatesInput | AppSettingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AppSettings"> | string
    targetExamDate?: DateTimeNullableWithAggregatesFilter<"AppSettings"> | Date | string | null
    weeklyGoal?: IntWithAggregatesFilter<"AppSettings"> | number
    dailyGoal?: IntWithAggregatesFilter<"AppSettings"> | number
    weakPointMinimumSample?: IntWithAggregatesFilter<"AppSettings"> | number
    wrongAnswerPenaltyFraction?: FloatWithAggregatesFilter<"AppSettings"> | number
    minimumQuestionStatus?: StringWithAggregatesFilter<"AppSettings"> | string
    qualityRequiresExplanation?: BoolWithAggregatesFilter<"AppSettings"> | boolean
    visualPreferencesJson?: StringNullableWithAggregatesFilter<"AppSettings"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"AppSettings"> | Date | string
  }

  export type QuestionCreateInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    caseStudy?: CaseStudyCreateNestedOneWithoutQuestionsInput
    options?: OptionCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUncheckedCreateInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    caseStudyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: OptionUncheckedCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerUncheckedCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueUncheckedCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionUncheckedCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    caseStudy?: CaseStudyUpdateOneWithoutQuestionsNestedInput
    options?: OptionUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    caseStudyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OptionUncheckedUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUncheckedUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUncheckedUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUncheckedUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionCreateManyInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    caseStudyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    caseStudyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OptionCreateInput = {
    id?: string
    label: string
    text: string
    isCorrect: boolean
    explanation?: string | null
    question: QuestionCreateNestedOneWithoutOptionsInput
  }

  export type OptionUncheckedCreateInput = {
    id?: string
    questionId: string
    label: string
    text: string
    isCorrect: boolean
    explanation?: string | null
  }

  export type OptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    question?: QuestionUpdateOneRequiredWithoutOptionsNestedInput
  }

  export type OptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OptionCreateManyInput = {
    id?: string
    questionId: string
    label: string
    text: string
    isCorrect: boolean
    explanation?: string | null
  }

  export type OptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CaseStudyCreateInput = {
    id: string
    title: string
    description?: string | null
    topicNumber?: number | null
    section?: string | null
    source?: string | null
    questions?: QuestionCreateNestedManyWithoutCaseStudyInput
  }

  export type CaseStudyUncheckedCreateInput = {
    id: string
    title: string
    description?: string | null
    topicNumber?: number | null
    section?: string | null
    source?: string | null
    questions?: QuestionUncheckedCreateNestedManyWithoutCaseStudyInput
  }

  export type CaseStudyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    questions?: QuestionUpdateManyWithoutCaseStudyNestedInput
  }

  export type CaseStudyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    questions?: QuestionUncheckedUpdateManyWithoutCaseStudyNestedInput
  }

  export type CaseStudyCreateManyInput = {
    id: string
    title: string
    description?: string | null
    topicNumber?: number | null
    section?: string | null
    source?: string | null
  }

  export type CaseStudyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CaseStudyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ImportBatchCreateInput = {
    id?: string
    filename: string
    importedAt?: Date | string
    sourceMetadataJson?: string | null
    totalQuestionsDetected: number
    createdCount?: number
    updatedCount?: number
    skippedCount?: number
    errorCount?: number
    warningsJson?: string | null
    rawSummaryJson?: string | null
    revertedAt?: Date | string | null
    items?: ImportBatchQuestionCreateNestedManyWithoutImportBatchInput
  }

  export type ImportBatchUncheckedCreateInput = {
    id?: string
    filename: string
    importedAt?: Date | string
    sourceMetadataJson?: string | null
    totalQuestionsDetected: number
    createdCount?: number
    updatedCount?: number
    skippedCount?: number
    errorCount?: number
    warningsJson?: string | null
    rawSummaryJson?: string | null
    revertedAt?: Date | string | null
    items?: ImportBatchQuestionUncheckedCreateNestedManyWithoutImportBatchInput
  }

  export type ImportBatchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceMetadataJson?: NullableStringFieldUpdateOperationsInput | string | null
    totalQuestionsDetected?: IntFieldUpdateOperationsInput | number
    createdCount?: IntFieldUpdateOperationsInput | number
    updatedCount?: IntFieldUpdateOperationsInput | number
    skippedCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    rawSummaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    revertedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    items?: ImportBatchQuestionUpdateManyWithoutImportBatchNestedInput
  }

  export type ImportBatchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceMetadataJson?: NullableStringFieldUpdateOperationsInput | string | null
    totalQuestionsDetected?: IntFieldUpdateOperationsInput | number
    createdCount?: IntFieldUpdateOperationsInput | number
    updatedCount?: IntFieldUpdateOperationsInput | number
    skippedCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    rawSummaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    revertedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    items?: ImportBatchQuestionUncheckedUpdateManyWithoutImportBatchNestedInput
  }

  export type ImportBatchCreateManyInput = {
    id?: string
    filename: string
    importedAt?: Date | string
    sourceMetadataJson?: string | null
    totalQuestionsDetected: number
    createdCount?: number
    updatedCount?: number
    skippedCount?: number
    errorCount?: number
    warningsJson?: string | null
    rawSummaryJson?: string | null
    revertedAt?: Date | string | null
  }

  export type ImportBatchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceMetadataJson?: NullableStringFieldUpdateOperationsInput | string | null
    totalQuestionsDetected?: IntFieldUpdateOperationsInput | number
    createdCount?: IntFieldUpdateOperationsInput | number
    updatedCount?: IntFieldUpdateOperationsInput | number
    skippedCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    rawSummaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    revertedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ImportBatchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceMetadataJson?: NullableStringFieldUpdateOperationsInput | string | null
    totalQuestionsDetected?: IntFieldUpdateOperationsInput | number
    createdCount?: IntFieldUpdateOperationsInput | number
    updatedCount?: IntFieldUpdateOperationsInput | number
    skippedCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    rawSummaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    revertedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ImportBatchQuestionCreateInput = {
    id?: string
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
    importBatch: ImportBatchCreateNestedOneWithoutItemsInput
    question?: QuestionCreateNestedOneWithoutImportEventsInput
  }

  export type ImportBatchQuestionUncheckedCreateInput = {
    id?: string
    importBatchId: string
    questionId?: string | null
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
  }

  export type ImportBatchQuestionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importBatch?: ImportBatchUpdateOneRequiredWithoutItemsNestedInput
    question?: QuestionUpdateOneWithoutImportEventsNestedInput
  }

  export type ImportBatchQuestionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    importBatchId?: StringFieldUpdateOperationsInput | string
    questionId?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ImportBatchQuestionCreateManyInput = {
    id?: string
    importBatchId: string
    questionId?: string | null
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
  }

  export type ImportBatchQuestionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ImportBatchQuestionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    importBatchId?: StringFieldUpdateOperationsInput | string
    questionId?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TestSessionCreateInput = {
    id?: string
    mode: string
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationSeconds?: number | null
    status?: string
    examExercise: string
    questionIdsJson: string
    totalQuestions: number
    score?: number | null
    maxScore: number
    passed?: boolean | null
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    averageTimePerQuestion?: number | null
    topicFilter?: string | null
    sectionFilter?: string | null
    includeStatusesJson?: string | null
    summaryJson?: string | null
    answers?: TestAnswerCreateNestedManyWithoutTestSessionInput
  }

  export type TestSessionUncheckedCreateInput = {
    id?: string
    mode: string
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationSeconds?: number | null
    status?: string
    examExercise: string
    questionIdsJson: string
    totalQuestions: number
    score?: number | null
    maxScore: number
    passed?: boolean | null
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    averageTimePerQuestion?: number | null
    topicFilter?: string | null
    sectionFilter?: string | null
    includeStatusesJson?: string | null
    summaryJson?: string | null
    answers?: TestAnswerUncheckedCreateNestedManyWithoutTestSessionInput
  }

  export type TestSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    questionIdsJson?: StringFieldUpdateOperationsInput | string
    totalQuestions?: IntFieldUpdateOperationsInput | number
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    averageTimePerQuestion?: NullableFloatFieldUpdateOperationsInput | number | null
    topicFilter?: NullableStringFieldUpdateOperationsInput | string | null
    sectionFilter?: NullableStringFieldUpdateOperationsInput | string | null
    includeStatusesJson?: NullableStringFieldUpdateOperationsInput | string | null
    summaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    answers?: TestAnswerUpdateManyWithoutTestSessionNestedInput
  }

  export type TestSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    questionIdsJson?: StringFieldUpdateOperationsInput | string
    totalQuestions?: IntFieldUpdateOperationsInput | number
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    averageTimePerQuestion?: NullableFloatFieldUpdateOperationsInput | number | null
    topicFilter?: NullableStringFieldUpdateOperationsInput | string | null
    sectionFilter?: NullableStringFieldUpdateOperationsInput | string | null
    includeStatusesJson?: NullableStringFieldUpdateOperationsInput | string | null
    summaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    answers?: TestAnswerUncheckedUpdateManyWithoutTestSessionNestedInput
  }

  export type TestSessionCreateManyInput = {
    id?: string
    mode: string
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationSeconds?: number | null
    status?: string
    examExercise: string
    questionIdsJson: string
    totalQuestions: number
    score?: number | null
    maxScore: number
    passed?: boolean | null
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    averageTimePerQuestion?: number | null
    topicFilter?: string | null
    sectionFilter?: string | null
    includeStatusesJson?: string | null
    summaryJson?: string | null
  }

  export type TestSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    questionIdsJson?: StringFieldUpdateOperationsInput | string
    totalQuestions?: IntFieldUpdateOperationsInput | number
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    averageTimePerQuestion?: NullableFloatFieldUpdateOperationsInput | number | null
    topicFilter?: NullableStringFieldUpdateOperationsInput | string | null
    sectionFilter?: NullableStringFieldUpdateOperationsInput | string | null
    includeStatusesJson?: NullableStringFieldUpdateOperationsInput | string | null
    summaryJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TestSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    questionIdsJson?: StringFieldUpdateOperationsInput | string
    totalQuestions?: IntFieldUpdateOperationsInput | number
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    averageTimePerQuestion?: NullableFloatFieldUpdateOperationsInput | number | null
    topicFilter?: NullableStringFieldUpdateOperationsInput | string | null
    sectionFilter?: NullableStringFieldUpdateOperationsInput | string | null
    includeStatusesJson?: NullableStringFieldUpdateOperationsInput | string | null
    summaryJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TestAnswerCreateInput = {
    id?: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
    testSession: TestSessionCreateNestedOneWithoutAnswersInput
    question: QuestionCreateNestedOneWithoutTestAnswersInput
  }

  export type TestAnswerUncheckedCreateInput = {
    id?: string
    testSessionId: string
    questionId: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
  }

  export type TestAnswerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    testSession?: TestSessionUpdateOneRequiredWithoutAnswersNestedInput
    question?: QuestionUpdateOneRequiredWithoutTestAnswersNestedInput
  }

  export type TestAnswerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    testSessionId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestAnswerCreateManyInput = {
    id?: string
    testSessionId: string
    questionId: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
  }

  export type TestAnswerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestAnswerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    testSessionId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewQueueCreateInput = {
    nextReviewAt: Date | string
    intervalDays?: number
    easeFactor?: number
    masteryLevel?: number
    lastResult?: string | null
    totalAttempts?: number
    correctAttempts?: number
    wrongAttempts?: number
    lastReviewedAt?: Date | string | null
    question: QuestionCreateNestedOneWithoutReviewQueueInput
  }

  export type ReviewQueueUncheckedCreateInput = {
    questionId: string
    nextReviewAt: Date | string
    intervalDays?: number
    easeFactor?: number
    masteryLevel?: number
    lastResult?: string | null
    totalAttempts?: number
    correctAttempts?: number
    wrongAttempts?: number
    lastReviewedAt?: Date | string | null
  }

  export type ReviewQueueUpdateInput = {
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    intervalDays?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    lastResult?: NullableStringFieldUpdateOperationsInput | string | null
    totalAttempts?: IntFieldUpdateOperationsInput | number
    correctAttempts?: IntFieldUpdateOperationsInput | number
    wrongAttempts?: IntFieldUpdateOperationsInput | number
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    question?: QuestionUpdateOneRequiredWithoutReviewQueueNestedInput
  }

  export type ReviewQueueUncheckedUpdateInput = {
    questionId?: StringFieldUpdateOperationsInput | string
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    intervalDays?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    lastResult?: NullableStringFieldUpdateOperationsInput | string | null
    totalAttempts?: IntFieldUpdateOperationsInput | number
    correctAttempts?: IntFieldUpdateOperationsInput | number
    wrongAttempts?: IntFieldUpdateOperationsInput | number
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ReviewQueueCreateManyInput = {
    questionId: string
    nextReviewAt: Date | string
    intervalDays?: number
    easeFactor?: number
    masteryLevel?: number
    lastResult?: string | null
    totalAttempts?: number
    correctAttempts?: number
    wrongAttempts?: number
    lastReviewedAt?: Date | string | null
  }

  export type ReviewQueueUpdateManyMutationInput = {
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    intervalDays?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    lastResult?: NullableStringFieldUpdateOperationsInput | string | null
    totalAttempts?: IntFieldUpdateOperationsInput | number
    correctAttempts?: IntFieldUpdateOperationsInput | number
    wrongAttempts?: IntFieldUpdateOperationsInput | number
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ReviewQueueUncheckedUpdateManyInput = {
    questionId?: StringFieldUpdateOperationsInput | string
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    intervalDays?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    lastResult?: NullableStringFieldUpdateOperationsInput | string | null
    totalAttempts?: IntFieldUpdateOperationsInput | number
    correctAttempts?: IntFieldUpdateOperationsInput | number
    wrongAttempts?: IntFieldUpdateOperationsInput | number
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AchievementCreateInput = {
    id?: string
    code: string
    title: string
    description: string
    unlockedAt: Date | string
  }

  export type AchievementUncheckedCreateInput = {
    id?: string
    code: string
    title: string
    description: string
    unlockedAt: Date | string
  }

  export type AchievementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    unlockedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AchievementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    unlockedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AchievementCreateManyInput = {
    id?: string
    code: string
    title: string
    description: string
    unlockedAt: Date | string
  }

  export type AchievementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    unlockedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AchievementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    unlockedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProgressCreateInput = {
    id?: string
    scopeType: string
    scopeKey: string
    topicNumber?: number | null
    section?: string | null
    attempts?: number
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    lastAttemptAt?: Date | string | null
    masteryLevel?: number
    xp?: number
    question?: QuestionCreateNestedOneWithoutProgressSnapshotsInput
  }

  export type UserProgressUncheckedCreateInput = {
    id?: string
    scopeType: string
    scopeKey: string
    topicNumber?: number | null
    section?: string | null
    attempts?: number
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    lastAttemptAt?: Date | string | null
    masteryLevel?: number
    xp?: number
    questionId?: string | null
  }

  export type UserProgressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scopeType?: StringFieldUpdateOperationsInput | string
    scopeKey?: StringFieldUpdateOperationsInput | string
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    lastAttemptAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    xp?: IntFieldUpdateOperationsInput | number
    question?: QuestionUpdateOneWithoutProgressSnapshotsNestedInput
  }

  export type UserProgressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scopeType?: StringFieldUpdateOperationsInput | string
    scopeKey?: StringFieldUpdateOperationsInput | string
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    lastAttemptAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    xp?: IntFieldUpdateOperationsInput | number
    questionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserProgressCreateManyInput = {
    id?: string
    scopeType: string
    scopeKey: string
    topicNumber?: number | null
    section?: string | null
    attempts?: number
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    lastAttemptAt?: Date | string | null
    masteryLevel?: number
    xp?: number
    questionId?: string | null
  }

  export type UserProgressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    scopeType?: StringFieldUpdateOperationsInput | string
    scopeKey?: StringFieldUpdateOperationsInput | string
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    lastAttemptAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    xp?: IntFieldUpdateOperationsInput | number
  }

  export type UserProgressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    scopeType?: StringFieldUpdateOperationsInput | string
    scopeKey?: StringFieldUpdateOperationsInput | string
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    lastAttemptAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    xp?: IntFieldUpdateOperationsInput | number
    questionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AppSettingsCreateInput = {
    id?: string
    targetExamDate?: Date | string | null
    weeklyGoal?: number
    dailyGoal?: number
    weakPointMinimumSample?: number
    wrongAnswerPenaltyFraction?: number
    minimumQuestionStatus?: string
    qualityRequiresExplanation?: boolean
    visualPreferencesJson?: string | null
    updatedAt?: Date | string
  }

  export type AppSettingsUncheckedCreateInput = {
    id?: string
    targetExamDate?: Date | string | null
    weeklyGoal?: number
    dailyGoal?: number
    weakPointMinimumSample?: number
    wrongAnswerPenaltyFraction?: number
    minimumQuestionStatus?: string
    qualityRequiresExplanation?: boolean
    visualPreferencesJson?: string | null
    updatedAt?: Date | string
  }

  export type AppSettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    targetExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weeklyGoal?: IntFieldUpdateOperationsInput | number
    dailyGoal?: IntFieldUpdateOperationsInput | number
    weakPointMinimumSample?: IntFieldUpdateOperationsInput | number
    wrongAnswerPenaltyFraction?: FloatFieldUpdateOperationsInput | number
    minimumQuestionStatus?: StringFieldUpdateOperationsInput | string
    qualityRequiresExplanation?: BoolFieldUpdateOperationsInput | boolean
    visualPreferencesJson?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    targetExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weeklyGoal?: IntFieldUpdateOperationsInput | number
    dailyGoal?: IntFieldUpdateOperationsInput | number
    weakPointMinimumSample?: IntFieldUpdateOperationsInput | number
    wrongAnswerPenaltyFraction?: FloatFieldUpdateOperationsInput | number
    minimumQuestionStatus?: StringFieldUpdateOperationsInput | string
    qualityRequiresExplanation?: BoolFieldUpdateOperationsInput | boolean
    visualPreferencesJson?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingsCreateManyInput = {
    id?: string
    targetExamDate?: Date | string | null
    weeklyGoal?: number
    dailyGoal?: number
    weakPointMinimumSample?: number
    wrongAnswerPenaltyFraction?: number
    minimumQuestionStatus?: string
    qualityRequiresExplanation?: boolean
    visualPreferencesJson?: string | null
    updatedAt?: Date | string
  }

  export type AppSettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    targetExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weeklyGoal?: IntFieldUpdateOperationsInput | number
    dailyGoal?: IntFieldUpdateOperationsInput | number
    weakPointMinimumSample?: IntFieldUpdateOperationsInput | number
    wrongAnswerPenaltyFraction?: FloatFieldUpdateOperationsInput | number
    minimumQuestionStatus?: StringFieldUpdateOperationsInput | string
    qualityRequiresExplanation?: BoolFieldUpdateOperationsInput | boolean
    visualPreferencesJson?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    targetExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weeklyGoal?: IntFieldUpdateOperationsInput | number
    dailyGoal?: IntFieldUpdateOperationsInput | number
    weakPointMinimumSample?: IntFieldUpdateOperationsInput | number
    wrongAnswerPenaltyFraction?: FloatFieldUpdateOperationsInput | number
    minimumQuestionStatus?: StringFieldUpdateOperationsInput | string
    qualityRequiresExplanation?: BoolFieldUpdateOperationsInput | boolean
    visualPreferencesJson?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CaseStudyNullableRelationFilter = {
    is?: CaseStudyWhereInput | null
    isNot?: CaseStudyWhereInput | null
  }

  export type OptionListRelationFilter = {
    every?: OptionWhereInput
    some?: OptionWhereInput
    none?: OptionWhereInput
  }

  export type TestAnswerListRelationFilter = {
    every?: TestAnswerWhereInput
    some?: TestAnswerWhereInput
    none?: TestAnswerWhereInput
  }

  export type ReviewQueueNullableRelationFilter = {
    is?: ReviewQueueWhereInput | null
    isNot?: ReviewQueueWhereInput | null
  }

  export type ImportBatchQuestionListRelationFilter = {
    every?: ImportBatchQuestionWhereInput
    some?: ImportBatchQuestionWhereInput
    none?: ImportBatchQuestionWhereInput
  }

  export type UserProgressListRelationFilter = {
    every?: UserProgressWhereInput
    some?: UserProgressWhereInput
    none?: UserProgressWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TestAnswerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ImportBatchQuestionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserProgressOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type QuestionCountOrderByAggregateInput = {
    id?: SortOrder
    externalId?: SortOrder
    examPart?: SortOrder
    examExercise?: SortOrder
    topicNumber?: SortOrder
    topicTitle?: SortOrder
    section?: SortOrder
    subsection?: SortOrder
    questionType?: SortOrder
    difficulty?: SortOrder
    text?: SortOrder
    explanation?: SortOrder
    sourceDocument?: SortOrder
    sourceReference?: SortOrder
    tagsJson?: SortOrder
    status?: SortOrder
    isDemo?: SortOrder
    isFavorite?: SortOrder
    isDoubtful?: SortOrder
    isArchived?: SortOrder
    reserveOrder?: SortOrder
    caseStudyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionAvgOrderByAggregateInput = {
    topicNumber?: SortOrder
    reserveOrder?: SortOrder
  }

  export type QuestionMaxOrderByAggregateInput = {
    id?: SortOrder
    externalId?: SortOrder
    examPart?: SortOrder
    examExercise?: SortOrder
    topicNumber?: SortOrder
    topicTitle?: SortOrder
    section?: SortOrder
    subsection?: SortOrder
    questionType?: SortOrder
    difficulty?: SortOrder
    text?: SortOrder
    explanation?: SortOrder
    sourceDocument?: SortOrder
    sourceReference?: SortOrder
    tagsJson?: SortOrder
    status?: SortOrder
    isDemo?: SortOrder
    isFavorite?: SortOrder
    isDoubtful?: SortOrder
    isArchived?: SortOrder
    reserveOrder?: SortOrder
    caseStudyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionMinOrderByAggregateInput = {
    id?: SortOrder
    externalId?: SortOrder
    examPart?: SortOrder
    examExercise?: SortOrder
    topicNumber?: SortOrder
    topicTitle?: SortOrder
    section?: SortOrder
    subsection?: SortOrder
    questionType?: SortOrder
    difficulty?: SortOrder
    text?: SortOrder
    explanation?: SortOrder
    sourceDocument?: SortOrder
    sourceReference?: SortOrder
    tagsJson?: SortOrder
    status?: SortOrder
    isDemo?: SortOrder
    isFavorite?: SortOrder
    isDoubtful?: SortOrder
    isArchived?: SortOrder
    reserveOrder?: SortOrder
    caseStudyId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionSumOrderByAggregateInput = {
    topicNumber?: SortOrder
    reserveOrder?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type QuestionRelationFilter = {
    is?: QuestionWhereInput
    isNot?: QuestionWhereInput
  }

  export type OptionQuestionIdLabelCompoundUniqueInput = {
    questionId: string
    label: string
  }

  export type OptionCountOrderByAggregateInput = {
    id?: SortOrder
    questionId?: SortOrder
    label?: SortOrder
    text?: SortOrder
    isCorrect?: SortOrder
    explanation?: SortOrder
  }

  export type OptionMaxOrderByAggregateInput = {
    id?: SortOrder
    questionId?: SortOrder
    label?: SortOrder
    text?: SortOrder
    isCorrect?: SortOrder
    explanation?: SortOrder
  }

  export type OptionMinOrderByAggregateInput = {
    id?: SortOrder
    questionId?: SortOrder
    label?: SortOrder
    text?: SortOrder
    isCorrect?: SortOrder
    explanation?: SortOrder
  }

  export type QuestionListRelationFilter = {
    every?: QuestionWhereInput
    some?: QuestionWhereInput
    none?: QuestionWhereInput
  }

  export type QuestionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CaseStudyCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    topicNumber?: SortOrder
    section?: SortOrder
    source?: SortOrder
  }

  export type CaseStudyAvgOrderByAggregateInput = {
    topicNumber?: SortOrder
  }

  export type CaseStudyMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    topicNumber?: SortOrder
    section?: SortOrder
    source?: SortOrder
  }

  export type CaseStudyMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    topicNumber?: SortOrder
    section?: SortOrder
    source?: SortOrder
  }

  export type CaseStudySumOrderByAggregateInput = {
    topicNumber?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ImportBatchCountOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    importedAt?: SortOrder
    sourceMetadataJson?: SortOrder
    totalQuestionsDetected?: SortOrder
    createdCount?: SortOrder
    updatedCount?: SortOrder
    skippedCount?: SortOrder
    errorCount?: SortOrder
    warningsJson?: SortOrder
    rawSummaryJson?: SortOrder
    revertedAt?: SortOrder
  }

  export type ImportBatchAvgOrderByAggregateInput = {
    totalQuestionsDetected?: SortOrder
    createdCount?: SortOrder
    updatedCount?: SortOrder
    skippedCount?: SortOrder
    errorCount?: SortOrder
  }

  export type ImportBatchMaxOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    importedAt?: SortOrder
    sourceMetadataJson?: SortOrder
    totalQuestionsDetected?: SortOrder
    createdCount?: SortOrder
    updatedCount?: SortOrder
    skippedCount?: SortOrder
    errorCount?: SortOrder
    warningsJson?: SortOrder
    rawSummaryJson?: SortOrder
    revertedAt?: SortOrder
  }

  export type ImportBatchMinOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    importedAt?: SortOrder
    sourceMetadataJson?: SortOrder
    totalQuestionsDetected?: SortOrder
    createdCount?: SortOrder
    updatedCount?: SortOrder
    skippedCount?: SortOrder
    errorCount?: SortOrder
    warningsJson?: SortOrder
    rawSummaryJson?: SortOrder
    revertedAt?: SortOrder
  }

  export type ImportBatchSumOrderByAggregateInput = {
    totalQuestionsDetected?: SortOrder
    createdCount?: SortOrder
    updatedCount?: SortOrder
    skippedCount?: SortOrder
    errorCount?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ImportBatchRelationFilter = {
    is?: ImportBatchWhereInput
    isNot?: ImportBatchWhereInput
  }

  export type QuestionNullableRelationFilter = {
    is?: QuestionWhereInput | null
    isNot?: QuestionWhereInput | null
  }

  export type ImportBatchQuestionCountOrderByAggregateInput = {
    id?: SortOrder
    importBatchId?: SortOrder
    questionId?: SortOrder
    externalId?: SortOrder
    action?: SortOrder
    warningsJson?: SortOrder
    errorsJson?: SortOrder
    previousDataJson?: SortOrder
    importedDataJson?: SortOrder
  }

  export type ImportBatchQuestionMaxOrderByAggregateInput = {
    id?: SortOrder
    importBatchId?: SortOrder
    questionId?: SortOrder
    externalId?: SortOrder
    action?: SortOrder
    warningsJson?: SortOrder
    errorsJson?: SortOrder
    previousDataJson?: SortOrder
    importedDataJson?: SortOrder
  }

  export type ImportBatchQuestionMinOrderByAggregateInput = {
    id?: SortOrder
    importBatchId?: SortOrder
    questionId?: SortOrder
    externalId?: SortOrder
    action?: SortOrder
    warningsJson?: SortOrder
    errorsJson?: SortOrder
    previousDataJson?: SortOrder
    importedDataJson?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type TestSessionCountOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
    durationSeconds?: SortOrder
    status?: SortOrder
    examExercise?: SortOrder
    questionIdsJson?: SortOrder
    totalQuestions?: SortOrder
    score?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    averageTimePerQuestion?: SortOrder
    topicFilter?: SortOrder
    sectionFilter?: SortOrder
    includeStatusesJson?: SortOrder
    summaryJson?: SortOrder
  }

  export type TestSessionAvgOrderByAggregateInput = {
    durationSeconds?: SortOrder
    totalQuestions?: SortOrder
    score?: SortOrder
    maxScore?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    averageTimePerQuestion?: SortOrder
  }

  export type TestSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
    durationSeconds?: SortOrder
    status?: SortOrder
    examExercise?: SortOrder
    questionIdsJson?: SortOrder
    totalQuestions?: SortOrder
    score?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    averageTimePerQuestion?: SortOrder
    topicFilter?: SortOrder
    sectionFilter?: SortOrder
    includeStatusesJson?: SortOrder
    summaryJson?: SortOrder
  }

  export type TestSessionMinOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    startedAt?: SortOrder
    finishedAt?: SortOrder
    durationSeconds?: SortOrder
    status?: SortOrder
    examExercise?: SortOrder
    questionIdsJson?: SortOrder
    totalQuestions?: SortOrder
    score?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    averageTimePerQuestion?: SortOrder
    topicFilter?: SortOrder
    sectionFilter?: SortOrder
    includeStatusesJson?: SortOrder
    summaryJson?: SortOrder
  }

  export type TestSessionSumOrderByAggregateInput = {
    durationSeconds?: SortOrder
    totalQuestions?: SortOrder
    score?: SortOrder
    maxScore?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    averageTimePerQuestion?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type TestSessionRelationFilter = {
    is?: TestSessionWhereInput
    isNot?: TestSessionWhereInput
  }

  export type TestAnswerCountOrderByAggregateInput = {
    id?: SortOrder
    testSessionId?: SortOrder
    questionId?: SortOrder
    selectedOptionId?: SortOrder
    isCorrect?: SortOrder
    isBlank?: SortOrder
    confidence?: SortOrder
    timeSpentSeconds?: SortOrder
    answeredAt?: SortOrder
  }

  export type TestAnswerAvgOrderByAggregateInput = {
    timeSpentSeconds?: SortOrder
  }

  export type TestAnswerMaxOrderByAggregateInput = {
    id?: SortOrder
    testSessionId?: SortOrder
    questionId?: SortOrder
    selectedOptionId?: SortOrder
    isCorrect?: SortOrder
    isBlank?: SortOrder
    confidence?: SortOrder
    timeSpentSeconds?: SortOrder
    answeredAt?: SortOrder
  }

  export type TestAnswerMinOrderByAggregateInput = {
    id?: SortOrder
    testSessionId?: SortOrder
    questionId?: SortOrder
    selectedOptionId?: SortOrder
    isCorrect?: SortOrder
    isBlank?: SortOrder
    confidence?: SortOrder
    timeSpentSeconds?: SortOrder
    answeredAt?: SortOrder
  }

  export type TestAnswerSumOrderByAggregateInput = {
    timeSpentSeconds?: SortOrder
  }

  export type ReviewQueueCountOrderByAggregateInput = {
    questionId?: SortOrder
    nextReviewAt?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    masteryLevel?: SortOrder
    lastResult?: SortOrder
    totalAttempts?: SortOrder
    correctAttempts?: SortOrder
    wrongAttempts?: SortOrder
    lastReviewedAt?: SortOrder
  }

  export type ReviewQueueAvgOrderByAggregateInput = {
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    masteryLevel?: SortOrder
    totalAttempts?: SortOrder
    correctAttempts?: SortOrder
    wrongAttempts?: SortOrder
  }

  export type ReviewQueueMaxOrderByAggregateInput = {
    questionId?: SortOrder
    nextReviewAt?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    masteryLevel?: SortOrder
    lastResult?: SortOrder
    totalAttempts?: SortOrder
    correctAttempts?: SortOrder
    wrongAttempts?: SortOrder
    lastReviewedAt?: SortOrder
  }

  export type ReviewQueueMinOrderByAggregateInput = {
    questionId?: SortOrder
    nextReviewAt?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    masteryLevel?: SortOrder
    lastResult?: SortOrder
    totalAttempts?: SortOrder
    correctAttempts?: SortOrder
    wrongAttempts?: SortOrder
    lastReviewedAt?: SortOrder
  }

  export type ReviewQueueSumOrderByAggregateInput = {
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    masteryLevel?: SortOrder
    totalAttempts?: SortOrder
    correctAttempts?: SortOrder
    wrongAttempts?: SortOrder
  }

  export type AchievementCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    title?: SortOrder
    description?: SortOrder
    unlockedAt?: SortOrder
  }

  export type AchievementMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    title?: SortOrder
    description?: SortOrder
    unlockedAt?: SortOrder
  }

  export type AchievementMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    title?: SortOrder
    description?: SortOrder
    unlockedAt?: SortOrder
  }

  export type UserProgressScopeTypeScopeKeyCompoundUniqueInput = {
    scopeType: string
    scopeKey: string
  }

  export type UserProgressCountOrderByAggregateInput = {
    id?: SortOrder
    scopeType?: SortOrder
    scopeKey?: SortOrder
    topicNumber?: SortOrder
    section?: SortOrder
    attempts?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    lastAttemptAt?: SortOrder
    masteryLevel?: SortOrder
    xp?: SortOrder
    questionId?: SortOrder
  }

  export type UserProgressAvgOrderByAggregateInput = {
    topicNumber?: SortOrder
    attempts?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    masteryLevel?: SortOrder
    xp?: SortOrder
  }

  export type UserProgressMaxOrderByAggregateInput = {
    id?: SortOrder
    scopeType?: SortOrder
    scopeKey?: SortOrder
    topicNumber?: SortOrder
    section?: SortOrder
    attempts?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    lastAttemptAt?: SortOrder
    masteryLevel?: SortOrder
    xp?: SortOrder
    questionId?: SortOrder
  }

  export type UserProgressMinOrderByAggregateInput = {
    id?: SortOrder
    scopeType?: SortOrder
    scopeKey?: SortOrder
    topicNumber?: SortOrder
    section?: SortOrder
    attempts?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    lastAttemptAt?: SortOrder
    masteryLevel?: SortOrder
    xp?: SortOrder
    questionId?: SortOrder
  }

  export type UserProgressSumOrderByAggregateInput = {
    topicNumber?: SortOrder
    attempts?: SortOrder
    correctCount?: SortOrder
    wrongCount?: SortOrder
    blankCount?: SortOrder
    masteryLevel?: SortOrder
    xp?: SortOrder
  }

  export type AppSettingsCountOrderByAggregateInput = {
    id?: SortOrder
    targetExamDate?: SortOrder
    weeklyGoal?: SortOrder
    dailyGoal?: SortOrder
    weakPointMinimumSample?: SortOrder
    wrongAnswerPenaltyFraction?: SortOrder
    minimumQuestionStatus?: SortOrder
    qualityRequiresExplanation?: SortOrder
    visualPreferencesJson?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsAvgOrderByAggregateInput = {
    weeklyGoal?: SortOrder
    dailyGoal?: SortOrder
    weakPointMinimumSample?: SortOrder
    wrongAnswerPenaltyFraction?: SortOrder
  }

  export type AppSettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    targetExamDate?: SortOrder
    weeklyGoal?: SortOrder
    dailyGoal?: SortOrder
    weakPointMinimumSample?: SortOrder
    wrongAnswerPenaltyFraction?: SortOrder
    minimumQuestionStatus?: SortOrder
    qualityRequiresExplanation?: SortOrder
    visualPreferencesJson?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsMinOrderByAggregateInput = {
    id?: SortOrder
    targetExamDate?: SortOrder
    weeklyGoal?: SortOrder
    dailyGoal?: SortOrder
    weakPointMinimumSample?: SortOrder
    wrongAnswerPenaltyFraction?: SortOrder
    minimumQuestionStatus?: SortOrder
    qualityRequiresExplanation?: SortOrder
    visualPreferencesJson?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingsSumOrderByAggregateInput = {
    weeklyGoal?: SortOrder
    dailyGoal?: SortOrder
    weakPointMinimumSample?: SortOrder
    wrongAnswerPenaltyFraction?: SortOrder
  }

  export type CaseStudyCreateNestedOneWithoutQuestionsInput = {
    create?: XOR<CaseStudyCreateWithoutQuestionsInput, CaseStudyUncheckedCreateWithoutQuestionsInput>
    connectOrCreate?: CaseStudyCreateOrConnectWithoutQuestionsInput
    connect?: CaseStudyWhereUniqueInput
  }

  export type OptionCreateNestedManyWithoutQuestionInput = {
    create?: XOR<OptionCreateWithoutQuestionInput, OptionUncheckedCreateWithoutQuestionInput> | OptionCreateWithoutQuestionInput[] | OptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OptionCreateOrConnectWithoutQuestionInput | OptionCreateOrConnectWithoutQuestionInput[]
    createMany?: OptionCreateManyQuestionInputEnvelope
    connect?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
  }

  export type TestAnswerCreateNestedManyWithoutQuestionInput = {
    create?: XOR<TestAnswerCreateWithoutQuestionInput, TestAnswerUncheckedCreateWithoutQuestionInput> | TestAnswerCreateWithoutQuestionInput[] | TestAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutQuestionInput | TestAnswerCreateOrConnectWithoutQuestionInput[]
    createMany?: TestAnswerCreateManyQuestionInputEnvelope
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
  }

  export type ReviewQueueCreateNestedOneWithoutQuestionInput = {
    create?: XOR<ReviewQueueCreateWithoutQuestionInput, ReviewQueueUncheckedCreateWithoutQuestionInput>
    connectOrCreate?: ReviewQueueCreateOrConnectWithoutQuestionInput
    connect?: ReviewQueueWhereUniqueInput
  }

  export type ImportBatchQuestionCreateNestedManyWithoutQuestionInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutQuestionInput, ImportBatchQuestionUncheckedCreateWithoutQuestionInput> | ImportBatchQuestionCreateWithoutQuestionInput[] | ImportBatchQuestionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutQuestionInput | ImportBatchQuestionCreateOrConnectWithoutQuestionInput[]
    createMany?: ImportBatchQuestionCreateManyQuestionInputEnvelope
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
  }

  export type UserProgressCreateNestedManyWithoutQuestionInput = {
    create?: XOR<UserProgressCreateWithoutQuestionInput, UserProgressUncheckedCreateWithoutQuestionInput> | UserProgressCreateWithoutQuestionInput[] | UserProgressUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutQuestionInput | UserProgressCreateOrConnectWithoutQuestionInput[]
    createMany?: UserProgressCreateManyQuestionInputEnvelope
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
  }

  export type OptionUncheckedCreateNestedManyWithoutQuestionInput = {
    create?: XOR<OptionCreateWithoutQuestionInput, OptionUncheckedCreateWithoutQuestionInput> | OptionCreateWithoutQuestionInput[] | OptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OptionCreateOrConnectWithoutQuestionInput | OptionCreateOrConnectWithoutQuestionInput[]
    createMany?: OptionCreateManyQuestionInputEnvelope
    connect?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
  }

  export type TestAnswerUncheckedCreateNestedManyWithoutQuestionInput = {
    create?: XOR<TestAnswerCreateWithoutQuestionInput, TestAnswerUncheckedCreateWithoutQuestionInput> | TestAnswerCreateWithoutQuestionInput[] | TestAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutQuestionInput | TestAnswerCreateOrConnectWithoutQuestionInput[]
    createMany?: TestAnswerCreateManyQuestionInputEnvelope
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
  }

  export type ReviewQueueUncheckedCreateNestedOneWithoutQuestionInput = {
    create?: XOR<ReviewQueueCreateWithoutQuestionInput, ReviewQueueUncheckedCreateWithoutQuestionInput>
    connectOrCreate?: ReviewQueueCreateOrConnectWithoutQuestionInput
    connect?: ReviewQueueWhereUniqueInput
  }

  export type ImportBatchQuestionUncheckedCreateNestedManyWithoutQuestionInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutQuestionInput, ImportBatchQuestionUncheckedCreateWithoutQuestionInput> | ImportBatchQuestionCreateWithoutQuestionInput[] | ImportBatchQuestionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutQuestionInput | ImportBatchQuestionCreateOrConnectWithoutQuestionInput[]
    createMany?: ImportBatchQuestionCreateManyQuestionInputEnvelope
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
  }

  export type UserProgressUncheckedCreateNestedManyWithoutQuestionInput = {
    create?: XOR<UserProgressCreateWithoutQuestionInput, UserProgressUncheckedCreateWithoutQuestionInput> | UserProgressCreateWithoutQuestionInput[] | UserProgressUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutQuestionInput | UserProgressCreateOrConnectWithoutQuestionInput[]
    createMany?: UserProgressCreateManyQuestionInputEnvelope
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CaseStudyUpdateOneWithoutQuestionsNestedInput = {
    create?: XOR<CaseStudyCreateWithoutQuestionsInput, CaseStudyUncheckedCreateWithoutQuestionsInput>
    connectOrCreate?: CaseStudyCreateOrConnectWithoutQuestionsInput
    upsert?: CaseStudyUpsertWithoutQuestionsInput
    disconnect?: CaseStudyWhereInput | boolean
    delete?: CaseStudyWhereInput | boolean
    connect?: CaseStudyWhereUniqueInput
    update?: XOR<XOR<CaseStudyUpdateToOneWithWhereWithoutQuestionsInput, CaseStudyUpdateWithoutQuestionsInput>, CaseStudyUncheckedUpdateWithoutQuestionsInput>
  }

  export type OptionUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<OptionCreateWithoutQuestionInput, OptionUncheckedCreateWithoutQuestionInput> | OptionCreateWithoutQuestionInput[] | OptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OptionCreateOrConnectWithoutQuestionInput | OptionCreateOrConnectWithoutQuestionInput[]
    upsert?: OptionUpsertWithWhereUniqueWithoutQuestionInput | OptionUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: OptionCreateManyQuestionInputEnvelope
    set?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    disconnect?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    delete?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    connect?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    update?: OptionUpdateWithWhereUniqueWithoutQuestionInput | OptionUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: OptionUpdateManyWithWhereWithoutQuestionInput | OptionUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: OptionScalarWhereInput | OptionScalarWhereInput[]
  }

  export type TestAnswerUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<TestAnswerCreateWithoutQuestionInput, TestAnswerUncheckedCreateWithoutQuestionInput> | TestAnswerCreateWithoutQuestionInput[] | TestAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutQuestionInput | TestAnswerCreateOrConnectWithoutQuestionInput[]
    upsert?: TestAnswerUpsertWithWhereUniqueWithoutQuestionInput | TestAnswerUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: TestAnswerCreateManyQuestionInputEnvelope
    set?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    disconnect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    delete?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    update?: TestAnswerUpdateWithWhereUniqueWithoutQuestionInput | TestAnswerUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: TestAnswerUpdateManyWithWhereWithoutQuestionInput | TestAnswerUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: TestAnswerScalarWhereInput | TestAnswerScalarWhereInput[]
  }

  export type ReviewQueueUpdateOneWithoutQuestionNestedInput = {
    create?: XOR<ReviewQueueCreateWithoutQuestionInput, ReviewQueueUncheckedCreateWithoutQuestionInput>
    connectOrCreate?: ReviewQueueCreateOrConnectWithoutQuestionInput
    upsert?: ReviewQueueUpsertWithoutQuestionInput
    disconnect?: ReviewQueueWhereInput | boolean
    delete?: ReviewQueueWhereInput | boolean
    connect?: ReviewQueueWhereUniqueInput
    update?: XOR<XOR<ReviewQueueUpdateToOneWithWhereWithoutQuestionInput, ReviewQueueUpdateWithoutQuestionInput>, ReviewQueueUncheckedUpdateWithoutQuestionInput>
  }

  export type ImportBatchQuestionUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutQuestionInput, ImportBatchQuestionUncheckedCreateWithoutQuestionInput> | ImportBatchQuestionCreateWithoutQuestionInput[] | ImportBatchQuestionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutQuestionInput | ImportBatchQuestionCreateOrConnectWithoutQuestionInput[]
    upsert?: ImportBatchQuestionUpsertWithWhereUniqueWithoutQuestionInput | ImportBatchQuestionUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: ImportBatchQuestionCreateManyQuestionInputEnvelope
    set?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    disconnect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    delete?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    update?: ImportBatchQuestionUpdateWithWhereUniqueWithoutQuestionInput | ImportBatchQuestionUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: ImportBatchQuestionUpdateManyWithWhereWithoutQuestionInput | ImportBatchQuestionUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: ImportBatchQuestionScalarWhereInput | ImportBatchQuestionScalarWhereInput[]
  }

  export type UserProgressUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<UserProgressCreateWithoutQuestionInput, UserProgressUncheckedCreateWithoutQuestionInput> | UserProgressCreateWithoutQuestionInput[] | UserProgressUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutQuestionInput | UserProgressCreateOrConnectWithoutQuestionInput[]
    upsert?: UserProgressUpsertWithWhereUniqueWithoutQuestionInput | UserProgressUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: UserProgressCreateManyQuestionInputEnvelope
    set?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    disconnect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    delete?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    update?: UserProgressUpdateWithWhereUniqueWithoutQuestionInput | UserProgressUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: UserProgressUpdateManyWithWhereWithoutQuestionInput | UserProgressUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
  }

  export type OptionUncheckedUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<OptionCreateWithoutQuestionInput, OptionUncheckedCreateWithoutQuestionInput> | OptionCreateWithoutQuestionInput[] | OptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OptionCreateOrConnectWithoutQuestionInput | OptionCreateOrConnectWithoutQuestionInput[]
    upsert?: OptionUpsertWithWhereUniqueWithoutQuestionInput | OptionUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: OptionCreateManyQuestionInputEnvelope
    set?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    disconnect?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    delete?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    connect?: OptionWhereUniqueInput | OptionWhereUniqueInput[]
    update?: OptionUpdateWithWhereUniqueWithoutQuestionInput | OptionUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: OptionUpdateManyWithWhereWithoutQuestionInput | OptionUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: OptionScalarWhereInput | OptionScalarWhereInput[]
  }

  export type TestAnswerUncheckedUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<TestAnswerCreateWithoutQuestionInput, TestAnswerUncheckedCreateWithoutQuestionInput> | TestAnswerCreateWithoutQuestionInput[] | TestAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutQuestionInput | TestAnswerCreateOrConnectWithoutQuestionInput[]
    upsert?: TestAnswerUpsertWithWhereUniqueWithoutQuestionInput | TestAnswerUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: TestAnswerCreateManyQuestionInputEnvelope
    set?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    disconnect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    delete?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    update?: TestAnswerUpdateWithWhereUniqueWithoutQuestionInput | TestAnswerUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: TestAnswerUpdateManyWithWhereWithoutQuestionInput | TestAnswerUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: TestAnswerScalarWhereInput | TestAnswerScalarWhereInput[]
  }

  export type ReviewQueueUncheckedUpdateOneWithoutQuestionNestedInput = {
    create?: XOR<ReviewQueueCreateWithoutQuestionInput, ReviewQueueUncheckedCreateWithoutQuestionInput>
    connectOrCreate?: ReviewQueueCreateOrConnectWithoutQuestionInput
    upsert?: ReviewQueueUpsertWithoutQuestionInput
    disconnect?: ReviewQueueWhereInput | boolean
    delete?: ReviewQueueWhereInput | boolean
    connect?: ReviewQueueWhereUniqueInput
    update?: XOR<XOR<ReviewQueueUpdateToOneWithWhereWithoutQuestionInput, ReviewQueueUpdateWithoutQuestionInput>, ReviewQueueUncheckedUpdateWithoutQuestionInput>
  }

  export type ImportBatchQuestionUncheckedUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutQuestionInput, ImportBatchQuestionUncheckedCreateWithoutQuestionInput> | ImportBatchQuestionCreateWithoutQuestionInput[] | ImportBatchQuestionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutQuestionInput | ImportBatchQuestionCreateOrConnectWithoutQuestionInput[]
    upsert?: ImportBatchQuestionUpsertWithWhereUniqueWithoutQuestionInput | ImportBatchQuestionUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: ImportBatchQuestionCreateManyQuestionInputEnvelope
    set?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    disconnect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    delete?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    update?: ImportBatchQuestionUpdateWithWhereUniqueWithoutQuestionInput | ImportBatchQuestionUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: ImportBatchQuestionUpdateManyWithWhereWithoutQuestionInput | ImportBatchQuestionUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: ImportBatchQuestionScalarWhereInput | ImportBatchQuestionScalarWhereInput[]
  }

  export type UserProgressUncheckedUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<UserProgressCreateWithoutQuestionInput, UserProgressUncheckedCreateWithoutQuestionInput> | UserProgressCreateWithoutQuestionInput[] | UserProgressUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutQuestionInput | UserProgressCreateOrConnectWithoutQuestionInput[]
    upsert?: UserProgressUpsertWithWhereUniqueWithoutQuestionInput | UserProgressUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: UserProgressCreateManyQuestionInputEnvelope
    set?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    disconnect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    delete?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    update?: UserProgressUpdateWithWhereUniqueWithoutQuestionInput | UserProgressUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: UserProgressUpdateManyWithWhereWithoutQuestionInput | UserProgressUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
  }

  export type QuestionCreateNestedOneWithoutOptionsInput = {
    create?: XOR<QuestionCreateWithoutOptionsInput, QuestionUncheckedCreateWithoutOptionsInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutOptionsInput
    connect?: QuestionWhereUniqueInput
  }

  export type QuestionUpdateOneRequiredWithoutOptionsNestedInput = {
    create?: XOR<QuestionCreateWithoutOptionsInput, QuestionUncheckedCreateWithoutOptionsInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutOptionsInput
    upsert?: QuestionUpsertWithoutOptionsInput
    connect?: QuestionWhereUniqueInput
    update?: XOR<XOR<QuestionUpdateToOneWithWhereWithoutOptionsInput, QuestionUpdateWithoutOptionsInput>, QuestionUncheckedUpdateWithoutOptionsInput>
  }

  export type QuestionCreateNestedManyWithoutCaseStudyInput = {
    create?: XOR<QuestionCreateWithoutCaseStudyInput, QuestionUncheckedCreateWithoutCaseStudyInput> | QuestionCreateWithoutCaseStudyInput[] | QuestionUncheckedCreateWithoutCaseStudyInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutCaseStudyInput | QuestionCreateOrConnectWithoutCaseStudyInput[]
    createMany?: QuestionCreateManyCaseStudyInputEnvelope
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
  }

  export type QuestionUncheckedCreateNestedManyWithoutCaseStudyInput = {
    create?: XOR<QuestionCreateWithoutCaseStudyInput, QuestionUncheckedCreateWithoutCaseStudyInput> | QuestionCreateWithoutCaseStudyInput[] | QuestionUncheckedCreateWithoutCaseStudyInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutCaseStudyInput | QuestionCreateOrConnectWithoutCaseStudyInput[]
    createMany?: QuestionCreateManyCaseStudyInputEnvelope
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
  }

  export type QuestionUpdateManyWithoutCaseStudyNestedInput = {
    create?: XOR<QuestionCreateWithoutCaseStudyInput, QuestionUncheckedCreateWithoutCaseStudyInput> | QuestionCreateWithoutCaseStudyInput[] | QuestionUncheckedCreateWithoutCaseStudyInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutCaseStudyInput | QuestionCreateOrConnectWithoutCaseStudyInput[]
    upsert?: QuestionUpsertWithWhereUniqueWithoutCaseStudyInput | QuestionUpsertWithWhereUniqueWithoutCaseStudyInput[]
    createMany?: QuestionCreateManyCaseStudyInputEnvelope
    set?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    disconnect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    delete?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    update?: QuestionUpdateWithWhereUniqueWithoutCaseStudyInput | QuestionUpdateWithWhereUniqueWithoutCaseStudyInput[]
    updateMany?: QuestionUpdateManyWithWhereWithoutCaseStudyInput | QuestionUpdateManyWithWhereWithoutCaseStudyInput[]
    deleteMany?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
  }

  export type QuestionUncheckedUpdateManyWithoutCaseStudyNestedInput = {
    create?: XOR<QuestionCreateWithoutCaseStudyInput, QuestionUncheckedCreateWithoutCaseStudyInput> | QuestionCreateWithoutCaseStudyInput[] | QuestionUncheckedCreateWithoutCaseStudyInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutCaseStudyInput | QuestionCreateOrConnectWithoutCaseStudyInput[]
    upsert?: QuestionUpsertWithWhereUniqueWithoutCaseStudyInput | QuestionUpsertWithWhereUniqueWithoutCaseStudyInput[]
    createMany?: QuestionCreateManyCaseStudyInputEnvelope
    set?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    disconnect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    delete?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    update?: QuestionUpdateWithWhereUniqueWithoutCaseStudyInput | QuestionUpdateWithWhereUniqueWithoutCaseStudyInput[]
    updateMany?: QuestionUpdateManyWithWhereWithoutCaseStudyInput | QuestionUpdateManyWithWhereWithoutCaseStudyInput[]
    deleteMany?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
  }

  export type ImportBatchQuestionCreateNestedManyWithoutImportBatchInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutImportBatchInput, ImportBatchQuestionUncheckedCreateWithoutImportBatchInput> | ImportBatchQuestionCreateWithoutImportBatchInput[] | ImportBatchQuestionUncheckedCreateWithoutImportBatchInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutImportBatchInput | ImportBatchQuestionCreateOrConnectWithoutImportBatchInput[]
    createMany?: ImportBatchQuestionCreateManyImportBatchInputEnvelope
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
  }

  export type ImportBatchQuestionUncheckedCreateNestedManyWithoutImportBatchInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutImportBatchInput, ImportBatchQuestionUncheckedCreateWithoutImportBatchInput> | ImportBatchQuestionCreateWithoutImportBatchInput[] | ImportBatchQuestionUncheckedCreateWithoutImportBatchInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutImportBatchInput | ImportBatchQuestionCreateOrConnectWithoutImportBatchInput[]
    createMany?: ImportBatchQuestionCreateManyImportBatchInputEnvelope
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ImportBatchQuestionUpdateManyWithoutImportBatchNestedInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutImportBatchInput, ImportBatchQuestionUncheckedCreateWithoutImportBatchInput> | ImportBatchQuestionCreateWithoutImportBatchInput[] | ImportBatchQuestionUncheckedCreateWithoutImportBatchInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutImportBatchInput | ImportBatchQuestionCreateOrConnectWithoutImportBatchInput[]
    upsert?: ImportBatchQuestionUpsertWithWhereUniqueWithoutImportBatchInput | ImportBatchQuestionUpsertWithWhereUniqueWithoutImportBatchInput[]
    createMany?: ImportBatchQuestionCreateManyImportBatchInputEnvelope
    set?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    disconnect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    delete?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    update?: ImportBatchQuestionUpdateWithWhereUniqueWithoutImportBatchInput | ImportBatchQuestionUpdateWithWhereUniqueWithoutImportBatchInput[]
    updateMany?: ImportBatchQuestionUpdateManyWithWhereWithoutImportBatchInput | ImportBatchQuestionUpdateManyWithWhereWithoutImportBatchInput[]
    deleteMany?: ImportBatchQuestionScalarWhereInput | ImportBatchQuestionScalarWhereInput[]
  }

  export type ImportBatchQuestionUncheckedUpdateManyWithoutImportBatchNestedInput = {
    create?: XOR<ImportBatchQuestionCreateWithoutImportBatchInput, ImportBatchQuestionUncheckedCreateWithoutImportBatchInput> | ImportBatchQuestionCreateWithoutImportBatchInput[] | ImportBatchQuestionUncheckedCreateWithoutImportBatchInput[]
    connectOrCreate?: ImportBatchQuestionCreateOrConnectWithoutImportBatchInput | ImportBatchQuestionCreateOrConnectWithoutImportBatchInput[]
    upsert?: ImportBatchQuestionUpsertWithWhereUniqueWithoutImportBatchInput | ImportBatchQuestionUpsertWithWhereUniqueWithoutImportBatchInput[]
    createMany?: ImportBatchQuestionCreateManyImportBatchInputEnvelope
    set?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    disconnect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    delete?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    connect?: ImportBatchQuestionWhereUniqueInput | ImportBatchQuestionWhereUniqueInput[]
    update?: ImportBatchQuestionUpdateWithWhereUniqueWithoutImportBatchInput | ImportBatchQuestionUpdateWithWhereUniqueWithoutImportBatchInput[]
    updateMany?: ImportBatchQuestionUpdateManyWithWhereWithoutImportBatchInput | ImportBatchQuestionUpdateManyWithWhereWithoutImportBatchInput[]
    deleteMany?: ImportBatchQuestionScalarWhereInput | ImportBatchQuestionScalarWhereInput[]
  }

  export type ImportBatchCreateNestedOneWithoutItemsInput = {
    create?: XOR<ImportBatchCreateWithoutItemsInput, ImportBatchUncheckedCreateWithoutItemsInput>
    connectOrCreate?: ImportBatchCreateOrConnectWithoutItemsInput
    connect?: ImportBatchWhereUniqueInput
  }

  export type QuestionCreateNestedOneWithoutImportEventsInput = {
    create?: XOR<QuestionCreateWithoutImportEventsInput, QuestionUncheckedCreateWithoutImportEventsInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutImportEventsInput
    connect?: QuestionWhereUniqueInput
  }

  export type ImportBatchUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<ImportBatchCreateWithoutItemsInput, ImportBatchUncheckedCreateWithoutItemsInput>
    connectOrCreate?: ImportBatchCreateOrConnectWithoutItemsInput
    upsert?: ImportBatchUpsertWithoutItemsInput
    connect?: ImportBatchWhereUniqueInput
    update?: XOR<XOR<ImportBatchUpdateToOneWithWhereWithoutItemsInput, ImportBatchUpdateWithoutItemsInput>, ImportBatchUncheckedUpdateWithoutItemsInput>
  }

  export type QuestionUpdateOneWithoutImportEventsNestedInput = {
    create?: XOR<QuestionCreateWithoutImportEventsInput, QuestionUncheckedCreateWithoutImportEventsInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutImportEventsInput
    upsert?: QuestionUpsertWithoutImportEventsInput
    disconnect?: QuestionWhereInput | boolean
    delete?: QuestionWhereInput | boolean
    connect?: QuestionWhereUniqueInput
    update?: XOR<XOR<QuestionUpdateToOneWithWhereWithoutImportEventsInput, QuestionUpdateWithoutImportEventsInput>, QuestionUncheckedUpdateWithoutImportEventsInput>
  }

  export type TestAnswerCreateNestedManyWithoutTestSessionInput = {
    create?: XOR<TestAnswerCreateWithoutTestSessionInput, TestAnswerUncheckedCreateWithoutTestSessionInput> | TestAnswerCreateWithoutTestSessionInput[] | TestAnswerUncheckedCreateWithoutTestSessionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutTestSessionInput | TestAnswerCreateOrConnectWithoutTestSessionInput[]
    createMany?: TestAnswerCreateManyTestSessionInputEnvelope
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
  }

  export type TestAnswerUncheckedCreateNestedManyWithoutTestSessionInput = {
    create?: XOR<TestAnswerCreateWithoutTestSessionInput, TestAnswerUncheckedCreateWithoutTestSessionInput> | TestAnswerCreateWithoutTestSessionInput[] | TestAnswerUncheckedCreateWithoutTestSessionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutTestSessionInput | TestAnswerCreateOrConnectWithoutTestSessionInput[]
    createMany?: TestAnswerCreateManyTestSessionInputEnvelope
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type TestAnswerUpdateManyWithoutTestSessionNestedInput = {
    create?: XOR<TestAnswerCreateWithoutTestSessionInput, TestAnswerUncheckedCreateWithoutTestSessionInput> | TestAnswerCreateWithoutTestSessionInput[] | TestAnswerUncheckedCreateWithoutTestSessionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutTestSessionInput | TestAnswerCreateOrConnectWithoutTestSessionInput[]
    upsert?: TestAnswerUpsertWithWhereUniqueWithoutTestSessionInput | TestAnswerUpsertWithWhereUniqueWithoutTestSessionInput[]
    createMany?: TestAnswerCreateManyTestSessionInputEnvelope
    set?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    disconnect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    delete?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    update?: TestAnswerUpdateWithWhereUniqueWithoutTestSessionInput | TestAnswerUpdateWithWhereUniqueWithoutTestSessionInput[]
    updateMany?: TestAnswerUpdateManyWithWhereWithoutTestSessionInput | TestAnswerUpdateManyWithWhereWithoutTestSessionInput[]
    deleteMany?: TestAnswerScalarWhereInput | TestAnswerScalarWhereInput[]
  }

  export type TestAnswerUncheckedUpdateManyWithoutTestSessionNestedInput = {
    create?: XOR<TestAnswerCreateWithoutTestSessionInput, TestAnswerUncheckedCreateWithoutTestSessionInput> | TestAnswerCreateWithoutTestSessionInput[] | TestAnswerUncheckedCreateWithoutTestSessionInput[]
    connectOrCreate?: TestAnswerCreateOrConnectWithoutTestSessionInput | TestAnswerCreateOrConnectWithoutTestSessionInput[]
    upsert?: TestAnswerUpsertWithWhereUniqueWithoutTestSessionInput | TestAnswerUpsertWithWhereUniqueWithoutTestSessionInput[]
    createMany?: TestAnswerCreateManyTestSessionInputEnvelope
    set?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    disconnect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    delete?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    connect?: TestAnswerWhereUniqueInput | TestAnswerWhereUniqueInput[]
    update?: TestAnswerUpdateWithWhereUniqueWithoutTestSessionInput | TestAnswerUpdateWithWhereUniqueWithoutTestSessionInput[]
    updateMany?: TestAnswerUpdateManyWithWhereWithoutTestSessionInput | TestAnswerUpdateManyWithWhereWithoutTestSessionInput[]
    deleteMany?: TestAnswerScalarWhereInput | TestAnswerScalarWhereInput[]
  }

  export type TestSessionCreateNestedOneWithoutAnswersInput = {
    create?: XOR<TestSessionCreateWithoutAnswersInput, TestSessionUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: TestSessionCreateOrConnectWithoutAnswersInput
    connect?: TestSessionWhereUniqueInput
  }

  export type QuestionCreateNestedOneWithoutTestAnswersInput = {
    create?: XOR<QuestionCreateWithoutTestAnswersInput, QuestionUncheckedCreateWithoutTestAnswersInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutTestAnswersInput
    connect?: QuestionWhereUniqueInput
  }

  export type TestSessionUpdateOneRequiredWithoutAnswersNestedInput = {
    create?: XOR<TestSessionCreateWithoutAnswersInput, TestSessionUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: TestSessionCreateOrConnectWithoutAnswersInput
    upsert?: TestSessionUpsertWithoutAnswersInput
    connect?: TestSessionWhereUniqueInput
    update?: XOR<XOR<TestSessionUpdateToOneWithWhereWithoutAnswersInput, TestSessionUpdateWithoutAnswersInput>, TestSessionUncheckedUpdateWithoutAnswersInput>
  }

  export type QuestionUpdateOneRequiredWithoutTestAnswersNestedInput = {
    create?: XOR<QuestionCreateWithoutTestAnswersInput, QuestionUncheckedCreateWithoutTestAnswersInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutTestAnswersInput
    upsert?: QuestionUpsertWithoutTestAnswersInput
    connect?: QuestionWhereUniqueInput
    update?: XOR<XOR<QuestionUpdateToOneWithWhereWithoutTestAnswersInput, QuestionUpdateWithoutTestAnswersInput>, QuestionUncheckedUpdateWithoutTestAnswersInput>
  }

  export type QuestionCreateNestedOneWithoutReviewQueueInput = {
    create?: XOR<QuestionCreateWithoutReviewQueueInput, QuestionUncheckedCreateWithoutReviewQueueInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutReviewQueueInput
    connect?: QuestionWhereUniqueInput
  }

  export type QuestionUpdateOneRequiredWithoutReviewQueueNestedInput = {
    create?: XOR<QuestionCreateWithoutReviewQueueInput, QuestionUncheckedCreateWithoutReviewQueueInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutReviewQueueInput
    upsert?: QuestionUpsertWithoutReviewQueueInput
    connect?: QuestionWhereUniqueInput
    update?: XOR<XOR<QuestionUpdateToOneWithWhereWithoutReviewQueueInput, QuestionUpdateWithoutReviewQueueInput>, QuestionUncheckedUpdateWithoutReviewQueueInput>
  }

  export type QuestionCreateNestedOneWithoutProgressSnapshotsInput = {
    create?: XOR<QuestionCreateWithoutProgressSnapshotsInput, QuestionUncheckedCreateWithoutProgressSnapshotsInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutProgressSnapshotsInput
    connect?: QuestionWhereUniqueInput
  }

  export type QuestionUpdateOneWithoutProgressSnapshotsNestedInput = {
    create?: XOR<QuestionCreateWithoutProgressSnapshotsInput, QuestionUncheckedCreateWithoutProgressSnapshotsInput>
    connectOrCreate?: QuestionCreateOrConnectWithoutProgressSnapshotsInput
    upsert?: QuestionUpsertWithoutProgressSnapshotsInput
    disconnect?: QuestionWhereInput | boolean
    delete?: QuestionWhereInput | boolean
    connect?: QuestionWhereUniqueInput
    update?: XOR<XOR<QuestionUpdateToOneWithWhereWithoutProgressSnapshotsInput, QuestionUpdateWithoutProgressSnapshotsInput>, QuestionUncheckedUpdateWithoutProgressSnapshotsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type CaseStudyCreateWithoutQuestionsInput = {
    id: string
    title: string
    description?: string | null
    topicNumber?: number | null
    section?: string | null
    source?: string | null
  }

  export type CaseStudyUncheckedCreateWithoutQuestionsInput = {
    id: string
    title: string
    description?: string | null
    topicNumber?: number | null
    section?: string | null
    source?: string | null
  }

  export type CaseStudyCreateOrConnectWithoutQuestionsInput = {
    where: CaseStudyWhereUniqueInput
    create: XOR<CaseStudyCreateWithoutQuestionsInput, CaseStudyUncheckedCreateWithoutQuestionsInput>
  }

  export type OptionCreateWithoutQuestionInput = {
    id?: string
    label: string
    text: string
    isCorrect: boolean
    explanation?: string | null
  }

  export type OptionUncheckedCreateWithoutQuestionInput = {
    id?: string
    label: string
    text: string
    isCorrect: boolean
    explanation?: string | null
  }

  export type OptionCreateOrConnectWithoutQuestionInput = {
    where: OptionWhereUniqueInput
    create: XOR<OptionCreateWithoutQuestionInput, OptionUncheckedCreateWithoutQuestionInput>
  }

  export type OptionCreateManyQuestionInputEnvelope = {
    data: OptionCreateManyQuestionInput | OptionCreateManyQuestionInput[]
  }

  export type TestAnswerCreateWithoutQuestionInput = {
    id?: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
    testSession: TestSessionCreateNestedOneWithoutAnswersInput
  }

  export type TestAnswerUncheckedCreateWithoutQuestionInput = {
    id?: string
    testSessionId: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
  }

  export type TestAnswerCreateOrConnectWithoutQuestionInput = {
    where: TestAnswerWhereUniqueInput
    create: XOR<TestAnswerCreateWithoutQuestionInput, TestAnswerUncheckedCreateWithoutQuestionInput>
  }

  export type TestAnswerCreateManyQuestionInputEnvelope = {
    data: TestAnswerCreateManyQuestionInput | TestAnswerCreateManyQuestionInput[]
  }

  export type ReviewQueueCreateWithoutQuestionInput = {
    nextReviewAt: Date | string
    intervalDays?: number
    easeFactor?: number
    masteryLevel?: number
    lastResult?: string | null
    totalAttempts?: number
    correctAttempts?: number
    wrongAttempts?: number
    lastReviewedAt?: Date | string | null
  }

  export type ReviewQueueUncheckedCreateWithoutQuestionInput = {
    nextReviewAt: Date | string
    intervalDays?: number
    easeFactor?: number
    masteryLevel?: number
    lastResult?: string | null
    totalAttempts?: number
    correctAttempts?: number
    wrongAttempts?: number
    lastReviewedAt?: Date | string | null
  }

  export type ReviewQueueCreateOrConnectWithoutQuestionInput = {
    where: ReviewQueueWhereUniqueInput
    create: XOR<ReviewQueueCreateWithoutQuestionInput, ReviewQueueUncheckedCreateWithoutQuestionInput>
  }

  export type ImportBatchQuestionCreateWithoutQuestionInput = {
    id?: string
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
    importBatch: ImportBatchCreateNestedOneWithoutItemsInput
  }

  export type ImportBatchQuestionUncheckedCreateWithoutQuestionInput = {
    id?: string
    importBatchId: string
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
  }

  export type ImportBatchQuestionCreateOrConnectWithoutQuestionInput = {
    where: ImportBatchQuestionWhereUniqueInput
    create: XOR<ImportBatchQuestionCreateWithoutQuestionInput, ImportBatchQuestionUncheckedCreateWithoutQuestionInput>
  }

  export type ImportBatchQuestionCreateManyQuestionInputEnvelope = {
    data: ImportBatchQuestionCreateManyQuestionInput | ImportBatchQuestionCreateManyQuestionInput[]
  }

  export type UserProgressCreateWithoutQuestionInput = {
    id?: string
    scopeType: string
    scopeKey: string
    topicNumber?: number | null
    section?: string | null
    attempts?: number
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    lastAttemptAt?: Date | string | null
    masteryLevel?: number
    xp?: number
  }

  export type UserProgressUncheckedCreateWithoutQuestionInput = {
    id?: string
    scopeType: string
    scopeKey: string
    topicNumber?: number | null
    section?: string | null
    attempts?: number
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    lastAttemptAt?: Date | string | null
    masteryLevel?: number
    xp?: number
  }

  export type UserProgressCreateOrConnectWithoutQuestionInput = {
    where: UserProgressWhereUniqueInput
    create: XOR<UserProgressCreateWithoutQuestionInput, UserProgressUncheckedCreateWithoutQuestionInput>
  }

  export type UserProgressCreateManyQuestionInputEnvelope = {
    data: UserProgressCreateManyQuestionInput | UserProgressCreateManyQuestionInput[]
  }

  export type CaseStudyUpsertWithoutQuestionsInput = {
    update: XOR<CaseStudyUpdateWithoutQuestionsInput, CaseStudyUncheckedUpdateWithoutQuestionsInput>
    create: XOR<CaseStudyCreateWithoutQuestionsInput, CaseStudyUncheckedCreateWithoutQuestionsInput>
    where?: CaseStudyWhereInput
  }

  export type CaseStudyUpdateToOneWithWhereWithoutQuestionsInput = {
    where?: CaseStudyWhereInput
    data: XOR<CaseStudyUpdateWithoutQuestionsInput, CaseStudyUncheckedUpdateWithoutQuestionsInput>
  }

  export type CaseStudyUpdateWithoutQuestionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CaseStudyUncheckedUpdateWithoutQuestionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OptionUpsertWithWhereUniqueWithoutQuestionInput = {
    where: OptionWhereUniqueInput
    update: XOR<OptionUpdateWithoutQuestionInput, OptionUncheckedUpdateWithoutQuestionInput>
    create: XOR<OptionCreateWithoutQuestionInput, OptionUncheckedCreateWithoutQuestionInput>
  }

  export type OptionUpdateWithWhereUniqueWithoutQuestionInput = {
    where: OptionWhereUniqueInput
    data: XOR<OptionUpdateWithoutQuestionInput, OptionUncheckedUpdateWithoutQuestionInput>
  }

  export type OptionUpdateManyWithWhereWithoutQuestionInput = {
    where: OptionScalarWhereInput
    data: XOR<OptionUpdateManyMutationInput, OptionUncheckedUpdateManyWithoutQuestionInput>
  }

  export type OptionScalarWhereInput = {
    AND?: OptionScalarWhereInput | OptionScalarWhereInput[]
    OR?: OptionScalarWhereInput[]
    NOT?: OptionScalarWhereInput | OptionScalarWhereInput[]
    id?: StringFilter<"Option"> | string
    questionId?: StringFilter<"Option"> | string
    label?: StringFilter<"Option"> | string
    text?: StringFilter<"Option"> | string
    isCorrect?: BoolFilter<"Option"> | boolean
    explanation?: StringNullableFilter<"Option"> | string | null
  }

  export type TestAnswerUpsertWithWhereUniqueWithoutQuestionInput = {
    where: TestAnswerWhereUniqueInput
    update: XOR<TestAnswerUpdateWithoutQuestionInput, TestAnswerUncheckedUpdateWithoutQuestionInput>
    create: XOR<TestAnswerCreateWithoutQuestionInput, TestAnswerUncheckedCreateWithoutQuestionInput>
  }

  export type TestAnswerUpdateWithWhereUniqueWithoutQuestionInput = {
    where: TestAnswerWhereUniqueInput
    data: XOR<TestAnswerUpdateWithoutQuestionInput, TestAnswerUncheckedUpdateWithoutQuestionInput>
  }

  export type TestAnswerUpdateManyWithWhereWithoutQuestionInput = {
    where: TestAnswerScalarWhereInput
    data: XOR<TestAnswerUpdateManyMutationInput, TestAnswerUncheckedUpdateManyWithoutQuestionInput>
  }

  export type TestAnswerScalarWhereInput = {
    AND?: TestAnswerScalarWhereInput | TestAnswerScalarWhereInput[]
    OR?: TestAnswerScalarWhereInput[]
    NOT?: TestAnswerScalarWhereInput | TestAnswerScalarWhereInput[]
    id?: StringFilter<"TestAnswer"> | string
    testSessionId?: StringFilter<"TestAnswer"> | string
    questionId?: StringFilter<"TestAnswer"> | string
    selectedOptionId?: StringNullableFilter<"TestAnswer"> | string | null
    isCorrect?: BoolFilter<"TestAnswer"> | boolean
    isBlank?: BoolFilter<"TestAnswer"> | boolean
    confidence?: StringNullableFilter<"TestAnswer"> | string | null
    timeSpentSeconds?: IntNullableFilter<"TestAnswer"> | number | null
    answeredAt?: DateTimeFilter<"TestAnswer"> | Date | string
  }

  export type ReviewQueueUpsertWithoutQuestionInput = {
    update: XOR<ReviewQueueUpdateWithoutQuestionInput, ReviewQueueUncheckedUpdateWithoutQuestionInput>
    create: XOR<ReviewQueueCreateWithoutQuestionInput, ReviewQueueUncheckedCreateWithoutQuestionInput>
    where?: ReviewQueueWhereInput
  }

  export type ReviewQueueUpdateToOneWithWhereWithoutQuestionInput = {
    where?: ReviewQueueWhereInput
    data: XOR<ReviewQueueUpdateWithoutQuestionInput, ReviewQueueUncheckedUpdateWithoutQuestionInput>
  }

  export type ReviewQueueUpdateWithoutQuestionInput = {
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    intervalDays?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    lastResult?: NullableStringFieldUpdateOperationsInput | string | null
    totalAttempts?: IntFieldUpdateOperationsInput | number
    correctAttempts?: IntFieldUpdateOperationsInput | number
    wrongAttempts?: IntFieldUpdateOperationsInput | number
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ReviewQueueUncheckedUpdateWithoutQuestionInput = {
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    intervalDays?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    lastResult?: NullableStringFieldUpdateOperationsInput | string | null
    totalAttempts?: IntFieldUpdateOperationsInput | number
    correctAttempts?: IntFieldUpdateOperationsInput | number
    wrongAttempts?: IntFieldUpdateOperationsInput | number
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ImportBatchQuestionUpsertWithWhereUniqueWithoutQuestionInput = {
    where: ImportBatchQuestionWhereUniqueInput
    update: XOR<ImportBatchQuestionUpdateWithoutQuestionInput, ImportBatchQuestionUncheckedUpdateWithoutQuestionInput>
    create: XOR<ImportBatchQuestionCreateWithoutQuestionInput, ImportBatchQuestionUncheckedCreateWithoutQuestionInput>
  }

  export type ImportBatchQuestionUpdateWithWhereUniqueWithoutQuestionInput = {
    where: ImportBatchQuestionWhereUniqueInput
    data: XOR<ImportBatchQuestionUpdateWithoutQuestionInput, ImportBatchQuestionUncheckedUpdateWithoutQuestionInput>
  }

  export type ImportBatchQuestionUpdateManyWithWhereWithoutQuestionInput = {
    where: ImportBatchQuestionScalarWhereInput
    data: XOR<ImportBatchQuestionUpdateManyMutationInput, ImportBatchQuestionUncheckedUpdateManyWithoutQuestionInput>
  }

  export type ImportBatchQuestionScalarWhereInput = {
    AND?: ImportBatchQuestionScalarWhereInput | ImportBatchQuestionScalarWhereInput[]
    OR?: ImportBatchQuestionScalarWhereInput[]
    NOT?: ImportBatchQuestionScalarWhereInput | ImportBatchQuestionScalarWhereInput[]
    id?: StringFilter<"ImportBatchQuestion"> | string
    importBatchId?: StringFilter<"ImportBatchQuestion"> | string
    questionId?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    externalId?: StringFilter<"ImportBatchQuestion"> | string
    action?: StringFilter<"ImportBatchQuestion"> | string
    warningsJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    errorsJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    previousDataJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
    importedDataJson?: StringNullableFilter<"ImportBatchQuestion"> | string | null
  }

  export type UserProgressUpsertWithWhereUniqueWithoutQuestionInput = {
    where: UserProgressWhereUniqueInput
    update: XOR<UserProgressUpdateWithoutQuestionInput, UserProgressUncheckedUpdateWithoutQuestionInput>
    create: XOR<UserProgressCreateWithoutQuestionInput, UserProgressUncheckedCreateWithoutQuestionInput>
  }

  export type UserProgressUpdateWithWhereUniqueWithoutQuestionInput = {
    where: UserProgressWhereUniqueInput
    data: XOR<UserProgressUpdateWithoutQuestionInput, UserProgressUncheckedUpdateWithoutQuestionInput>
  }

  export type UserProgressUpdateManyWithWhereWithoutQuestionInput = {
    where: UserProgressScalarWhereInput
    data: XOR<UserProgressUpdateManyMutationInput, UserProgressUncheckedUpdateManyWithoutQuestionInput>
  }

  export type UserProgressScalarWhereInput = {
    AND?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
    OR?: UserProgressScalarWhereInput[]
    NOT?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
    id?: StringFilter<"UserProgress"> | string
    scopeType?: StringFilter<"UserProgress"> | string
    scopeKey?: StringFilter<"UserProgress"> | string
    topicNumber?: IntNullableFilter<"UserProgress"> | number | null
    section?: StringNullableFilter<"UserProgress"> | string | null
    attempts?: IntFilter<"UserProgress"> | number
    correctCount?: IntFilter<"UserProgress"> | number
    wrongCount?: IntFilter<"UserProgress"> | number
    blankCount?: IntFilter<"UserProgress"> | number
    lastAttemptAt?: DateTimeNullableFilter<"UserProgress"> | Date | string | null
    masteryLevel?: FloatFilter<"UserProgress"> | number
    xp?: IntFilter<"UserProgress"> | number
    questionId?: StringNullableFilter<"UserProgress"> | string | null
  }

  export type QuestionCreateWithoutOptionsInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    caseStudy?: CaseStudyCreateNestedOneWithoutQuestionsInput
    testAnswers?: TestAnswerCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUncheckedCreateWithoutOptionsInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    caseStudyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    testAnswers?: TestAnswerUncheckedCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueUncheckedCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionUncheckedCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type QuestionCreateOrConnectWithoutOptionsInput = {
    where: QuestionWhereUniqueInput
    create: XOR<QuestionCreateWithoutOptionsInput, QuestionUncheckedCreateWithoutOptionsInput>
  }

  export type QuestionUpsertWithoutOptionsInput = {
    update: XOR<QuestionUpdateWithoutOptionsInput, QuestionUncheckedUpdateWithoutOptionsInput>
    create: XOR<QuestionCreateWithoutOptionsInput, QuestionUncheckedCreateWithoutOptionsInput>
    where?: QuestionWhereInput
  }

  export type QuestionUpdateToOneWithWhereWithoutOptionsInput = {
    where?: QuestionWhereInput
    data: XOR<QuestionUpdateWithoutOptionsInput, QuestionUncheckedUpdateWithoutOptionsInput>
  }

  export type QuestionUpdateWithoutOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    caseStudy?: CaseStudyUpdateOneWithoutQuestionsNestedInput
    testAnswers?: TestAnswerUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateWithoutOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    caseStudyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    testAnswers?: TestAnswerUncheckedUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUncheckedUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUncheckedUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionCreateWithoutCaseStudyInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: OptionCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUncheckedCreateWithoutCaseStudyInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: OptionUncheckedCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerUncheckedCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueUncheckedCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionUncheckedCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type QuestionCreateOrConnectWithoutCaseStudyInput = {
    where: QuestionWhereUniqueInput
    create: XOR<QuestionCreateWithoutCaseStudyInput, QuestionUncheckedCreateWithoutCaseStudyInput>
  }

  export type QuestionCreateManyCaseStudyInputEnvelope = {
    data: QuestionCreateManyCaseStudyInput | QuestionCreateManyCaseStudyInput[]
  }

  export type QuestionUpsertWithWhereUniqueWithoutCaseStudyInput = {
    where: QuestionWhereUniqueInput
    update: XOR<QuestionUpdateWithoutCaseStudyInput, QuestionUncheckedUpdateWithoutCaseStudyInput>
    create: XOR<QuestionCreateWithoutCaseStudyInput, QuestionUncheckedCreateWithoutCaseStudyInput>
  }

  export type QuestionUpdateWithWhereUniqueWithoutCaseStudyInput = {
    where: QuestionWhereUniqueInput
    data: XOR<QuestionUpdateWithoutCaseStudyInput, QuestionUncheckedUpdateWithoutCaseStudyInput>
  }

  export type QuestionUpdateManyWithWhereWithoutCaseStudyInput = {
    where: QuestionScalarWhereInput
    data: XOR<QuestionUpdateManyMutationInput, QuestionUncheckedUpdateManyWithoutCaseStudyInput>
  }

  export type QuestionScalarWhereInput = {
    AND?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
    OR?: QuestionScalarWhereInput[]
    NOT?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
    id?: StringFilter<"Question"> | string
    externalId?: StringFilter<"Question"> | string
    examPart?: StringFilter<"Question"> | string
    examExercise?: StringFilter<"Question"> | string
    topicNumber?: IntFilter<"Question"> | number
    topicTitle?: StringFilter<"Question"> | string
    section?: StringFilter<"Question"> | string
    subsection?: StringNullableFilter<"Question"> | string | null
    questionType?: StringFilter<"Question"> | string
    difficulty?: StringFilter<"Question"> | string
    text?: StringFilter<"Question"> | string
    explanation?: StringNullableFilter<"Question"> | string | null
    sourceDocument?: StringNullableFilter<"Question"> | string | null
    sourceReference?: StringNullableFilter<"Question"> | string | null
    tagsJson?: StringFilter<"Question"> | string
    status?: StringFilter<"Question"> | string
    isDemo?: BoolFilter<"Question"> | boolean
    isFavorite?: BoolFilter<"Question"> | boolean
    isDoubtful?: BoolFilter<"Question"> | boolean
    isArchived?: BoolFilter<"Question"> | boolean
    reserveOrder?: IntNullableFilter<"Question"> | number | null
    caseStudyId?: StringNullableFilter<"Question"> | string | null
    createdAt?: DateTimeFilter<"Question"> | Date | string
    updatedAt?: DateTimeFilter<"Question"> | Date | string
  }

  export type ImportBatchQuestionCreateWithoutImportBatchInput = {
    id?: string
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
    question?: QuestionCreateNestedOneWithoutImportEventsInput
  }

  export type ImportBatchQuestionUncheckedCreateWithoutImportBatchInput = {
    id?: string
    questionId?: string | null
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
  }

  export type ImportBatchQuestionCreateOrConnectWithoutImportBatchInput = {
    where: ImportBatchQuestionWhereUniqueInput
    create: XOR<ImportBatchQuestionCreateWithoutImportBatchInput, ImportBatchQuestionUncheckedCreateWithoutImportBatchInput>
  }

  export type ImportBatchQuestionCreateManyImportBatchInputEnvelope = {
    data: ImportBatchQuestionCreateManyImportBatchInput | ImportBatchQuestionCreateManyImportBatchInput[]
  }

  export type ImportBatchQuestionUpsertWithWhereUniqueWithoutImportBatchInput = {
    where: ImportBatchQuestionWhereUniqueInput
    update: XOR<ImportBatchQuestionUpdateWithoutImportBatchInput, ImportBatchQuestionUncheckedUpdateWithoutImportBatchInput>
    create: XOR<ImportBatchQuestionCreateWithoutImportBatchInput, ImportBatchQuestionUncheckedCreateWithoutImportBatchInput>
  }

  export type ImportBatchQuestionUpdateWithWhereUniqueWithoutImportBatchInput = {
    where: ImportBatchQuestionWhereUniqueInput
    data: XOR<ImportBatchQuestionUpdateWithoutImportBatchInput, ImportBatchQuestionUncheckedUpdateWithoutImportBatchInput>
  }

  export type ImportBatchQuestionUpdateManyWithWhereWithoutImportBatchInput = {
    where: ImportBatchQuestionScalarWhereInput
    data: XOR<ImportBatchQuestionUpdateManyMutationInput, ImportBatchQuestionUncheckedUpdateManyWithoutImportBatchInput>
  }

  export type ImportBatchCreateWithoutItemsInput = {
    id?: string
    filename: string
    importedAt?: Date | string
    sourceMetadataJson?: string | null
    totalQuestionsDetected: number
    createdCount?: number
    updatedCount?: number
    skippedCount?: number
    errorCount?: number
    warningsJson?: string | null
    rawSummaryJson?: string | null
    revertedAt?: Date | string | null
  }

  export type ImportBatchUncheckedCreateWithoutItemsInput = {
    id?: string
    filename: string
    importedAt?: Date | string
    sourceMetadataJson?: string | null
    totalQuestionsDetected: number
    createdCount?: number
    updatedCount?: number
    skippedCount?: number
    errorCount?: number
    warningsJson?: string | null
    rawSummaryJson?: string | null
    revertedAt?: Date | string | null
  }

  export type ImportBatchCreateOrConnectWithoutItemsInput = {
    where: ImportBatchWhereUniqueInput
    create: XOR<ImportBatchCreateWithoutItemsInput, ImportBatchUncheckedCreateWithoutItemsInput>
  }

  export type QuestionCreateWithoutImportEventsInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    caseStudy?: CaseStudyCreateNestedOneWithoutQuestionsInput
    options?: OptionCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueCreateNestedOneWithoutQuestionInput
    progressSnapshots?: UserProgressCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUncheckedCreateWithoutImportEventsInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    caseStudyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: OptionUncheckedCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerUncheckedCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueUncheckedCreateNestedOneWithoutQuestionInput
    progressSnapshots?: UserProgressUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type QuestionCreateOrConnectWithoutImportEventsInput = {
    where: QuestionWhereUniqueInput
    create: XOR<QuestionCreateWithoutImportEventsInput, QuestionUncheckedCreateWithoutImportEventsInput>
  }

  export type ImportBatchUpsertWithoutItemsInput = {
    update: XOR<ImportBatchUpdateWithoutItemsInput, ImportBatchUncheckedUpdateWithoutItemsInput>
    create: XOR<ImportBatchCreateWithoutItemsInput, ImportBatchUncheckedCreateWithoutItemsInput>
    where?: ImportBatchWhereInput
  }

  export type ImportBatchUpdateToOneWithWhereWithoutItemsInput = {
    where?: ImportBatchWhereInput
    data: XOR<ImportBatchUpdateWithoutItemsInput, ImportBatchUncheckedUpdateWithoutItemsInput>
  }

  export type ImportBatchUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceMetadataJson?: NullableStringFieldUpdateOperationsInput | string | null
    totalQuestionsDetected?: IntFieldUpdateOperationsInput | number
    createdCount?: IntFieldUpdateOperationsInput | number
    updatedCount?: IntFieldUpdateOperationsInput | number
    skippedCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    rawSummaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    revertedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ImportBatchUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceMetadataJson?: NullableStringFieldUpdateOperationsInput | string | null
    totalQuestionsDetected?: IntFieldUpdateOperationsInput | number
    createdCount?: IntFieldUpdateOperationsInput | number
    updatedCount?: IntFieldUpdateOperationsInput | number
    skippedCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    rawSummaryJson?: NullableStringFieldUpdateOperationsInput | string | null
    revertedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type QuestionUpsertWithoutImportEventsInput = {
    update: XOR<QuestionUpdateWithoutImportEventsInput, QuestionUncheckedUpdateWithoutImportEventsInput>
    create: XOR<QuestionCreateWithoutImportEventsInput, QuestionUncheckedCreateWithoutImportEventsInput>
    where?: QuestionWhereInput
  }

  export type QuestionUpdateToOneWithWhereWithoutImportEventsInput = {
    where?: QuestionWhereInput
    data: XOR<QuestionUpdateWithoutImportEventsInput, QuestionUncheckedUpdateWithoutImportEventsInput>
  }

  export type QuestionUpdateWithoutImportEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    caseStudy?: CaseStudyUpdateOneWithoutQuestionsNestedInput
    options?: OptionUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUpdateOneWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateWithoutImportEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    caseStudyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OptionUncheckedUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUncheckedUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUncheckedUpdateOneWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type TestAnswerCreateWithoutTestSessionInput = {
    id?: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
    question: QuestionCreateNestedOneWithoutTestAnswersInput
  }

  export type TestAnswerUncheckedCreateWithoutTestSessionInput = {
    id?: string
    questionId: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
  }

  export type TestAnswerCreateOrConnectWithoutTestSessionInput = {
    where: TestAnswerWhereUniqueInput
    create: XOR<TestAnswerCreateWithoutTestSessionInput, TestAnswerUncheckedCreateWithoutTestSessionInput>
  }

  export type TestAnswerCreateManyTestSessionInputEnvelope = {
    data: TestAnswerCreateManyTestSessionInput | TestAnswerCreateManyTestSessionInput[]
  }

  export type TestAnswerUpsertWithWhereUniqueWithoutTestSessionInput = {
    where: TestAnswerWhereUniqueInput
    update: XOR<TestAnswerUpdateWithoutTestSessionInput, TestAnswerUncheckedUpdateWithoutTestSessionInput>
    create: XOR<TestAnswerCreateWithoutTestSessionInput, TestAnswerUncheckedCreateWithoutTestSessionInput>
  }

  export type TestAnswerUpdateWithWhereUniqueWithoutTestSessionInput = {
    where: TestAnswerWhereUniqueInput
    data: XOR<TestAnswerUpdateWithoutTestSessionInput, TestAnswerUncheckedUpdateWithoutTestSessionInput>
  }

  export type TestAnswerUpdateManyWithWhereWithoutTestSessionInput = {
    where: TestAnswerScalarWhereInput
    data: XOR<TestAnswerUpdateManyMutationInput, TestAnswerUncheckedUpdateManyWithoutTestSessionInput>
  }

  export type TestSessionCreateWithoutAnswersInput = {
    id?: string
    mode: string
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationSeconds?: number | null
    status?: string
    examExercise: string
    questionIdsJson: string
    totalQuestions: number
    score?: number | null
    maxScore: number
    passed?: boolean | null
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    averageTimePerQuestion?: number | null
    topicFilter?: string | null
    sectionFilter?: string | null
    includeStatusesJson?: string | null
    summaryJson?: string | null
  }

  export type TestSessionUncheckedCreateWithoutAnswersInput = {
    id?: string
    mode: string
    startedAt?: Date | string
    finishedAt?: Date | string | null
    durationSeconds?: number | null
    status?: string
    examExercise: string
    questionIdsJson: string
    totalQuestions: number
    score?: number | null
    maxScore: number
    passed?: boolean | null
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    averageTimePerQuestion?: number | null
    topicFilter?: string | null
    sectionFilter?: string | null
    includeStatusesJson?: string | null
    summaryJson?: string | null
  }

  export type TestSessionCreateOrConnectWithoutAnswersInput = {
    where: TestSessionWhereUniqueInput
    create: XOR<TestSessionCreateWithoutAnswersInput, TestSessionUncheckedCreateWithoutAnswersInput>
  }

  export type QuestionCreateWithoutTestAnswersInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    caseStudy?: CaseStudyCreateNestedOneWithoutQuestionsInput
    options?: OptionCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUncheckedCreateWithoutTestAnswersInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    caseStudyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: OptionUncheckedCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueUncheckedCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionUncheckedCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type QuestionCreateOrConnectWithoutTestAnswersInput = {
    where: QuestionWhereUniqueInput
    create: XOR<QuestionCreateWithoutTestAnswersInput, QuestionUncheckedCreateWithoutTestAnswersInput>
  }

  export type TestSessionUpsertWithoutAnswersInput = {
    update: XOR<TestSessionUpdateWithoutAnswersInput, TestSessionUncheckedUpdateWithoutAnswersInput>
    create: XOR<TestSessionCreateWithoutAnswersInput, TestSessionUncheckedCreateWithoutAnswersInput>
    where?: TestSessionWhereInput
  }

  export type TestSessionUpdateToOneWithWhereWithoutAnswersInput = {
    where?: TestSessionWhereInput
    data: XOR<TestSessionUpdateWithoutAnswersInput, TestSessionUncheckedUpdateWithoutAnswersInput>
  }

  export type TestSessionUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    questionIdsJson?: StringFieldUpdateOperationsInput | string
    totalQuestions?: IntFieldUpdateOperationsInput | number
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    averageTimePerQuestion?: NullableFloatFieldUpdateOperationsInput | number | null
    topicFilter?: NullableStringFieldUpdateOperationsInput | string | null
    sectionFilter?: NullableStringFieldUpdateOperationsInput | string | null
    includeStatusesJson?: NullableStringFieldUpdateOperationsInput | string | null
    summaryJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TestSessionUncheckedUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    questionIdsJson?: StringFieldUpdateOperationsInput | string
    totalQuestions?: IntFieldUpdateOperationsInput | number
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    averageTimePerQuestion?: NullableFloatFieldUpdateOperationsInput | number | null
    topicFilter?: NullableStringFieldUpdateOperationsInput | string | null
    sectionFilter?: NullableStringFieldUpdateOperationsInput | string | null
    includeStatusesJson?: NullableStringFieldUpdateOperationsInput | string | null
    summaryJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QuestionUpsertWithoutTestAnswersInput = {
    update: XOR<QuestionUpdateWithoutTestAnswersInput, QuestionUncheckedUpdateWithoutTestAnswersInput>
    create: XOR<QuestionCreateWithoutTestAnswersInput, QuestionUncheckedCreateWithoutTestAnswersInput>
    where?: QuestionWhereInput
  }

  export type QuestionUpdateToOneWithWhereWithoutTestAnswersInput = {
    where?: QuestionWhereInput
    data: XOR<QuestionUpdateWithoutTestAnswersInput, QuestionUncheckedUpdateWithoutTestAnswersInput>
  }

  export type QuestionUpdateWithoutTestAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    caseStudy?: CaseStudyUpdateOneWithoutQuestionsNestedInput
    options?: OptionUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateWithoutTestAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    caseStudyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OptionUncheckedUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUncheckedUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUncheckedUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionCreateWithoutReviewQueueInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    caseStudy?: CaseStudyCreateNestedOneWithoutQuestionsInput
    options?: OptionCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerCreateNestedManyWithoutQuestionInput
    importEvents?: ImportBatchQuestionCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUncheckedCreateWithoutReviewQueueInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    caseStudyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: OptionUncheckedCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerUncheckedCreateNestedManyWithoutQuestionInput
    importEvents?: ImportBatchQuestionUncheckedCreateNestedManyWithoutQuestionInput
    progressSnapshots?: UserProgressUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type QuestionCreateOrConnectWithoutReviewQueueInput = {
    where: QuestionWhereUniqueInput
    create: XOR<QuestionCreateWithoutReviewQueueInput, QuestionUncheckedCreateWithoutReviewQueueInput>
  }

  export type QuestionUpsertWithoutReviewQueueInput = {
    update: XOR<QuestionUpdateWithoutReviewQueueInput, QuestionUncheckedUpdateWithoutReviewQueueInput>
    create: XOR<QuestionCreateWithoutReviewQueueInput, QuestionUncheckedCreateWithoutReviewQueueInput>
    where?: QuestionWhereInput
  }

  export type QuestionUpdateToOneWithWhereWithoutReviewQueueInput = {
    where?: QuestionWhereInput
    data: XOR<QuestionUpdateWithoutReviewQueueInput, QuestionUncheckedUpdateWithoutReviewQueueInput>
  }

  export type QuestionUpdateWithoutReviewQueueInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    caseStudy?: CaseStudyUpdateOneWithoutQuestionsNestedInput
    options?: OptionUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUpdateManyWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateWithoutReviewQueueInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    caseStudyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OptionUncheckedUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUncheckedUpdateManyWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUncheckedUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionCreateWithoutProgressSnapshotsInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    caseStudy?: CaseStudyCreateNestedOneWithoutQuestionsInput
    options?: OptionCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionCreateNestedManyWithoutQuestionInput
  }

  export type QuestionUncheckedCreateWithoutProgressSnapshotsInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    caseStudyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: OptionUncheckedCreateNestedManyWithoutQuestionInput
    testAnswers?: TestAnswerUncheckedCreateNestedManyWithoutQuestionInput
    reviewQueue?: ReviewQueueUncheckedCreateNestedOneWithoutQuestionInput
    importEvents?: ImportBatchQuestionUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type QuestionCreateOrConnectWithoutProgressSnapshotsInput = {
    where: QuestionWhereUniqueInput
    create: XOR<QuestionCreateWithoutProgressSnapshotsInput, QuestionUncheckedCreateWithoutProgressSnapshotsInput>
  }

  export type QuestionUpsertWithoutProgressSnapshotsInput = {
    update: XOR<QuestionUpdateWithoutProgressSnapshotsInput, QuestionUncheckedUpdateWithoutProgressSnapshotsInput>
    create: XOR<QuestionCreateWithoutProgressSnapshotsInput, QuestionUncheckedCreateWithoutProgressSnapshotsInput>
    where?: QuestionWhereInput
  }

  export type QuestionUpdateToOneWithWhereWithoutProgressSnapshotsInput = {
    where?: QuestionWhereInput
    data: XOR<QuestionUpdateWithoutProgressSnapshotsInput, QuestionUncheckedUpdateWithoutProgressSnapshotsInput>
  }

  export type QuestionUpdateWithoutProgressSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    caseStudy?: CaseStudyUpdateOneWithoutQuestionsNestedInput
    options?: OptionUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateWithoutProgressSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    caseStudyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OptionUncheckedUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUncheckedUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUncheckedUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type OptionCreateManyQuestionInput = {
    id?: string
    label: string
    text: string
    isCorrect: boolean
    explanation?: string | null
  }

  export type TestAnswerCreateManyQuestionInput = {
    id?: string
    testSessionId: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
  }

  export type ImportBatchQuestionCreateManyQuestionInput = {
    id?: string
    importBatchId: string
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
  }

  export type UserProgressCreateManyQuestionInput = {
    id?: string
    scopeType: string
    scopeKey: string
    topicNumber?: number | null
    section?: string | null
    attempts?: number
    correctCount?: number
    wrongCount?: number
    blankCount?: number
    lastAttemptAt?: Date | string | null
    masteryLevel?: number
    xp?: number
  }

  export type OptionUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OptionUncheckedUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OptionUncheckedUpdateManyWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TestAnswerUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    testSession?: TestSessionUpdateOneRequiredWithoutAnswersNestedInput
  }

  export type TestAnswerUncheckedUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    testSessionId?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestAnswerUncheckedUpdateManyWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    testSessionId?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ImportBatchQuestionUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importBatch?: ImportBatchUpdateOneRequiredWithoutItemsNestedInput
  }

  export type ImportBatchQuestionUncheckedUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    importBatchId?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ImportBatchQuestionUncheckedUpdateManyWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    importBatchId?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserProgressUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    scopeType?: StringFieldUpdateOperationsInput | string
    scopeKey?: StringFieldUpdateOperationsInput | string
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    lastAttemptAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    xp?: IntFieldUpdateOperationsInput | number
  }

  export type UserProgressUncheckedUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    scopeType?: StringFieldUpdateOperationsInput | string
    scopeKey?: StringFieldUpdateOperationsInput | string
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    lastAttemptAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    xp?: IntFieldUpdateOperationsInput | number
  }

  export type UserProgressUncheckedUpdateManyWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    scopeType?: StringFieldUpdateOperationsInput | string
    scopeKey?: StringFieldUpdateOperationsInput | string
    topicNumber?: NullableIntFieldUpdateOperationsInput | number | null
    section?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    correctCount?: IntFieldUpdateOperationsInput | number
    wrongCount?: IntFieldUpdateOperationsInput | number
    blankCount?: IntFieldUpdateOperationsInput | number
    lastAttemptAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    masteryLevel?: FloatFieldUpdateOperationsInput | number
    xp?: IntFieldUpdateOperationsInput | number
  }

  export type QuestionCreateManyCaseStudyInput = {
    id?: string
    externalId: string
    examPart: string
    examExercise: string
    topicNumber: number
    topicTitle: string
    section: string
    subsection?: string | null
    questionType: string
    difficulty: string
    text: string
    explanation?: string | null
    sourceDocument?: string | null
    sourceReference?: string | null
    tagsJson?: string
    status?: string
    isDemo?: boolean
    isFavorite?: boolean
    isDoubtful?: boolean
    isArchived?: boolean
    reserveOrder?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionUpdateWithoutCaseStudyInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OptionUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateWithoutCaseStudyInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OptionUncheckedUpdateManyWithoutQuestionNestedInput
    testAnswers?: TestAnswerUncheckedUpdateManyWithoutQuestionNestedInput
    reviewQueue?: ReviewQueueUncheckedUpdateOneWithoutQuestionNestedInput
    importEvents?: ImportBatchQuestionUncheckedUpdateManyWithoutQuestionNestedInput
    progressSnapshots?: UserProgressUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type QuestionUncheckedUpdateManyWithoutCaseStudyInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    examPart?: StringFieldUpdateOperationsInput | string
    examExercise?: StringFieldUpdateOperationsInput | string
    topicNumber?: IntFieldUpdateOperationsInput | number
    topicTitle?: StringFieldUpdateOperationsInput | string
    section?: StringFieldUpdateOperationsInput | string
    subsection?: NullableStringFieldUpdateOperationsInput | string | null
    questionType?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    explanation?: NullableStringFieldUpdateOperationsInput | string | null
    sourceDocument?: NullableStringFieldUpdateOperationsInput | string | null
    sourceReference?: NullableStringFieldUpdateOperationsInput | string | null
    tagsJson?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isDemo?: BoolFieldUpdateOperationsInput | boolean
    isFavorite?: BoolFieldUpdateOperationsInput | boolean
    isDoubtful?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    reserveOrder?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ImportBatchQuestionCreateManyImportBatchInput = {
    id?: string
    questionId?: string | null
    externalId: string
    action: string
    warningsJson?: string | null
    errorsJson?: string | null
    previousDataJson?: string | null
    importedDataJson?: string | null
  }

  export type ImportBatchQuestionUpdateWithoutImportBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    question?: QuestionUpdateOneWithoutImportEventsNestedInput
  }

  export type ImportBatchQuestionUncheckedUpdateWithoutImportBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ImportBatchQuestionUncheckedUpdateManyWithoutImportBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: NullableStringFieldUpdateOperationsInput | string | null
    externalId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    warningsJson?: NullableStringFieldUpdateOperationsInput | string | null
    errorsJson?: NullableStringFieldUpdateOperationsInput | string | null
    previousDataJson?: NullableStringFieldUpdateOperationsInput | string | null
    importedDataJson?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TestAnswerCreateManyTestSessionInput = {
    id?: string
    questionId: string
    selectedOptionId?: string | null
    isCorrect: boolean
    isBlank: boolean
    confidence?: string | null
    timeSpentSeconds?: number | null
    answeredAt?: Date | string
  }

  export type TestAnswerUpdateWithoutTestSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    question?: QuestionUpdateOneRequiredWithoutTestAnswersNestedInput
  }

  export type TestAnswerUncheckedUpdateWithoutTestSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestAnswerUncheckedUpdateManyWithoutTestSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    selectedOptionId?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    isBlank?: BoolFieldUpdateOperationsInput | boolean
    confidence?: NullableStringFieldUpdateOperationsInput | string | null
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    answeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use QuestionCountOutputTypeDefaultArgs instead
     */
    export type QuestionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = QuestionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CaseStudyCountOutputTypeDefaultArgs instead
     */
    export type CaseStudyCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CaseStudyCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ImportBatchCountOutputTypeDefaultArgs instead
     */
    export type ImportBatchCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ImportBatchCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TestSessionCountOutputTypeDefaultArgs instead
     */
    export type TestSessionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TestSessionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use QuestionDefaultArgs instead
     */
    export type QuestionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = QuestionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OptionDefaultArgs instead
     */
    export type OptionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OptionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CaseStudyDefaultArgs instead
     */
    export type CaseStudyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CaseStudyDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ImportBatchDefaultArgs instead
     */
    export type ImportBatchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ImportBatchDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ImportBatchQuestionDefaultArgs instead
     */
    export type ImportBatchQuestionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ImportBatchQuestionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TestSessionDefaultArgs instead
     */
    export type TestSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TestSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TestAnswerDefaultArgs instead
     */
    export type TestAnswerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TestAnswerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ReviewQueueDefaultArgs instead
     */
    export type ReviewQueueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ReviewQueueDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AchievementDefaultArgs instead
     */
    export type AchievementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AchievementDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserProgressDefaultArgs instead
     */
    export type UserProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserProgressDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AppSettingsDefaultArgs instead
     */
    export type AppSettingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AppSettingsDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}