export class CreateSetlistDto {
  songs: SongDto[];
}
export class SongDto {
  name: string;
  artist: string;
  spotifyLink: string;
  key: string;
  vocalNotes: string;
  bandNotes: string;
}
