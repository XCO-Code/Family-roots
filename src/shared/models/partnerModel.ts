export interface Partner {
  id: string;
  person_id: string;
  partner_id: string;
  married?: string;
  divorced?: string;
}

export interface CreatePartnerDto {
  person_id: string;
  partner_id: string;
  married?: string;
  divorced?: string;
}

export interface UpdatePartnerDto {
  married?: string;
  divorced?: string;
}
