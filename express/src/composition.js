import { createApp } from "./app.js";
import { createPostgresPool } from "./infra/postgres.js";
import {createPostgresCampaignRepository} from "./infra/campaignRepository.js";
import {makeCreateCampaign} from "./domain/campaigns/createCampaign.js";

// Aquí elegimos los adaptadores y conectamos las dependencias.
export const pool = createPostgresPool();

const campaignRepository = createPostgresCampaignRepository(pool);
// Agrupamos los casos de uso por funcionalidad.
export const useCases = {
  campaigns: {
    create: makeCreateCampaign({ campaignRepository }),
  },
};

// Conservamos los comandos anteriores que importaban createCampaign.
export const createCampaign = useCases.campaigns.create;

// La aplicación recibe los módulos que ya están implementados.
export const app = createApp(useCases);