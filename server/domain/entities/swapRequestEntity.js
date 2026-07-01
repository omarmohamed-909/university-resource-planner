class SwapRequest {
  constructor({ id, requesterId, originalScheduleId, proposedHallId, proposedDay, proposedStartTime, proposedEndTime, reason, status }) {
    this.id = id;
    this.requesterId = requesterId;
    this.originalScheduleId = originalScheduleId;
    this.proposedHallId = proposedHallId;
    this.proposedDay = proposedDay;
    this.proposedStartTime = proposedStartTime;
    this.proposedEndTime = proposedEndTime;
    this.reason = reason;
    this.status = status || 'pending';
  }

  approve() {
    this.status = 'approved';
  }

  reject() {
    this.status = 'rejected';
  }

  isPending() {
    return this.status === 'pending';
  }
}

module.exports = SwapRequest;
