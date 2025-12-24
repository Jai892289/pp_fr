import { z } from 'zod';

const ownerDetailSchema = z.object({
  id: z.string(),
  salutation: z.string().min(1, 'Salutation is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  gender: z.enum(['male', 'female', 'other']).or(z.string().min(1, 'Gender is required')),
  guardianName: z.string().min(1, 'Guardian name is required'),
  relation: z.string().min(1, 'Relation is required'),
  contact: z.string().min(10, 'Valid contact number is required'),
  panNo: z.string().optional(),
});

const correspondenceAddressSchema = z.object({
  sameAsAbove: z.boolean(),
  corresHouseNo: z.string().optional(),
  corresMohalla: z.string().optional(),
  corresAddress: z.string().optional(),
  corresPincode: z.string().optional(),
}).refine((data) => {
  // If sameAsAbove is false, then correspondence fields are required
  if (!data.sameAsAbove) {
    return data.corresHouseNo && data.corresMohalla && data.corresAddress && data.corresPincode;
  }
  return true;
}, {
  message: "Correspondence address fields are required when not same as above",
  path: ["corresHouseNo"] // This will show the error on the first field
});

export const basicDetailsSchema = z.object({
  // Core required fields with validation
  primaryContactNo: z.string().min(10, 'Primary contact number must be at least 10 digits'),
  holdingType: z.enum(['OLD', 'NEW'], {
    message: 'Holding type must be either OLD or NEW'
  }),
  ownerShipType: z.string().min(1, 'Ownership type is required'),
  owners: z.array(ownerDetailSchema).min(1, 'At least one owner is required'),
  primaryHouseNo: z.string().min(1, 'Primary house number is required'),
  primaryMohalla: z.string().min(1, 'Primary mohalla is required'),
  primaryAddress: z.string().min(1, 'Primary address is required'),
  primaryPinCode: z.string().min(6, 'Primary PIN code must be at least 6 digits'),
  wardArea: z.string().min(1, 'Ward area is required'),
  wardId: z.string().min(1, 'Ward ID is required'),
  assessmentYear: z.string().min(1, 'Assessment year is required'),
  correspondenceAddress: correspondenceAddressSchema.optional(),
  
  // Optional fields that might be empty initially
  ulbId: z.number().optional(),
  propertyTypeId: z.number().optional(),
  roadTypeId: z.number().optional(),
  usageTypeId: z.number().optional(),
  propertyType: z.number().optional(),
  uniquePropertyId: z.string().optional(),
  safNo: z.string().optional(),
  rainWaterHarvest: z.string().optional(),
  plotArea: z.number().optional(),
  builtupGroundArea: z.number().optional(),
  constructionDate: z.string().optional(),
  waterConnType: z.string().optional(),
  waterTaxType: z.string().optional(),
  newHoldingNumber: z.string().optional(),
  wardAreaNo: z.number().optional(),
  ownerShipType_id: z.any().optional(),
  oldHoldingNumber: z.string().optional(),
  oldUniquePropertyId: z.string().optional(),
  corresHouseNo: z.string().optional(),
  corresMohalla: z.string().optional(),
  corresAddress: z.string().optional(),
  corresPincode: z.string().optional(),
  phoneNo: z.string().optional(),
  emailAddress: z.string().email('Please enter a valid email address').or(z.literal('')).optional(),
  khataNo: z.string().optional(),
  plotNo: z.string().optional(),
  maujaName: z.string().optional(),
  thanaNo: z.string().optional(),
  uniqueZone: z.any().optional(),
  zoneId: z.any().optional(),
  zone: z.string().optional(),
  ownerImages: z.record(z.string(), z.any()).optional(),
});

const floorDetailSchema = z
  .object({
    id: z.string(),
    floor: z.string().min(1, 'Please select a floor type'),
    // Allow empty when sub-usage not applicable; we'll enforce at least one of usage/mainUsage below
    usage: z.string().optional(),
    mainUsage: z.string().optional(),
    factor: z.number().min(0.1, 'Factor must be at least 0.1'),
    occupancy: z.string().min(1, 'Please select occupancy type'),
    construction: z.string().min(1, 'Please select construction type'),
    builtArea: z.number().min(1, 'Built area must be greater than 0 square feet'),
    assessFrom: z.string().min(1, 'Please select assessment start date'),
    assessUpto: z.string().optional(),
  })
  .refine(
    (data) => Boolean(data.usage) || Boolean(data.mainUsage),
    {
      message: 'Please select a usage or sub-usage',
      path: ['usage'],
    }
  );

export const propertyDetailsSchema = z.object({
  harvesting: z.string().min(1, 'Please select harvesting option'),
  lateSubmission: z.enum(['Yes', 'No'], {
    message: 'Late submission must be either Yes or No'
  }),
  propertyType: z.string().min(1, 'Please select a property type'),
  roadType: z.string().min(1, 'Please select a road type'),
  plotArea: z.number().min(1, 'Plot area must be greater than 0 square feet'),
  buildUpArea: z.number().min(1, 'Build-up area must be greater than 0 square feet'),
  acquisitionDate: z.string().min(1, 'Please select acquisition/construction date'),
  khataNo: z.string().optional(),
  plotNo: z.string().optional(),
  maujaName: z.string().optional(),
  thanaNo: z.string().optional(),
  constAge: z.string().optional(),
  wardArea: z.string().optional(),
  floorDetails: z.array(floorDetailSchema).min(1, 'At least one floor detail is required'),
});



export const waterConnectionSchema = z.object({
  connectionType: z.string().min(1, 'Please select a water connection type'),
  fixedWaterTax: z.string().min(1, 'Please select water tax status'),
  documents: z
    .record(
      z.string(),
      z.array(z.any()).max(2, 'Maximum 2 files allowed per document type').optional()
    )
    .optional(),
});

export const assessmentFormSchema = z.object({
  basicDetails: basicDetailsSchema,
  propertyDetails: propertyDetailsSchema,
  waterConnection: waterConnectionSchema,
});