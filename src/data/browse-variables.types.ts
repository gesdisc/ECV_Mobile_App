//? there are quite a few more properties available, look at the response directly
export type Variable = {
  dataFieldId: string;
  dataProductShortName: string;
  dataProductVersion: string;
  dataFieldShortName: string;
  dataFieldAccessName: string;
  dataFieldLongName: string;
  dataProductLongName: string;
  dataProductTimeInterval: string;
  dataProductWest: number;
  dataProductSouth: number;
  dataProductEast: number;
  dataProductNorth: number;
  dataProductSpatialResolution: string;
  dataProductBeginDateTime: string;
  dataProductEndDateTime: string;
  dataFieldKeywords: string[];
  dataFieldUnits: string;
  // dataset landing page
  dataProductDescriptionUrl: string;
  // variable landing page
  dataFieldDescriptionUrl: string;
  dataProductInstrumentShortName: string;
} & Partial<ExampleInitialDates>;

export type ExampleInitialDates = {
  exampleInitialStartDate: Date;
  exampleInitialEndDate: Date;
};

export type VariableWithLabel = Variable & {
  label: string;
  group: string;
  subgroup: string;
  gibsProductId: string;
};
