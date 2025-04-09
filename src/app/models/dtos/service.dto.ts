export class CreateServiceDto {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  service_manager: string;
  teams: TeamsDto[];
}
export class UpdateServiceDto {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  service_manager: string;
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
