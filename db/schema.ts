import { pgTable, text, integer, timestamp, uuid, jsonb, boolean, primaryKey, pgEnum, unique, index } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters"

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)
 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)
 
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

// Credits: one-to-one per user
export const credits = pgTable('credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  totalCredits: integer("total_credits").notNull().default(0),
  usedCredits: integer("used_credits").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const subscription = pgTable('subscription', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  product: text('product').notNull(),
  providerCustomerId: text('provider_customer_id').notNull(),
  providerSubscriptionId: text('provider_subscription_id'),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', { mode: 'date' }),
  currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  price: integer('price'),
  currency: text('currency').default('USD'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  { userIdIndex: index('subscription_user_id_idx').on(table.userId) },
]);

export const oneTimePurchase = pgTable('onetimepurchase', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  product: text('product').notNull(),
  providerCustomerId: text('provider_customer_id').notNull(),
  providerPaymentId: text('provider_payment_id'),
  price: integer('price').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('completed'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  { userIdIndex: index('onetimepurchase_user_id_idx').on(table.userId) },
]);

// OpenClaw deployment table
export const openclawStatusEnum = pgEnum('openclaw_status', ['pending', 'deploying', 'running', 'stopped', 'error', 'deleted']);

export const openclaw = pgTable('openclaw', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  name: text('name'),
  gatewayToken: text('gateway_token'),
  clientId: text('client_id').notNull(),
  flyAppName: text('fly_app_name').notNull(),
  flyAppUrl: text('fly_app_url'),
  dockerImage: text('docker_image'),
  region: text('region').notNull().default('sin'),
  volumeName: text('volume_name'),
  status: openclawStatusEnum('status').notNull().default('pending'),
  machineStatus: text('machine_status'),
  lastEvent: text('last_event'),
  lastEventTimestamp: text('last_event_timestamp'),
  errorMessage: text('error_message'),
  model: text('model'),
  channel: text('channel'),
  openclawConfig: jsonb('openclaw_config').$type<Record<string, any>>(),
  channelCredentials: jsonb('channel_credentials').$type<Record<string, any>>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  { clientIdIndex: index('openclaw_client_id_idx').on(table.clientId) },
  { userIdIndex: index('openclaw_user_id_idx').on(table.userId) },
  { statusIndex: index('openclaw_status_idx').on(table.status) },
]);

// API Keys: per user
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  createdBy: text('created_by').references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  encryptedKey: text('encrypted_key').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  status: text('status').notNull().default('active'),
  scopes: jsonb('scopes').$type<string[]>(),
  rateLimit: integer('rate_limit'),
  canReveal: boolean('can_reveal').notNull().default(false),
  revealCount: integer('reveal_count').notNull().default(0),
  lastRevealedAt: timestamp('last_revealed_at', { mode: 'date' }),
  lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
  usageCount: integer('usage_count').notNull().default(0),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  { userIdIndex: index('api_keys_user_id_idx').on(table.userId) },
  { statusIndex: index('api_keys_status_idx').on(table.status) },
  { keyHashIndex: index('api_keys_key_hash_idx').on(table.keyHash) },
]);

export const openclawCredits = pgTable('openclaw_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  openrouterApiKey: text('openrouter_api_key'),
  openrouterApiKeyHash: text('openrouter_api_key_hash'),
  lastSyncAt: timestamp('last_sync_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  { userIdIndex: index('openclaw_credits_user_id_idx').on(table.userId) },
  { userIdUnique: unique('openclaw_credits_user_id_unique').on(table.userId) },
]);
