import path from "path";

export * from "./types";

import { DatabasesOptions } from "./databases";

import { FSDatabases } from "./fs";
import { MemoryDatabases } from "./memory";
import { SqliteDatabases } from "./sqlite";

import { Collections } from "@truffle/db/meta";
import { Databases, Definitions } from "./types";

export interface WorkspaceConfig {
  workingDirectory?: string;
  adapter?: {
    name: string;
    settings?: any; // to allow adapters to define any options type
  };
}

export const forDefinitions = <C extends Collections>(
  definitions: Definitions<C>
) => (config: WorkspaceConfig): Databases<C> => {
  const { WorkspaceDatabases, settings } = concretize<C>(config);

  return new WorkspaceDatabases({ definitions, settings });
};

const concretize = <C extends Collections>(
  config: WorkspaceConfig
): {
  WorkspaceDatabases: new (options: DatabasesOptions<C>) => Databases<C>;
  settings: any;
} => {
  const {
    workingDirectory,
    adapter: { name, settings } = { name: "fs" }
  } = config;

  switch (name) {
    case "fs": {
      return {
        WorkspaceDatabases: FSDatabases,
        settings: settings || getDefaultFSAdapterSettings(workingDirectory)
      };
    }
    case "sqlite": {
      return {
        WorkspaceDatabases: SqliteDatabases,
        settings: settings || getDefaultSqliteAdapterSettings(workingDirectory)
      };
    }
    case "memory": {
      return {
        WorkspaceDatabases: MemoryDatabases,
        settings: settings
      };
    }
    default: {
      throw new Error(`Unknown Truffle DB adapter: ${name}`);
    }
  }
};

const getDefaultFSAdapterSettings = workingDirectory => ({
  directory: path.join(workingDirectory, ".db", "json")
});

const getDefaultSqliteAdapterSettings = workingDirectory => ({
  directory: path.join(workingDirectory, ".db", "sqlite")
});