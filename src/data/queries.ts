const CATALOG = `[
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
                  ]`;

export const GET_CATALOG = `
                query {
                  getVariables(variableEntryIds: ${CATALOG}) {
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

export const GET_VARIABLE_END_DATE = `
                query {
                  getVariables(variableEntryIds: ${CATALOG}) {
                    variables {
                        dataFieldId      
                        dataProductEndDateTime
                    }
                    }
                }
                `;
