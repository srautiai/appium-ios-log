import logger from './logger';
import _ from 'lodash';


// Date-Utils: Polyfills for the Date object
require('date-utils');

const MAX_EVENTS = 5000;

class IOSPerformanceLog {
  constructor (remoteDebugger) {
    this.remoteDebugger = remoteDebugger;

    this.timelineEvents = [];
  }

  async startCapture () {
    logger.debug('Starting performance (Timeline) log capture');
    this.timelineEvents = [];
    return await this.remoteDebugger.startTimeline(this.onTimelineEvent.bind(this));
  }

  async stopCapture () {
    logger.debug('Stopping performance (Timeline) log capture');
    return await this.remoteDebugger.stopTimeline();
  }

  onTimelineEvent (event) {
    logger.debug(`Received Timeline event: ${_.trunc(JSON.stringify(event))}`);
    this.timelineEvents.push(event);

    // if we have too many, get rid of the oldest log line
    if (this.timelineEvents.length > MAX_EVENTS) {
      let removedEvent = this.timelineEvents.shift();
      logger.warn(`Too many Timeline events, removing earliest: ${_.trunc(JSON.stringify(removedEvent))}`);
    }
  }

  getLogs () {
    let events = this.timelineEvents;

    // flush events
    logger.debug('Flushing Timeline events');
    this.timelineEvents = [];

    return events;
  }
}

export default IOSPerformanceLog;
