var playlist = [{
  title: 'Tarantelle, Op. 43',
  author: 'Frédéric Chopin',
  src: './assets/audio/chopin-tarantelle-op43.mp3',
  background: './assets/img/backgrounds/5938870365_a0c951015b_o.jpg',
}, {
  title: 'Andantino \'Spring\', B. 117',
  author: 'Frédéric Chopin',
  src: './assets/audio/chopin-spring.mp3',
  background: './assets/img/backgrounds/5966942286_682dcb45b6_o.jpg',
}, {
  title: 'Mazurka in D major, B. 4',
  author: 'Frédéric Chopin',
  src: './assets/audio/chopin-mazurka-in-d-major-b4.mp3',
  background: './assets/img/backgrounds/6181316022_a513b78a87_o.jpg',
}, {
  title: 'Mazurka in D major, B. 71',
  author: 'Frédéric Chopin',
  src: './assets/audio/chopin-mazurka-in-d-major-b71.mp3',
  background: './assets/img/backgrounds/6284055448_e0d5c1af67_o.jpg',
}];

var ChopinPlayer = function (playlist) {
  this.ui = {
    controlsContainer: document.querySelector('.player'),
    controls: {
      playPause: document.querySelector('.play-pause-button'),
      playlist: document.querySelector('.playlist-button'),
      next: document.querySelector('.next-button'),
      prev: document.querySelector('.prev-button'),
      playlistClose: document.querySelector('.playlist-close-button'),
    },
    trackInfo: {
      title: document.querySelector('.current-track-title'),
      author: document.querySelector('.current-track-author'),
      time: document.querySelector('.elapsed-time'),
    },
    circles: {
      infoContainer: document.querySelector('.center-circle'),
      progressBar: document.querySelector('.progress'),
      progressBarBg: document.querySelector('.progress-bg'),
      seeker: document.querySelector('.seeker'),
    },
    playlistLines: {
      progressBar: document.querySelector('.playlist-progress'),
      progressBarBg: document.querySelector('.playlist-top-line'),
    },
  };
  
  this.playlist = playlist;
  this.currentTrek = 0;
  this.playing = false;

  this.init();
}

ChopinPlayer.prototype.utils = {
  precisionRound: function (number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  },
  getPercentageOnCircle: function (pointerX, pointerY) {
    var decartX = pointerX - window.innerWidth / 2;
    var decartY = -1 * pointerY + window.innerHeight / 2;
    var n = 270 - (Math.atan2(0 - (decartY), 0 - decartX)) * 180 / Math.PI;
    var angle = n % 360;
    return angle / 360;
  },
  getPercentageOnLine: function (pointerX, lineStart, lineWidth) {
    return (pointerX - lineStart) / lineWidth;
  },
  clockDisplay: function(value) {
    return value < 10 ? ('0' + value) : value; 
  }
};

ChopinPlayer.prototype.init = function() {
  this.audio = document.createElement('audio'),  
  this.renderPlaylist();
  this.loadTrek(this.currentTrek);
  this.listenToEvents();
}

ChopinPlayer.prototype.renderPlaylist = function() {
  var xmlns = "http://www.w3.org/2000/svg";
  var playlistContainer = document.createElementNS(xmlns, "g");
  var self = this;
  playlistContainer.setAttributeNS(null, "class", 'playlist-container playlist-visible');
  
  playlist.forEach(function(trek, index) {
    var track = document.createElementNS(xmlns, "g");
    track.setAttributeNS(null, "class", 'track-container');

    var title = document.createElementNS(xmlns, "text");
    title.setAttributeNS(null, "class", 'track-title');
    title.setAttributeNS(null, "track", 'track-title');
    title.setAttributeNS(null, "y", 120 * index + 160);
    title.setAttributeNS(null, "x", 300);
    title.setAttributeNS(null, "text-anchor", 'middle');
    title.appendChild(document.createTextNode(trek.title));
    track.appendChild(title);

    var author = document.createElementNS(xmlns, "text");
    author.setAttributeNS(null, "class", 'track-author');
    author.setAttributeNS(null, "y", 120 * index + 190);
    author.setAttributeNS(null, "x", 300);
    author.setAttributeNS(null, "text-anchor", 'middle');
    author.appendChild(document.createTextNode(trek.author));

    track.appendChild(author);

    playlistContainer.appendChild(track);

    track.addEventListener('click', function() {
      self.loadTrek(index);
      self.toggleAudio();
      self.hidePlaylist();
    });
  });
  this.ui.controlsContainer.appendChild(playlistContainer);
}

ChopinPlayer.prototype.loadTrek = function(trackIndex) {
  if (trackIndex > this.playlist.length) {
    return;
  }
  document.body.classList.add('fade-out');
  this.ui.trackInfo.title.textContent = this.playlist[trackIndex].title;
  this.ui.trackInfo.author.textContent = this.playlist[trackIndex].author;

  this.audio.src = this.playlist[trackIndex].src;
  this.ui.trackInfo.time.textContent = '00:00';
  setTimeout(function(){
    document.body.style.backgroundImage = 'url(' + playlist[trackIndex].background + ')';
  }, 500)
  setTimeout(function(){
    document.body.classList.remove('fade-out');
  }, 1000)
  this.currentTrek = trackIndex;
  this.renderProgress(0);
}

