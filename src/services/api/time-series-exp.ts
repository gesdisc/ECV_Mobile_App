
import { parseTimeSeriesCsv } from '../../utils/time-series';

import type {
    MaybeBearerToken,
    DataParams,
} from './time-series.types'



export const fetchData = async (dataParams: DataParams) => {
    const bearerToken: MaybeBearerToken = null;
    const {variable, lat, lon, begin_time, end_time} = dataParams;
  
    // URL https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00
    const url = `https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=${variable}&lat=${lat}&lon=${lon}&time_start=${begin_time}&time_end=${end_time}`;

    try {
        const response = await fetch(url, {
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                ...(bearerToken
                    ? { Authorization: `Bearer: ${bearerToken}` }
                    : {}),
            },
        })

        if (!response.ok) {
            throw new Error(
                `Failed to fetch time series data: ${response.statusText}`
            )
        }

        const csvData = await response.text();
        const parsedData = parseTimeSeriesCsv(csvData);
        
        return parsedData;
    } catch (error) {
        console.log(error)
    }
}

/**
 * fetching data from graphql
 */
// pass variable id
// {"query":"{\n  getVariables(variableEntryIds: [\"OMAERUVd_003_FinalAerosolAbsOpticalDepth388\"]) { variables { dataFieldId, dataFieldLongName } } }"}
// export const fetchCatalog = async () => {
//     const url =
//       "https://u2u5qu332rhmxpiazjcqz6gkdm.appsync-api.us-east-1.amazonaws.com/graphql";
//     const query = `
//                 query {
//                     getVariables {
//                     variables {
//                         dataFieldId
//                         dataFieldLongName
//                     }
//                     }
//                 }
//                 `;
//     const requestOptions = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": "",
//       },
//       // body: "query":"{\n  getVariables { variables { dataFieldId, dataFieldLongName } } }",
//       body: JSON.stringify({ query }),
//     };

//     try {
//       console.log("loading catalog data...");

//       const response = await fetch(
//         url,
//         requestOptions
//       );
//       // const response = await axios.post(url, requestOptions);
//       // const data = await response.json();
//       console.log(response);
//     } catch (error) {
//       console.log("Catalog error: ", error);
//     } finally {
//       // console.log("catalog data loaded...");
//     }
//   };