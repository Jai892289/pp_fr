export interface SurveyDetail {
  id: string;
  user_id: number | null;
  user_charge_id: string | null;
  is_verified: boolean;
  entry_ip: string | null;
  qr_number: string | null;
  created_at: string;

  updated_at: string | null;
  verified_by: number | null;
  doc_path: string[];
  user_charge_data: UserChargeData | null;
  user_full_name: string | null;
  current_waste_collection_status?: boolean
}

export interface UserChargeData {
  id: string;
  mc_name: string | null;
  pid_type: string | null;
  property_id: string | null;
  owner_name: string | null;
  integrated_property_id: string | null;
  integrated_owner_name: string | null;
  latitude: string | null;
  longitude: string | null;
  authority: string | null;
  colony: string | null;
  address: string | null;
  mobile: string | null;
  category: string | null;
  type: string | null;
  sub_type: string | null;
  area: string | null;
  unit: string | null;
  authorized_area: string | null;
  property_image: string | null;
  bill_sequence: string | null;
  is_selfcertified: string | null;
  qr_number: string | null;
  user_full_name: string | null;
}

export interface SurveyCountDetail {
  taggedCount: number | 0;
  totalConsumerCount: number | 0;
  unTaggedCount: number | 0;
  surveyorCount: number | 0;
  driverCount: number | 0;
  todaysWasteCollection: number | 0;
}