ChopinPlayer.prototype.getCurrentProgress = function() {
  return this.utils.precisionRound(this.audio.currentTime / this.audio.duration, 2);
}

ChopinPlayer.prototype.renderProgress = function(progressPercentage) {
  var progressBarCircumference = parseInt(this.ui.circles.progressBar.getAttribute('stroke-dasharray'), 10);
  var dashoffset = progressBarCircumference * (1 - progressPercentage);
  this.ui.circles.progressBar.setAttribute('stroke-dashoffset', dashoffset);

  var minutesElapsed = Math.floor(this.audio.currentTime / 60);
  var secondsValue = Math.floor(this.audio.currentTime - minutesElapsed * 60);
  this.ui.trackInfo.time.textContent = this.utils.clockDisplay(minutesElapsed) + ':' +
    this.utils.clockDisplay(secondsValue);

  var playlistProgressBarLength = parseInt(this.ui.playlistLines.progressBar.getAttribute('stroke-dasharray'), 10);
  this.ui.playlistLines.progressBar.setAttribute('stroke-dashoffset',
    playlistProgressBarLength - playlistProgressBarLength * progressPercentage);
}

ChopinPlayer.prototype.next = function() {
  this.currentTrek = this.currentTrek === (this.playlist.length - 1) ? 0 : this.currentTrek + 1;
  this.playTrack();
}

ChopinPlayer.prototype.prev = function() {
  this.currentTrek = !this.currentTrek ? this.playlist.length - 1 : this.currentTrek - 1;
  this.playTrack();
}

ChopinPlayer.prototype.playTrack = function() {
  this.audio.pause();
  this.loadTrek(this.currentTrek);
  if (this.playing) {
    this.audio.play();
  }
}

ChopinPlayer.prototype.toggleAudio = function(){
  if (this.audio.paused) {
    this.audio.play();
    this.playing = true;
  } else {
    this.audio.pause();
    this.playing = false;
  }
};

ChopinPlayer.prototype.showPlaylist = function() {
  var self = this;
  this.ui.circles.infoContainer.setAttribute('stroke-dashoffset',
    this.ui.circles.infoContainer.getAttribute('stroke-dasharray'));
  this.ui.circles.progressBarBg.setAttribute('stroke-dashoffset',
    this.ui.circles.progressBarBg.getAttribute('stroke-dasharray'));
  this.ui.circles.progressBar.setAttribute('stroke-dashoffset',
    this.ui.circles.progressBar.getAttribute('stroke-dasharray'));

  this.ui.controlsContainer.classList.add('playlist');

  setTimeout(function() {
    self.ui.controlsContainer.classList.add('hide-controls');
  }, 1000);
}

ChopinPlayer.prototype.hidePlaylist = function() {
  this.ui.controlsContainer.classList.remove('hide-controls');
  setTimeout((function() {
    this.ui.controlsContainer.classList.remove('playlist');
    this.ui.circles.infoContainer.setAttribute('stroke-dashoffset', 0);
    this.ui.circles.progressBarBg.setAttribute('stroke-dashoffset', 0);
    this.renderProgress(this.getCurrentProgress());
  }).bind(this), 200);
}

ChopinPlayer.prototype.progressCircleClick = function(e) {
  var percentage = this.utils.getPercentageOnCircle(e.pageX, e.pageY);
  this.audio.currentTime = this.audio.duration * percentage;
}

ChopinPlayer.prototype.progressLineClick = function(e) {
  var lineBoundingRect = this.ui.playlistLines.progressBarBg.getBoundingClientRect();
  var percentage = this.utils.getPercentageOnLine(e.pageX, lineBoundingRect.x, lineBoundingRect.width);
  this.audio.currentTime = this.audio.duration * percentage;
}

ChopinPlayer.prototype.setSmoothTransitions = function() {
  this.ui.circles.progressBar.style.transitionDuration = (this.audio.duration / 100) + 's';
  this.ui.playlistLines.progressBar.style.transitionDuration = (this.audio.duration / 100) + 's';
}

ChopinPlayer.prototype.onAudioTimeUpdate = function() {
  this.renderProgress(this.getCurrentProgress() || 0);
}

ChopinPlayer.prototype.listenToEvents = function() {
  this.audio.addEventListener('loadedmetadata', this.setSmoothTransitions.bind(this), false);
  this.audio.addEventListener('timeupdate', this.onAudioTimeUpdate.bind(this), false);
  this.audio.addEventListener('ended', this.next.bind(this));

  this.ui.controls.next.addEventListener('click', this.next.bind(this), false);
  this.ui.controls.prev.addEventListener('click', this.prev.bind(this), false);
  this.ui.controls.playPause.addEventListener('click', this.toggleAudio.bind(this), false);
  this.ui.controls.playlist.addEventListener('click', this.showPlaylist.bind(this), false);
  this.ui.controls.playlistClose.addEventListener('click', this.hidePlaylist.bind(this), false);

  this.ui.circles.seeker.addEventListener('click', this.progressCircleClick.bind(this), false);

  this.ui.playlistLines.progressBarBg.addEventListener('click', this.progressLineClick.bind(this), false);
}

var player = new ChopinPlayer(playlist);
