export interface OwnerDetail {
  id: string;
  salutation: string;
  ownerName: string;
  gender: string;
  guardianName: string;
  relation: string;
  contact: string;
  panNo?: string;
}

export interface BasicDetails {
  ulbId: number;
  propertyTypeId: number;
  roadTypeId: number;
  usageTypeId: number;
  propertyType: number;
  uniquePropertyId: string;
  safNo: string;
  primaryContactNo: string;
  rainWaterHarvest: string;
  plotArea: number;
  builtupGroundArea: number;
  constructionDate: string;
  waterConnType: string;
  waterTaxType: string;
  holdingType: 'OLD' | 'NEW';
  newHoldingNumber: string;
  wardAreaNo: number;
  ownerShipType_id: any;
  ownerShipType: string;
  owners: OwnerDetail[];
  oldHoldingNumber: string;
  oldUniquePropertyId: string;
  primaryHouseNo: string;
  primaryMohalla: string;
  primaryAddress: string;
  primaryPinCode: string;
  corresHouseNo: string;
  corresMohalla: string;
  corresAddress: string;
  corresPincode: string;
  phoneNo: string;
  emailAddress: string;
  khataNo: string;
  plotNo: string;
  maujaName: string;
  thanaNo: string;
  wardArea: string; // Added missing field
  uniqueZone: any;
  assessmentYear: string; // Added missing field
  correspondenceAddress: { // Added missing field
    sameAsAbove: boolean;
    corresHouseNo: string;
    corresMohalla: string;
    corresAddress: string;
    corresPincode: string;
  };
  zoneId?: any;
  zone?: string; 
  wardId: string;
  ownerImages?: Record<string, File | null>;
}
  
  export interface FloorDetail {
    id: string;
    floor: string;
    usage: string;
    mainUsage?: string;
    factor: number;
    occupancy: string;
    construction: string;
    builtArea: number;
    assessFrom: string;
    assessUpto?: string;
  }
  

  
  export interface PropertyDetails {
    harvesting: string;
    lateSubmission: 'Yes' | 'No';
    propertyType: string;
    roadType: string;
    plotArea: number;
    buildUpArea: number;
    acquisitionDate: string;
    khataNo?: string;
    plotNo?: string;
    maujaName?: string;
    thanaNo?: string;
    constAge?: string ;
    wardArea?: string;
    floorDetails: FloorDetail[];
  }
  
  export interface WaterConnection {
    connectionType: string;
    fixedWaterTax: string;
    documents?: Record<string, File[]>;
  }
  
  
  export interface AssessmentFormData {
    basicDetails: BasicDetails;
    propertyDetails: PropertyDetails;
    waterConnection: WaterConnection;
  }
  
  export interface DropdownOption {
    value: string;
    label: string;
  }

  export interface UsageTypeResponse {
    id: number;
    subUsageType_name: string;
  }
  

export interface MasterDataResponse {
  wardArea: Array<{
    id: number;
    wardArea_name: string;
    recStatus: number;
    ulb_id: number | null;
  }>;
  uniqueZone: Array<{
    id: number;
    uniqueZone_name: string;
    ulb_id: number | null;
  }>;
  ownerShip: Array<{
    id: number;
    ownerShip_name: string;
    ulb_id: number | null;
  }>;
  propertyType: Array<{
    id: number;
    ulb_id: number | null;
    propertyType_name: string;
    recStatus: number;
  }>;
  roadType: Array<{
    id: number;
    ulb_id: number | null;
    roadType_name: string;
    recStatus: number;
  }>;
  floorType: Array<{
    id: number;
    floor_name: string;
    ulb_id: number | null;
    recstatus: number;
  }>;
  occupancyType: Array<{
    id: number;
    ulb_id: number | null;
    occupancyType_name: string;
    multiplying_factor: number;
    recStatus: number;
  }>;
  usageType?: Array<{
    id: number;
    usageType_name: string;
  }>;
  constructionType: Array<{
    id: number;
    ulb_id: number | null;
    constructionType_name: string;
    shortName: string;
    recStatus: number;
  }>;
  waterConnection: Array<{
    id: number;
    waterConType: string;
  }>;
  waterTax: Array<{
    id: number;
    waterTax: string;
  }>;

  
  constAge?: Array<{ id: number; const_Age: string; recstatus: number }>;
}

