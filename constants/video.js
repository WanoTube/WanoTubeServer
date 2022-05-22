const VideoType = {
  SHORT: 'SHORT',
  NORMAL: 'NORMAL'
};
const VideoTag = {
  MUSIC: 'MUSIC',
  SPORT: 'SPORT',
  CUISINE: 'CUISINE',
  GAME: 'GAME',
  CARTOON: 'CARTOON',
  TVSHOW: 'TVSHOW',
  EDUCATION: 'EDUCATION',
  CULTURE: 'CULTURE',
  MOVIE: 'MOVIE',
  NATURE: 'NATURE',
  HISTORY: 'HISTORY',
  GEOGRAPHY: 'GEOGRAPHY',
  OTHER: 'OTHER'
}
const ProcessStatus = {
  ERROR: 'ERROR',
  PROCESSING: 'PROCESSING',
  CHECKING: 'CHECKING',
  COMPLETED: 'COMPLETED'
}

module.exports = {
  VideoTag,
  VideoType,
  ProcessStatus
}