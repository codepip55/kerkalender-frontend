export class Service {
  _id: number
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  service_manager: number;
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
