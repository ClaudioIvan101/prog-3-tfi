import { createApp } from "./app.js";
import { createPostgresPool } from "./infra/postgres.js";
import {createPostgresCampaignRepository} from "./infra/campaignRepository.js";
import {makeCreateCampaign} from "./domain/campaigns/createCampaign.js";
import { createPostgresUserRepository } from "./infra/userRepository.js";
import { hashPassword } from "./infra/passwordHasher.js";
import { makeCreateUser } from "./domain/users/createUser.js";
import { makeListUsers } from "./domain/users/listUsers.js";
import { makeGetUserById } from "./domain/users/getUserById.js";

// Aquí elegimos los adaptadores y conectamos las dependencias.
export const pool = createPostgresPool();

const campaignRepository = createPostgresCampaignRepository(pool);
const userRepository = createPostgresUserRepository(pool);
// Agrupamos los casos de uso por funcionalidad.
export const useCases = {
  users: {
    createUser: makeCreateUser({ userRepository, hashPassword }),
    listUsers: makeListUsers({ userRepository }),
    getUserById: makeGetUserById({ userRepository }),
    // Denegar hasta integrar autenticación y autorización reales.
    authorize: async () => false,
  },
  campaigns: {
    create: makeCreateCampaign({ campaignRepository }),
  },
};

// Conservamos los comandos anteriores que importaban createCampaign.
export const createCampaign = useCases.campaigns.create;

// La aplicación recibe los módulos que ya están implementados.
export const app = createApp(useCases);