export interface APIAssessmentResponse {
  message: string;
  data: {
    data: {
      basicDetails: {
        id: number;
        ulb_id: number;
        wardArea_id: number;
        property_type_id: number;
        road_type_id: number;
        usage_type_id: number;
        ownershipType_id: number;
        saf_type: string;
        saf_fyYear_id: number;
        saf_fy_Year: string;
        unique_Property_Id: string;
        saf_no: string;
        new_holding_no: string;
        primary_contact_no: string;
        rain_water_harvest: string;
        plot_area: number;
        builtup_ground_floor: number;
        construction_date: string;
        water_conn_type: string;
        water_tax_type: string;
        holding_type: string;
        created_at: string;
        update_at: string;
      };
      propertyDetails: {
        id: number;
        propertyMaster_id: number;
        prim_houseNo: string;
        prim_mohalla: string;
        prim_address: string;
        prim_pincode: string;
        corres_houseNo: string;
        corres_mohalla: string;
        corres_address: string;
        corres_pincode: string;
        phone_no: string;
        email_id: string;
        khata_no: string;
        plot_no: string;
        mauja_name: string;
        old_holding_no: string;
        old_unique_property_id: string;
        thana_no: string;
        created_at: string;
        updated_at: string;
      };
      owners: Array<{
        honorific: string;
        ownerName: string;
        gender: string;
        guardianName: string;
        relation: string;
        contactNo: string;
        panNo: string;
      }>;
      floors: Array<{
        floorType: number;
        floorName: string;
        usageType: number;
        usageName: string;
        usageFactor: number;
        usageFactName: string;
        occupancyType: number;
        occupancyName: string;
        constType: number;
        constName: string;
        builtUpArea: number;
        assessFrom: string;
        assessFromYear: string;
        assessUpto: string;
        assessUptoYear: string;
      }>;
      demandData: any[];
    };
  };
}


export interface AssessmentPayload {
  ulbId: number;
  propertyTypeId: number;
  roadTypeId: number;
  usageTypeId: number;
  propertyType: number;
  uniquePropertyId: string;
  safNo: string;
  primaryContactNo: string;
  rainWaterHarvest: string;
  plotArea: number;
  builtupGroundArea: number;
  constructionDate: string;
  waterConnType: string;
  waterTaxType: string;
  holdingType: string;
  newHoldingNumber: string;
  wardAreaNo: number;
  ownerShipType_id: number;
  ownerShipType: number;
  owners: Array<{
    salutation: string;
    ownerName: string;
    gender: string;
    guardianName: string;
    relation: string;
    contact: string;
    panNo?: string;
  }>;
  oldHoldingNumber?: string;
  oldUniquePropertyId?: string;
  primaryHouseNo: string;
  primaryMohalla: string;
  primaryAddress: string;
  primaryPinCode: string;
  corresHouseNo?: string;
  corresMohalla?: string;
  corresAddress?: string;
  corresPincode?: string;
  phoneNo?: string;
  emailAddress?: string;
  khataNo?: string;
  plotNo?: string;
  maujaName?: string;
  thanaNo?: string;
  zoneId?: number;
  floors: Array<{
    floorTypeId: number;
    usageTypeId: number;
    factor: number;
    occupancyTypeId: number;
    constructionId: number;
    builtupArea: number;
    assessFrom: string;
    assessUpto?: string;
  }>;
  road_type_id: number;
  const_typeId: number;
  const_age: number;
  build_area: number;
  wardArea: number;
}


export interface FloorTax {
  floorId: string;
  perYear: Array<{
    fy_id: number;
    fy_year: string;
    house_tax: number;
    water_tax: number;
    waste_tax: number;
    total_tax: number;
    ward_rate: number;
    arv_rate: number;
    carpetArv_rate: number;
    constAge_tax: number;
  }>;
  floorTotal: {
    house_tax: number;
    water_tax: number;
    waste_tax: number;
    total_tax: number;
  };
}

export interface CalculationResult {
  floors: FloorTax[];
  buildingTotals: {
    house_tax: number;
    water_tax: number;
    waste_tax: number;
    total_tax: number;
  };
}