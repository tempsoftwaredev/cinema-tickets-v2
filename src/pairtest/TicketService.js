import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";

export default class TicketService {
  #paymentService;
  #seatingService;
  #pricing = {};
  #maxTickets;

  constructor(paymentService, seatingService, pricing, maxTickets) {
    const ticketTypes = TicketTypeRequest.getTicketTypes();
    ticketTypes.forEach((type) => {
      if (!(type in pricing))
        throw new Error(`No pricing provided for ${type}`);

      if (!Number.isInteger(pricing[type]) || pricing[type] < 0)
        throw new Error(
          `Pricing for ${type} must be a positive integer (provide it in pence/cents)`
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
    this.#throwIfIncorrectTickets(ticketTypeRequests);
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

  #throwIfIncorrectTickets(tickets) {
    if (!tickets)
      throw new InvalidPurchaseException("ticket-service.no-tickets-provided");
    if (!tickets.every((t) => t instanceof TicketTypeRequest))
      throw new InvalidPurchaseException("ticket-service.invalid-tickets");

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
