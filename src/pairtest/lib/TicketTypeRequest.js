/**
 * Immutable Object.
 */

export default class TicketTypeRequest {
  #type;

  #noOfTickets;

  constructor(type, noOfTickets) {
    const allowedTypes = this.constructor.getTicketTypes();

    if (!allowedTypes.includes(type)) {
      throw new TypeError(
        `type must be ${allowedTypes
          .slice(0, -1)
          .join(", ")}, or ${allowedTypes.slice(-1)}`
      );
    }

    if (!Number.isInteger(noOfTickets) || noOfTickets <= 0)
      throw new TypeError("noOfTickets must be a positive integer");

    this.#type = type;
    this.#noOfTickets = noOfTickets;

    Object.freeze(this);
  }

  getNoOfTickets() {
    return this.#noOfTickets;
  }

  getTicketType() {
    return this.#type;
  }

  static #Type = ["ADULT", "CHILD", "INFANT"];

  static getTicketTypes() {
    return this.#Type;
  }
}
