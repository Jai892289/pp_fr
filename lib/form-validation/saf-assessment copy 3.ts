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



// export const basicDetailsSchema = z.object({
//   ulbId: z.number().min(1, 'ULB ID is required'),
//   propertyTypeId: z.number().min(1, 'Property type is required'),
//   roadTypeId: z.number().min(1, 'Road type is required'),
//   usageTypeId: z.number().min(1, 'Usage type is required'),
//   propertyType: z.number().min(1, 'Property type is required'),
//   uniquePropertyId: z.string().min(1, 'Unique property ID is required'),
//   safNo: z.string().min(1, 'SAF number is required'),
//   primaryContactNo: z.string().min(10, 'Valid contact number is required'),
//   rainWaterHarvest: z.string().min(1, 'Rain water harvest selection is required'),
//   plotArea: z.number().min(1, 'Plot area is required'),
//   builtupGroundArea: z.number().min(1, 'Built-up ground area is required'),
//   constructionDate: z.string().min(1, 'Construction date is required'),
//   waterConnType: z.string().min(1, 'Water connection type is required'),
//   waterTaxType: z.string().min(1, 'Water tax type is required'),
//   holdingType: z.string().min(1, 'Holding type is required'),
//   newHoldingNumber: z.string().optional(),
//   wardAreaNo: z.number().min(1, 'Ward area is required'),
//   ownerShipType_id: z.number().min(1, 'Ownership type is required'),
//   ownerShipType: z.number().min(1, 'Ownership type is required'),
//   owners: z.array(ownerDetailSchema).min(1, 'At least one owner is required'),
//   oldHoldingNumber: z.string().optional(),
//   oldUniquePropertyId: z.string().optional(),
//   primaryHouseNo: z.string().min(1, 'House number is required'),
//   primaryMohalla: z.string().min(1, 'Mohalla is required'),
//   primaryAddress: z.string().min(1, 'Address is required'),
//   primaryPinCode: z.string().min(6, 'Valid PIN code is required'),
//   corresHouseNo: z.string().optional(),
//   corresMohalla: z.string().optional(),
//   corresAddress: z.string().optional(),
//   corresPincode: z.string().optional(),
//   phoneNo: z.string().optional(),
//   emailAddress: z.string().email('Valid email is required').optional().or(z.literal('')),
//   khataNo: z.string().optional(),
//   plotNo: z.string().optional(),
//   maujaName: z.string().optional(),
//   thanaNo: z.string().optional(),
//   zoneId: z.number().optional(),
// });



export const basicDetailsSchema = z.any();

const floorDetailSchema = z.object({
  id: z.string(),
  floor: z.string().min(1, 'Floor selection is required'),
  usage: z.string().min(1, 'Usage type is required'),
  factor: z.number().min(0, 'Factor must be positive'),
  occupancy: z.string().min(1, 'Occupancy is required'),
  construction: z.string().min(1, 'Construction type is required'),
  builtArea: z.number().min(1, 'Built area is required'),
  constAge: z.string().min(1, 'Construction age is required'),
  assessFrom: z.string().min(1, 'Assessment from date is required'),
  assessUpto: z.string().optional(),
});

export const propertyDetailsSchema = z.object({
  harvesting: z.string().min(1, 'Harvesting selection is required'),
  lateSubmission: z.enum(['Yes', 'No']),
  propertyType: z.string().min(1, 'Property type is required'),
  roadType: z.string().min(1, 'Road type is required'),
  plotArea: z.number().min(1, 'Plot area is required'),
  buildUpArea: z.number().min(1, 'Build-up area is required'),
  acquisitionDate: z.string().min(1, 'Acquisition date is required'),
  khataNo: z.string().optional(),
  plotNo: z.string().optional(),
  maujaName: z.string().optional(),
  thanaNo: z.string().optional(),
  floorDetails: z.array(floorDetailSchema).min(1, 'At least one floor detail is required'),
});



export const waterConnectionSchema = z.object({
  connectionType: z.string().min(1, 'Connection type is required'),
  fixedWaterTax: z.string().min(1, 'Fixed water tax selection is required'),
  documents: z
    .record(
      z.string(),
      z.array(
        z.custom<File>((v) => typeof File !== 'undefined' && v instanceof File, 'Invalid file')
      ).max(2, 'You can upload up to 2 files')
    )
    .optional(),
});

export const assessmentFormSchema = z.object({
  basicDetails: basicDetailsSchema,
  propertyDetails: propertyDetailsSchema,
  waterConnection: waterConnectionSchema,
});