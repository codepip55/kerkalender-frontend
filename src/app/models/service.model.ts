export class Service {
  id: number
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  service_manager_id: number;
  teams: Team[];
}
export class Team {
  name: string;
  positions: Position[];
}
export class Position {
  name: string;
  members: Member[];
}
export class Member {
  user_id: number;
}
