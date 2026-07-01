class Email {
  constructor(value) {
    if (!Email.isValid(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
    this.value = value;
  }

  static isValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  toString() {
    return this.value;
  }
}

module.exports = Email;
