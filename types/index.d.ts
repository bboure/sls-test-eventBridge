declare namespace jest {
  // noinspection JSUnusedGlobalSymbols
  interface Matchers<R> {
    /**
     * Use `.toHaveReceivedEvents` to check if events have been received in the event-bus
     * @param {Array.<*>} members
     */
    toHaveReceivedEvents(): R;

    /**
     * Use `.toReceiveEventWithDetailType` to check if events have been received with a given detail-type
     */
    toReceiveEventWithDetailType(detailType: string): R;

    /**
     * Use `.tohaveReceivedEventsTimes` to check if n events have been received
     */
    tohaveReceivedEventsTimes(times: number): R;
  }
}
