export class InvalidCampaignError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidCampaignError";
  }
}

const validStatuses = new Set([
  "draft",
  "active",
  "paused",
  "completed",
]);

function normalizeDate(value, label) {
  // Una fecha ausente o null significa "sin fecha configurada".
  if (value === undefined || value === null) {
    return null;
  }

  // Usamos fechas UTC terminadas en Z.
  // Los milisegundos son opcionales.
  const match =
    typeof value === "string"
      ? /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value)
      : null;

  if (!match || match[1].startsWith("0000-")) {
    throw new InvalidCampaignError(
      `${label} debe ser una fecha UTC válida, por ejemplo 2026-11-10T12:00:00Z.`,
    );
  }

  const normalized =
    `${match[1]}.${(match[2] ?? "").padEnd(3, "0")}Z`;

  const date = new Date(normalized);

  // Date puede normalizar fechas inexistentes.
  // Esta comparación rechaza casos como el 30 de febrero.
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString() !== normalized
  ) {
    throw new InvalidCampaignError(
      `${label} contiene una fecha inexistente.`,
    );
  }

  return normalized;
}

// Recibimos el repositorio por inyección.
// Este módulo no conoce Express, SQL ni PostgreSQL.
export function makeCreateCampaign({ campaignRepository }) {
  return async function createCampaign(campaignData) {
    if (
      campaignData === null ||
      typeof campaignData !== "object" ||
      Array.isArray(campaignData)
    ) {
      throw new InvalidCampaignError(
        "Los datos de la campaña deben ser un objeto.",
      );
    }

    const {
      name,
      objective,
      status = "draft",
      startDate,
      endDate,
    } = campaignData;

    if (
      typeof name !== "string" ||
      typeof objective !== "string" ||
      name.trim().length === 0 ||
      objective.trim().length === 0
    ) {
      throw new InvalidCampaignError(
        "El nombre y el objetivo deben ser textos no vacíos.",
      );
    }

    if (!validStatuses.has(status)) {
      throw new InvalidCampaignError(
        "El estado debe ser draft, active, paused o completed.",
      );
    }

    const normalizedStart = normalizeDate(
      startDate,
      "La fecha de inicio",
    );

    const normalizedEnd = normalizeDate(
      endDate,
      "La fecha de finalización",
    );

    if (
      normalizedStart !== null &&
      normalizedEnd !== null &&
      Date.parse(normalizedEnd) <= Date.parse(normalizedStart)
    ) {
      throw new InvalidCampaignError(
        "La fecha de finalización debe ser posterior al inicio.",
      );
    }

    // Guardamos todos los campos validados y normalizados.
    return campaignRepository.create({
      name: name.trim(),
      objective: objective.trim(),
      status,
      startDate: normalizedStart,
      endDate: normalizedEnd,
    });
  };
}