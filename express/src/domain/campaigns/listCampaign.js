export function makeListCampaigns({ campaignRepository }) {

  return async function listCampaigns({ page = 1, limit = 20 } = {}) {

    // Evitamos paginaciones inválidas.
    if (
      !Number.isSafeInteger(page) || page < 1 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 100
    ) {
      throw new RangeError("Paginación inválida.");
    }

    const offset = (page - 1) * limit;

    // Delegamos la consulta al repositorio.
    // item es un array de campañas y total es la cantidad total de campañas.
    const { items, total } = await campaignRepository.list({
      limit,
      offset
    });

    return {
      data: items,
      // esto nos sirve por ejemplo para calcular la cantidad de páginas en el frontend.
      pagination: { page, limit, total }
    };
  };
}