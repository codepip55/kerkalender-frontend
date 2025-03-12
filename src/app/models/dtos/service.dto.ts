export class CreateServiceDto {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  service_manager_id: number;
  teams: TeamsDto[];
}
export class UpdateServiceDto {
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  service_manager_id: number;
  setlist_id: number;
  teams: TeamsDto[];
}
export class TeamsDto {
  name: string;
  positions: PositionDto[];
}
export class PositionDto {
  name: string;
  members: MemberDto[];
}
export class MemberDto {
  user_id: number;
}
