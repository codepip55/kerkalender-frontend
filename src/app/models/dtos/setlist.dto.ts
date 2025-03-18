export class CreateSetlistDto {
  songs: SongDto[];
}
export class SongDto {
  title: string;
  artist: string;
  spotify_link: string;
  key: string;
  vocal_notes: string;
  band_notes: string;
}
