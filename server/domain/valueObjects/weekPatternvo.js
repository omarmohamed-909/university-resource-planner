const VALID_PATTERNS = ['weekly', 'odd', 'even'];

const VALID_DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

class WeekPattern {
  constructor(value) {
    if (!VALID_PATTERNS.includes(value)) {
      throw new Error(`Invalid week pattern: ${value}. Must be one of: ${VALID_PATTERNS.join(', ')}`);
    }
    this.value = value;
  }

  static isValid(value) {
    return VALID_PATTERNS.includes(value);
  }

  static get validPatterns() {
    return [...VALID_PATTERNS];
  }

  static get validDays() {
    return [...VALID_DAYS];
  }

  matchesWeek(weekNumber) {
    if (this.value === 'weekly') return true;
    if (this.value === 'odd') return weekNumber % 2 === 1;
    if (this.value === 'even') return weekNumber % 2 === 0;
    return false;
  }

  toString() {
    return this.value;
  }
}

WeekPattern.VALID_PATTERNS = VALID_PATTERNS;
WeekPattern.VALID_DAYS = VALID_DAYS;

module.exports = WeekPattern;
