import { GET_CATALOG, GET_VARIABLE_END_DATE } from "../../data/queries";

/**
 * fetching graphql data
 *
 * @param query - graphql query string
 *
 */
export const getTerraGraphQLData = async (query: string) => {
  const url =
    "https://u2u5qu332rhmxpiazjcqz6gkdm.appsync-api.us-east-1.amazonaws.com/graphql";

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "da2-hg7462xbijdjvocfgx2xlxuytq",
    },
    body: JSON.stringify({ query }),
  };

  const response = await fetch(url, requestOptions);

  if (response.status !== 200) return;

  return await response.json();
};

export async function getCatalog() {
  const data = await getTerraGraphQLData(GET_CATALOG);
  return data?.data?.getVariables?.variables;
}

export async function updateCatalog() {
  const data = await getTerraGraphQLData(GET_VARIABLE_END_DATE);
  return data?.data?.getVariables?.variables;
}
