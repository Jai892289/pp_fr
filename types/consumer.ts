export interface ConsumerDetail {
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
  // is_selfcertified: string | null;
  is_tagged: string | null;
  qr_number: string | null;
  current_waste_collection_status: boolean | null;
}