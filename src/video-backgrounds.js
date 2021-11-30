import { YoutubeBackground } from './youtube-background.js';
import { getRandomIntInclusive } from './utils.js';

export function VideoBackgrounds(selector, params) {
  this.elements = selector;

  if (typeof selector === 'string') {
    this.elements = document.querySelectorAll(selector);
  }

  this.index = {};
  this.re = {};
  this.re.YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;

  this.__init__ = function () {
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];

      const link = element.getAttribute('data-youtube') || element.getAttribute('data-video');
      const vid_data = this.getVidID(link);

      if (!vid_data) {
        continue;
      }

      const uid = this.generateUID(vid_data.id);

      if (!uid) {
        continue;
      }

      switch (vid_data.type) {
        case 'YOUTUBE':
          const yb = new YoutubeBackground(element, params, vid_data.id, uid);
          this.index[uid] = yb;
          break;
      }
    }

    this.initYTPlayers();
  };

  this.__init__();
}

VideoBackgrounds.prototype.getVidID = function (link) {
  if (link !== undefined && link !== null) {
    for (let k in this.re) {
      const pts = link.match(this.re[k]);

      if (pts && pts.length) {
        this.re[k].lastIndex = 0;

        return {
          id: pts[1],
          type: k,
          regex_pts: pts,
          link: link
        };
      }
    }
  }

  return null;
};


VideoBackgrounds.prototype.generateUID = function (pref) {
  //index the instance
  let uid = pref +'-'+ getRandomIntInclusive(0, 9999);
  while (this.index.hasOwnProperty(uid)) {
    uid = pref +'-'+ getRandomIntInclusive(0, 9999);
  }

  return uid;
};

VideoBackgrounds.prototype.pauseVideos = function () {
  for (let k in this.index) {
    this.index[k].pause();
  }
};

VideoBackgrounds.prototype.playVideos = function () {
  for (let k in this.index) {
    this.index[k].play();
  }
};

VideoBackgrounds.prototype.initYTPlayers = function (callback) {
  const self = this;

  window.onYouTubeIframeAPIReady = function () {
    for (let k in self.index) {
      if (self.index[k] instanceof YoutubeBackground) {
        self.index[k].initYTPlayer();
      }
    }

    if (callback) {
      setTimeout(callback, 100);
    }
  };

  if (window.hasOwnProperty('YT') && window.YT.loaded) {
    window.onYouTubeIframeAPIReady();
  }
};
