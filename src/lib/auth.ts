import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
};

const client =
  globalForMongo.mongoClient ??
  new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

const db = client.db("note_sharing_app");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  baseURL: process.env.BETTER_AUTH_URL|| "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
  },
});