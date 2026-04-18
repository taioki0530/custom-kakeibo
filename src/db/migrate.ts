import { db } from "./client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "./migrations/migrations";
import { seedIfEmpty } from "./seed";

export { useMigrations, migrations, seedIfEmpty };
