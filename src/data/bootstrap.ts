import React, { useEffect } from "react";

import {
  getAllData,
  storeDataByKey,
  IndexedDbStores,
} from "../components/Catalog/localforage";
import { fetchCatalog } from "../services/api/time-series";
import {
  Variable,
  VariableWithLabel,
} from "../components/Catalog/browse-variables.types";

import catalog from "../components/Catalog/catalog.json";

const FULL_SYNC_TTL = 6 * 60 * 60 * 1000; // 6 hours
const DATES_SYNC_TTL = 30 * 60 * 1000; // 30 minutes

const GET_VARIABLES = `
                query {
                  getVariables(variableEntryIds: [
                    "GPM_3IMERGHH_07_precipitation",
                    "M2T1NXSLV_5_12_4_SLP",
                    "M2IMNXASM_5_12_4_T2M",
                    "M2T1NXFLX_5_12_4_SPEEDMAX",
                    "M2T1NXFLX_5_12_4_SPEED",
                    "GPM_3IMERGM_07_precipitation",
                    "MYD08_M3_6_1_Aerosol_Optical_Depth_Land_Ocean_Mean_Mean",
                    "MOD08_D3_6_1_AOD_550_Dark_Target_Deep_Blue_Combined_Mean",
                    "OCO2_GEOS_L3CO2_MONTH_10r_XCO2",
                    "M2TMNXCHM_5_12_4_COSC",
                    "OMDOAO3e_003_ColumnAmountO3",
                    "M2T1NXSLV_5_12_4_TO3",
                    "OMHCHOd_003_key_science_data_column_amount",
                    "OMNO2d_003_ColumnAmountNO2TropCloudScreened",
                    "OMNO2d_003_ColumnAmountNO2CloudScreened",
                    "M2T1NXAER_5_12_4_TOTCMASS25",
                    "GRACEDADM_CLSM0125US_7D_4_0_gws_inst",
                    "GLDAS_CLSM025_DA1_D_2_2_GWS_tavg",
                    "GLDAS_NOAH025_M_2_1_Evap_tavg",
                    "GLDAS_NOAH025_M_2_1_RootMoist_inst",
                    "GLDAS_CLSM025_DA1_D_2_2_Qs_tavg",
                    "GLDAS_CLSM025_DA1_D_2_2_SWE_tavg",
                    "GLDAS_NOAH025_M_2_1_Albedo_inst"
                  ]) {
                    variables {
                        dataFieldId
                        dataProductShortName
                        dataProductVersion
                        dataFieldShortName
                        dataFieldAccessName
                        dataFieldLongName
                        dataProductLongName
                        dataProductTimeInterval
                        dataProductWest
                        dataProductSouth
                        dataProductEast
                        dataProductNorth
                        dataProductSpatialResolution
                        dataProductBeginDateTime
                        dataProductEndDateTime
                        dataFieldKeywords
                        dataFieldUnits
                        dataProductDescriptionUrl
                        dataFieldDescriptionUrl
                        dataProductInstrumentShortName
                    }
                    }
                }
                `;

const GET_DATES = `
                query {
                     getVariables(variableEntryIds: [
                    "GPM_3IMERGHH_07_precipitation",
                    "M2T1NXSLV_5_12_4_SLP",
                    "M2IMNXASM_5_12_4_T2M",
                    "M2T1NXFLX_5_12_4_SPEEDMAX",
                    "M2T1NXFLX_5_12_4_SPEED",
                    "GPM_3IMERGM_07_precipitation",
                    "MYD08_M3_6_1_Aerosol_Optical_Depth_Land_Ocean_Mean_Mean",
                    "MOD08_D3_6_1_AOD_550_Dark_Target_Deep_Blue_Combined_Mean",
                    "OCO2_GEOS_L3CO2_MONTH_10r_XCO2",
                    "M2TMNXCHM_5_12_4_COSC",
                    "OMDOAO3e_003_ColumnAmountO3",
                    "M2T1NXSLV_5_12_4_TO3",
                    "OMHCHOd_003_key_science_data_column_amount",
                    "OMNO2d_003_ColumnAmountNO2TropCloudScreened",
                    "OMNO2d_003_ColumnAmountNO2CloudScreened",
                    "M2T1NXAER_5_12_4_TOTCMASS25",
                    "GRACEDADM_CLSM0125US_7D_4_0_gws_inst",
                    "GLDAS_CLSM025_DA1_D_2_2_GWS_tavg",
                    "GLDAS_NOAH025_M_2_1_Evap_tavg",
                    "GLDAS_NOAH025_M_2_1_RootMoist_inst",
                    "GLDAS_CLSM025_DA1_D_2_2_Qs_tavg",
                    "GLDAS_CLSM025_DA1_D_2_2_SWE_tavg",
                    "GLDAS_NOAH025_M_2_1_Albedo_inst"
                  ]) {
                    variables {
                        dataFieldId
                        dataProductEndDateTime
                    }
                    }
                }
                `;

export default function AppBootstrap() {
  useEffect(() => {
    // TODO: check interet connection before fetching
    const getCatalog = async () => {
      try {
        const cachedItems = await getAllData(IndexedDbStores.CATALOG);

        // we assume that if the number of cached items matches the catalog length, the catalog is fully cached
        if (cachedItems.length === catalog.length) {
          console.log("Catalog already cached in IndexedDB.");

          //   const productEndDates = await fetchCatalog(GET_DATES);

          // if it matches, will only update the end datetime info in the background
          //   console.log("Updating product end dates...");

          return;
        }
        const data = await fetchCatalog(GET_VARIABLES);

        const list: Variable[] = data?.data?.getVariables?.variables;

        const modifiedList = list.map((item) => {
          const catalogItem = catalog.find(
            (catItem) => catItem.dataFieldId === item.dataFieldId
          );
          return {
            ...item,
            label: catalogItem?.label || "N/A",
            group: catalogItem?.group || "unknown",
            subgroup: catalogItem?.subgroup || "unknown",
          };
        });

        if (data.length === 0) return;

        await Promise.all(
          modifiedList.map(async (item: VariableWithLabel) =>
            storeDataByKey(IndexedDbStores.CATALOG, item.dataFieldId, item)
          )
        );

        // setFilteredVariables(modifiedList);
        // console.log(catalog.map((item) => item.dataFieldId));
      } catch (error) {
        console.error("Error fetching catalog:", error);
      } finally {
        // setIsLoadingCatalog(false);
      }
    };
    getCatalog();
  }, []);

  return null;
}
