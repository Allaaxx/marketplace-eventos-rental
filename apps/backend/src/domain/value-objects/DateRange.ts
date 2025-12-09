export class DateRange {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date {
    return this.endDate;
  }

  getDurationInDays(): number {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  overlaps(other: DateRange): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}
