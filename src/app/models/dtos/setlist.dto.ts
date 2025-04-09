export class CreateSetlistDto {
  service: string;

  songs: {
    title: string;
    artist: string;
    spotify_link: string;
    key: string;
    vocal_notes: string;
    band_notes: string;
  }[];
}
