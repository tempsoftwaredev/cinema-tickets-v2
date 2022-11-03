import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";

export default class TicketService {
  #paymentService;
  #seatingService;
  #pricing = {
    ADULT: undefined,
    CHILD: undefined,
    INFANT: undefined,
  };
  #maxTickets;

  constructor(paymentService, seatingService, pricing, maxTickets) {
    Object.keys(this.#pricing).forEach((type) => {
      if (!(type in pricing))
        throw new Error(`No pricing provided for ${type}`);

      if (!Number.isInteger(pricing[type]))
        throw new Error(
          `Pricing for ${type} must be an integer (provide it in pence/cents)`
        );

      this.#pricing[type] = pricing[type];
    });
    Object.freeze(pricing);

    this.#paymentService = paymentService;
    this.#seatingService = seatingService;
    this.#maxTickets = maxTickets;

    Object.freeze(this);
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // Validation
    this.#throwIfTooManyTickets(ticketTypeRequests);
    this.#throwIfNoAdultTickets(ticketTypeRequests);
    const numericAccountId = this.#convertIdOrThrow(accountId);

    // process payment
    const totalPrice = this.#calculatePrice(ticketTypeRequests);
    this.#paymentService.makePayment(numericAccountId, totalPrice);

    // reserve seats
    const totalSeats = this.#calculateSeats(ticketTypeRequests);
    this.#seatingService.reserveSeat(numericAccountId, totalSeats);

    return true;
  }

  #convertIdOrThrow(id) {
    const converted = () => {
      if (typeof id !== "string" && typeof id !== "number") return false;
      if (isNaN(id)) return false;

      const integer = Number(id);
      if (integer <= 0) return false;

      return integer;
    };

    const result = converted();

    if (!result)
      throw new InvalidPurchaseException("ticket-service.invalid-account-id");

    return result;
  }

  #throwIfTooManyTickets(tickets) {
    const totalTickets = tickets.reduce(
      (total, ticket) => total + ticket.getNoOfTickets(),
      0
    );
    if (totalTickets > this.#maxTickets)
      throw new InvalidPurchaseException("ticket-service.too-many-tickets");
    if (totalTickets === 0)
      throw new InvalidPurchaseException("ticket-service.no-tickets-provided");
  }

  #throwIfNoAdultTickets(tickets) {
    const includesAdults = tickets.some((t) => t.getTicketType() === "ADULT");
    if (!includesAdults)
      throw new InvalidPurchaseException("ticket-service.missing-adult-ticket");
  }

  #calculatePrice(tickets) {
    return tickets.reduce(
      (total, ticket) =>
        total + this.#pricing[ticket.getTicketType()] * ticket.getNoOfTickets(),
      0
    );
  }

  #calculateSeats(tickets) {
    return tickets.reduce((total, ticket) => {
      if (ticket.getTicketType() === "INFANT") return total;
      return total + ticket.getNoOfTickets();
    }, 0);
  }
}
